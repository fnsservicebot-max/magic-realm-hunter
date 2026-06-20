// combat.js — 戰鬥模擬（含動畫、暴擊、技能效果）
// V_0602

const Combat = {
  // 戰鬥動畫回呼
  onAttack: null,    // 玩家攻擊時
  onMonsterHit: null,// 怪物被擊中
  onMonsterAttack: null, // 怪物攻擊
  onPlayerHit: null, // 玩家被擊中
  onVictory: null,   // 戰勝
  onDefeat: null,    // 死亡
  onBossEncounter: null, // Boss 出現

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
      if (this.onAttack) this.onAttack(monster);
      const dmg = this.calcDamage(hunter, monster);
      mHp -= dmg;
      log.push(`⚔️ 攻擊：${dmg} 傷害`);
      if (this.onMonsterHit) this.onMonsterHit(monster, dmg);

      if (mHp <= 0) break;

      // 怪物反擊
      if (this.onMonsterAttack) this.onMonsterAttack(monster);
      const mDmg = Math.max(1, monster.atk - hunter.def);
      hHp -= mDmg;
      log.push(`💥 ${monster.name_zh || monster.name_en} 反擊：${mDmg} 傷害`);
      if (this.onPlayerHit) this.onPlayerHit(monster, mDmg);

      turn++;
      // 動畫節奏：每回合約 600ms
      // 但因為這是 sync 函式，動畫是非同步的
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

  calcDamage(attacker, defender) {
    let dmg = attacker.atk;
    const critRate = attacker.critRate || 0.05;
    if (Math.random() < critRate) {
      dmg = Math.floor(dmg * (attacker.critDmg || 1.5));
    }
    // 浮動 ±10%
    dmg = Math.floor(dmg * (0.9 + Math.random() * 0.2));
    return Math.max(1, dmg);
  }
};

window.Combat = Combat;