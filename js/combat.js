// combat.js — 戰鬥模擬（含動畫、暴擊、閃避、命中、技能效果）
// V_0620 — 命中機制 + 技能 buff 整合

const Combat = {
  // 戰鬥動畫回呼
  onAttack: null,    // 玩家攻擊時
  onMonsterHit: null,// 怪物被擊中
  onMonsterAttack: null, // 怪物攻擊
  onPlayerHit: null, // 玩家被擊中
  onVictory: null,   // 戰勝
  onDefeat: null,    // 死亡
  onBossEncounter: null, // Boss 出現
  onCrit: null,      // 任一方暴擊
  onDodge: null,     // 任一方閃避
  onMiss: null,      // 任一方未命中

  simulate(hunter, monster) {
    let hHp = hunter.hp;
    let mHp = monster.hp;
    let turn = 0;
    let playerStunned = false;
    let firstStrikeDone = false;
    const log = [];
    const isBoss = monster.isBoss || false;

    // Boss 戰過場
    if (isBoss && this.onBossEncounter) {
      this.onBossEncounter(monster);
    }

    // 玩家有效屬性（含技能 buff）
    const eff = (typeof Skills !== 'undefined')
      ? Skills.getEffectiveStats(hunter)
      : null;
    const pAtk = eff ? eff.atk : hunter.atk;
    const pCrit = eff ? eff.critRate : (hunter.critRate || 0.05);
    const pCritDmg = eff ? eff.critDmg : (hunter.critDmg || 1.5);
    const pHit = eff ? eff.hitRate : (hunter.hitRate || 0.95);
    const pDodge = eff ? eff.dodgeRate : (hunter.dodgeRate || 0.05);
    const pReduction = eff ? eff.damageReduction : 0;

    // 怪物屬性（複製並補上預設值）
    const mAtk = monster.atk;
    const mCrit = monster.critRate || 0.05;
    const mCritDmg = monster.critDmg || 1.5;
    const mHit = monster.hitRate || 0.90;
    const mDodge = monster.dodgeRate || 0.02;

    // 先制攻擊（spear_2）
    if (hunter.skills && hunter.skills.spear_2 > 0) {
      const r = this.attackWithStats(pAtk, pCrit, pCritDmg, pHit, mDodge);
      if (r.missed) {
        log.push('💨 先制攻擊未命中！');
        if (this.onMiss) this.onMiss(hunter, monster);
      } else if (r.dodged) {
        log.push(`💨 ${monster.name_zh || monster.name_en} 閃避了先制攻擊！`);
        if (this.onDodge) this.onDodge(monster, hunter);
      } else {
        mHp -= r.dmg;
        log.push(r.crit ? `💥 先制暴擊！攻擊：${r.dmg} 傷害` : `⚔️ 先制攻擊：${r.dmg} 傷害`);
        if (this.onMonsterHit) this.onMonsterHit(monster, r.dmg, r.crit);
      }
      firstStrikeDone = true;
    }

    while (hHp > 0 && mHp > 0 && turn < 50) {
      // 玩家攻擊（若暈眩則跳過）
      if (playerStunned) {
        log.push('😵 你被暈眩，無法行動！');
        playerStunned = false;
      } else {
        // 檢查 multi_hit（弓/雙刀連擊）
        const hits = (hunter.skills && hunter.skills.bow_2 > 0) ? 2 : 1;
        let totalDmg = 0;
        let anyCrit = false;
        for (let i = 0; i < hits; i++) {
          const r = this.attackWithStats(pAtk, pCrit, pCritDmg, pHit, mDodge);
          if (r.missed) {
            log.push(`💨 第 ${i+1} 擊未命中`);
            if (this.onMiss) this.onMiss(hunter, monster);
            continue;
          }
          if (r.dodged) {
            log.push(`💨 第 ${i+1} 擊被閃避`);
            if (this.onDodge) this.onDodge(monster, hunter);
            continue;
          }
          totalDmg += r.dmg;
          if (r.crit) anyCrit = true;
          if (this.onMonsterHit) this.onMonsterHit(monster, r.dmg, r.crit);
        }
        mHp -= totalDmg;
        if (totalDmg > 0) {
          if (hits > 1) {
            log.push(anyCrit ? `💥 連擊暴擊！總傷害：${totalDmg}` : `🗡️ ${hits} 連擊，總傷害：${totalDmg}`);
          } else {
            log.push(anyCrit ? `💥 暴擊！攻擊：${totalDmg} 傷害` : `⚔️ 攻擊：${totalDmg} 傷害`);
          }
        }
      }

      if (mHp <= 0) break;

      // 怪物反擊
      const mResult = this.attackWithStats(mAtk, mCrit, mCritDmg, mHit, pDodge);
      if (mResult.missed) {
        log.push(`💨 ${monster.name_zh || monster.name_en} 攻擊未命中！`);
        if (this.onMiss) this.onMiss(monster, hunter);
      } else if (mResult.dodged) {
        log.push(`💨 你閃避了 ${monster.name_zh || monster.name_en} 的攻擊！`);
        if (this.onDodge) this.onDodge(hunter, monster);
      } else {
        const reduced = Math.floor(mResult.dmg * (1 - pReduction));
        hHp -= reduced;
        log.push(mResult.crit
          ? `💥 ${monster.name_zh || monster.name_en} 暴擊！反擊：${reduced} 傷害`
          : `💥 ${monster.name_zh || monster.name_en} 反擊：${reduced} 傷害`);
        if (this.onPlayerHit) this.onPlayerHit(monster, reduced, mResult.crit);
      }

      turn++;
    }

    const victory = mHp <= 0;
    if (victory && this.onVictory) this.onVictory(monster);
    if (!victory && this.onDefeat) this.onDefeat(monster);

    return {
      victory,
      log,
      damageDealt: monster.hp - Math.max(0, mHp),
      damageTaken: hunter.hp - Math.max(0, hHp)
    };
  },

  // 單次攻擊（含命中 + 閃避 + 暴擊）
  // 接收純粹的數字參數，避免依賴 attacker 物件
  attackWithStats(atk, critRate, critDmg, hitRate, defenderDodge) {
    // 1. 命中判定（先於閃避）
    const cappedHit = Math.min(0.99, hitRate);
    if (Math.random() > cappedHit) {
      return { dmg: 0, crit: false, dodged: false, missed: true };
    }

    // 2. 閃避判定
    if (Math.random() < (defenderDodge || 0)) {
      return { dmg: 0, crit: false, dodged: true, missed: false };
    }

    // 3. 暴擊判定
    const cappedCrit = Math.min(0.95, critRate);
    let crit = Math.random() < cappedCrit;
    let dmg = atk;
    if (crit) {
      dmg = Math.floor(dmg * critDmg);
    }

    // 4. 浮動 ±10%
    dmg = Math.floor(dmg * (0.9 + Math.random() * 0.2));

    return { dmg, crit, dodged: false, missed: false };
  },

  // 舊版 attack（保留向後相容）
  attack(attacker, defender) {
    const hitRate = attacker.hitRate !== undefined ? attacker.hitRate : 0.95;
    const critRate = attacker.critRate || 0.05;
    const critDmg = attacker.critDmg || 1.5;
    const dodgeRate = defender.dodgeRate || 0;
    return this.attackWithStats(attacker.atk, critRate, critDmg, hitRate, dodgeRate);
  },

  // 舊版 calcDamage（保留向後相容）
  calcDamage(attacker, defender) {
    return this.attack(attacker, defender).dmg;
  }
};

window.Combat = Combat;