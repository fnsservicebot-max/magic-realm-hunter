// combat.js — 戰鬥模擬（含動畫、暴擊、閃避、技能效果）
// V_0613 — 閃避 + 暴擊

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

  simulate(hunter, monster) {
    let hHp = hunter.hp;
    let mHp = monster.hp;
    let turn = 0;
    const log = [];
    const isBoss = monster.isBoss || false;

    // Boss 戰過場
    if (isBoss && this.onBossEncounter) {
      this.onBossEncounter(monster);
    }

    while (hHp > 0 && mHp > 0 && turn < 50) {
      // 玩家攻擊
      const result = this.attack(hunter, monster);
      if (result.dodged) {
        log.push(`💨 ${monster.name_zh || monster.name_en} 閃避了攻擊！`);
      } else {
        mHp -= result.dmg;
        log.push(result.crit ? `💥 暴擊！攻擊：${result.dmg} 傷害` : `⚔️ 攻擊：${result.dmg} 傷害`);
        if (this.onMonsterHit) this.onMonsterHit(monster, result.dmg, result.crit);
      }

      if (mHp <= 0) break;

      // 怪物反擊
      const mResult = this.attack(monster, hunter);
      if (mResult.dodged) {
        log.push(`💨 你閃避了 ${monster.name_zh || monster.name_en} 的攻擊！`);
      } else {
        hHp -= mResult.dmg;
        log.push(mResult.crit ? `💥 ${monster.name_zh || monster.name_en} 暴擊！反擊：${mResult.dmg} 傷害` : `💥 ${monster.name_zh || monster.name_en} 反擊：${mResult.dmg} 傷害`);
        if (this.onPlayerHit) this.onPlayerHit(monster, mResult.dmg, mResult.crit);
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

  // 單次攻擊（含閃避 + 暴擊）
  attack(attacker, defender) {
    // 1. 閃避判定（先於暴擊）
    const dodgeRate = defender.dodgeRate || 0;
    if (Math.random() < dodgeRate) {
      if (this.onDodge) this.onDodge(defender, attacker);
      return { dmg: 0, crit: false, dodged: true };
    }

    // 2. 暴擊判定
    const critRate = attacker.critRate || 0.05;
    let crit = Math.random() < critRate;
    let dmg = attacker.atk;
    if (crit) {
      dmg = Math.floor(dmg * (attacker.critDmg || 1.5));
      if (this.onCrit) this.onCrit(attacker, defender, dmg);
    }

    // 3. 浮動 ±10%
    dmg = Math.floor(dmg * (0.9 + Math.random() * 0.2));

    // 4. 防禦減傷（最低 1）
    if (defender.def !== undefined) {
      dmg = Math.max(1, dmg - Math.floor(defender.def * 0.5));
    }

    return { dmg, crit, dodged: false };
  },

  // 舊版 calcDamage（保留向後相容）
  calcDamage(attacker, defender) {
    return this.attack(attacker, defender).dmg;
  }
};

window.Combat = Combat;