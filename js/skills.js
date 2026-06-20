// skills.js — 技能樹系統
// V_0620 — 完整技能效果實作（speed_mult 改為命中/閃避）
// 7 武器技能樹（每 4-5 技能）+ 共用技能樹（4 類：攻擊/防禦/採集/幸運）

const Skills = {
  // 武器專屬技能
  weaponTrees: {
    sword: [
      { id: 'sword_1', name_zh: '橫斬', name_en: 'Slash', desc_zh: '攻擊力 +5%', desc_en: 'ATK +5%', cost: 1, max: 5, type: 'atk_mult', value: 0.05 },
      { id: 'sword_2', name_zh: '鋒利之刃', name_en: 'Sharp Blade', desc_zh: '命中 +4%', desc_en: 'Hit Rate +4%', cost: 2, max: 5, type: 'hit_rate', value: 0.04 },
      { id: 'sword_3', name_zh: '劍氣', name_en: 'Sword Aura', desc_zh: '暴擊率 +3%', desc_en: 'Crit Rate +3%', cost: 2, max: 5, type: 'crit_rate', value: 0.03 },
      { id: 'sword_4', name_zh: '迴旋斬', name_en: 'Whirlwind', desc_zh: '全體傷害 +20%', desc_en: 'AoE +20%', cost: 3, max: 1, type: 'aoe', value: 0.20 },
      { id: 'sword_5', name_zh: '聖劍降臨', name_en: 'Holy Blade', desc_zh: '終極技能，攻擊力 +50%', desc_en: 'Ultimate, ATK +50%', cost: 5, max: 1, requires: 'sword_4', type: 'atk_mult', value: 0.50 }
    ],
    spear: [
      { id: 'spear_1', name_zh: '突刺', name_en: 'Thrust', desc_zh: '攻擊力 +6%', desc_en: 'ATK +6%', cost: 1, max: 5, type: 'atk_mult', value: 0.06 },
      { id: 'spear_2', name_zh: '先制', name_en: 'Initiative', desc_zh: '先制攻擊（敵人無法反擊）', desc_en: 'Preemptive strike', cost: 3, max: 1, type: 'first_strike' },
      { id: 'spear_3', name_zh: '破甲', name_en: 'Armor Break', desc_zh: '命中 +6%', desc_en: 'Hit Rate +6%', cost: 2, max: 5, type: 'hit_rate', value: 0.06 },
      { id: 'spear_4', name_zh: '迴旋投擲', name_en: 'Spin Throw', desc_zh: '攻擊力 +25%', desc_en: 'ATK +25%', cost: 4, max: 1, type: 'atk_mult', value: 0.25 }
    ],
    bow: [
      { id: 'bow_1', name_zh: '精準射擊', name_en: 'Precision', desc_zh: '暴擊率 +5%', desc_en: 'Crit Rate +5%', cost: 1, max: 5, type: 'crit_rate', value: 0.05 },
      { id: 'bow_2', name_zh: '多重箭', name_en: 'Multi Shot', desc_zh: '攻擊次數 +1', desc_en: 'Hits +1', cost: 3, max: 1, type: 'multi_hit' },
      { id: 'bow_3', name_zh: '貫穿箭', name_en: 'Pierce', desc_zh: '防禦無視', desc_en: 'Ignore DEF', cost: 4, max: 1, type: 'ignore_def' },
      { id: 'bow_4', name_zh: '暴風箭雨', name_en: 'Arrow Storm', desc_zh: '終極，全敵傷害 +100%', desc_en: 'Ultimate, all +100%', cost: 5, max: 1, requires: 'bow_3', type: 'aoe', value: 1.00 }
    ],
    dual_blade: [
      { id: 'dual_1', name_zh: '鬼影閃', name_en: 'Ghost Flash', desc_zh: '閃避 +5%', desc_en: 'Dodge +5%', cost: 1, max: 5, type: 'dodge_rate', value: 0.05 },
      { id: 'dual_2', name_zh: '連擊', name_en: 'Combo', desc_zh: '每 3 擊 +50% 傷害', desc_en: 'Every 3 hits +50%', cost: 2, max: 3, type: 'combo' },
      { id: 'dual_3', name_zh: '鬼人化', name_en: 'Demon Mode', desc_zh: '攻擊力 +30% / HP -20%', desc_en: 'ATK +30% / HP -20%', cost: 3, max: 1, type: 'berserk' },
      { id: 'dual_4', name_zh: '亂舞', name_en: 'Chaos Dance', desc_zh: '終極，8 連擊', desc_en: 'Ultimate, 8-hit combo', cost: 5, max: 1, requires: 'dual_3', type: 'combo_8' }
    ],
    long_sword: [
      { id: 'lsword_1', name_zh: '斬擊', name_en: 'Slash', desc_zh: '攻擊力 +8%', desc_en: 'ATK +8%', cost: 1, max: 5, type: 'atk_mult', value: 0.08 },
      { id: 'lsword_2', name_zh: '蓄力', name_en: 'Charge', desc_zh: '下一擊 +50%', desc_en: 'Next hit +50%', cost: 2, max: 3, type: 'charge' },
      { id: 'lsword_3', name_zh: '居合', name_en: 'Iai', desc_zh: '蓄滿即爆擊', desc_en: 'Full charge = crit', cost: 4, max: 1, type: 'iai' },
      { id: 'lsword_4', name_zh: '真・居合斬', name_en: 'True Iai', desc_zh: '終極，10x 傷害', desc_en: 'Ultimate, 10x dmg', cost: 5, max: 1, requires: 'lsword_3', type: 'ulti' }
    ],
    hammer: [
      { id: 'hammer_1', name_zh: '重擊', name_en: 'Smash', desc_zh: '攻擊力 +10%', desc_en: 'ATK +10%', cost: 1, max: 5, type: 'atk_mult', value: 0.10 },
      { id: 'hammer_2', name_zh: '暈眩', name_en: 'Stun', desc_zh: '20% 機率暈眩（敵人 1 回合無法行動）', desc_en: '20% stun', cost: 2, max: 3, type: 'stun', value: 0.20 },
      { id: 'hammer_3', name_zh: '地震', name_en: 'Quake', desc_zh: '全體傷害 +30%', desc_en: 'AoE +30%', cost: 3, max: 1, type: 'aoe', value: 0.30 },
      { id: 'hammer_4', name_zh: '大地粉碎', name_en: 'Earth Crusher', desc_zh: '終極，無視防禦 5x 傷害', desc_en: 'Ultimate, ignore DEF 5x', cost: 5, max: 1, requires: 'hammer_3', type: 'ulti' }
    ],
    gunlance: [
      { id: 'gl_1', name_zh: '刺擊', name_en: 'Pierce', desc_zh: '攻擊力 +5%', desc_en: 'ATK +5%', cost: 1, max: 5, type: 'atk_mult', value: 0.05 },
      { id: 'gl_2', name_zh: '砲擊', name_en: 'Cannon', desc_zh: '固定 30 額外傷害', desc_en: '+30 fixed dmg', cost: 2, max: 5, type: 'fixed_dmg', value: 30 },
      { id: 'gl_3', name_zh: '龍杭砲', name_en: 'Wyvern Stake', desc_zh: '砲擊 x3', desc_en: 'Cannon x3', cost: 3, max: 1, type: 'cannon_x3' },
      { id: 'gl_4', name_zh: '爆裂槍', name_en: 'Blast Lance', desc_zh: '終極，全敵 5x 砲擊', desc_en: 'Ultimate, all 5x cannon', cost: 5, max: 1, requires: 'gl_3', type: 'ulti' }
    ]
  },

  // 共用技能樹
  commonTrees: {
    attack: [
      { id: 'atk_1', name_zh: '力量訓練', name_en: 'Power Training', desc_zh: '攻擊力 +3', desc_en: 'ATK +3', cost: 1, max: 10, type: 'atk_flat', value: 3 },
      { id: 'atk_2', name_zh: '戰鬥大師', name_en: 'Battle Master', desc_zh: '攻擊力 +15%', desc_en: 'ATK +15%', cost: 3, max: 1, type: 'atk_mult', value: 0.15, requires: 'atk_1:5' },
      { id: 'atk_3', name_zh: '爆擊強化', name_en: 'Crit Master', desc_zh: '暴擊率 +5%', desc_en: 'Crit Rate +5%', cost: 2, max: 3, type: 'crit_rate', value: 0.05 }
    ],
    defense: [
      { id: 'def_1', name_zh: '防禦強化', name_en: 'Defense Up', desc_zh: '防禦力 +2', desc_en: 'DEF +2', cost: 1, max: 10, type: 'def_flat', value: 2 },
      { id: 'def_2', name_zh: '體力強化', name_en: 'Vitality', desc_zh: 'HP 上限 +20', desc_en: 'Max HP +20', cost: 1, max: 10, type: 'hp_flat', value: 20 },
      { id: 'def_3', name_zh: '鋼鐵之軀', name_en: 'Iron Body', desc_zh: '減傷 10%', desc_en: 'DMG Reduction 10%', cost: 3, max: 1, type: 'damage_reduction', value: 0.10, requires: 'def_1:5' }
    ],
    gather: [
      { id: 'gather_1', name_zh: '採集術', name_en: 'Gathering', desc_zh: '素材掉落 +20%', desc_en: 'Drop +20%', cost: 1, max: 5, type: 'drop_rate', value: 0.20 },
      { id: 'gather_2', name_zh: '幸運之手', name_en: 'Lucky Hand', desc_zh: '稀有素材 +10%', desc_en: 'Rare drop +10%', cost: 2, max: 3, type: 'rare_rate', value: 0.10 },
      { id: 'gather_3', name_zh: '獵人之眼', name_en: "Hunter's Eye", desc_zh: '金幣 +30%', desc_en: 'Gold +30%', cost: 2, max: 3, type: 'gold_rate', value: 0.30 }
    ],
    luck: [
      { id: 'luck_1', name_zh: '命運之輪', name_en: 'Fortune Wheel', desc_zh: '暴擊率 +2%', desc_en: 'Crit +2%', cost: 1, max: 5, type: 'crit_rate', value: 0.02 },
      { id: 'luck_2', name_zh: '魔物親和', name_en: 'Beast Affinity', desc_zh: 'Boss 遭遇率 +5%', desc_en: 'Boss rate +5%', cost: 2, max: 3, type: 'boss_rate', value: 0.05 },
      { id: 'luck_3', name_zh: '經驗吸取', name_en: 'EXP Drain', desc_zh: 'EXP +25%', desc_en: 'EXP +25%', cost: 2, max: 3, type: 'exp_rate', value: 0.25 }
    ]
  },

  // 取得武器技能
  getWeaponTree(weaponId) {
    return this.weaponTrees[weaponId] || [];
  },

  // 學習技能
  learn(skillId) {
    if (this.canLearn(skillId)) {
      const current = GameCore.state.skills[skillId] || 0;
      const skill = this.findSkill(skillId);
      if (current < skill.max) {
        GameCore.state.skills[skillId] = current + 1;
        GameCore.state.skillPoints -= skill.cost;
        GameCore.save();
        return true;
      }
    }
    return false;
  },

  canLearn(skillId) {
    const skill = this.findSkill(skillId);
    if (!skill) return false;
    const current = GameCore.state.skills[skillId] || 0;
    if (current >= skill.max) return false;
    if (GameCore.state.skillPoints < skill.cost) return false;
    if (skill.requires) {
      const [reqId, reqLevel] = skill.requires.split(':');
      const reqCurrent = GameCore.state.skills[reqId] || 0;
      const needLevel = parseInt(reqLevel) || 1;
      if (reqCurrent < needLevel) return false;
    }
    return true;
  },

  findSkill(skillId) {
    for (const tree of Object.values(this.weaponTrees)) {
      const s = tree.find(s => s.id === skillId);
      if (s) return s;
    }
    for (const tree of Object.values(this.commonTrees)) {
      const s = tree.find(s => s.id === skillId);
      if (s) return s;
    }
    return null;
  },

  // ============ 技能效果計算 ============
  // 加總某 stat 的所有技能加成（傳入技能學習狀態、stat 名）
  // 回傳單一數字（每層 value 加總）
  getStatBonus(statType) {
    let total = 0;
    for (const skillId in GameCore.state.skills) {
      const level = GameCore.state.skills[skillId];
      if (level <= 0) continue;
      const skill = this.findSkill(skillId);
      if (!skill || skill.type !== statType) continue;
      total += skill.value * level;
    }
    return total;
  },

  // 計算玩家的有效戰鬥屬性（含技能 buff）
  getEffectiveStats(hunter) {
    const atkMult = this.getStatBonus('atk_mult');
    const atkFlat = this.getStatBonus('atk_flat');
    const critRate = this.getStatBonus('crit_rate');
    const critDmg = this.getStatBonus('crit_dmg');
    const hitRate = this.getStatBonus('hit_rate');
    const dodgeRate = this.getStatBonus('dodge_rate');
    const defFlat = this.getStatBonus('def_flat');
    const hpFlat = this.getStatBonus('hp_flat');
    const reduction = this.getStatBonus('damage_reduction');

    return {
      atk: Math.floor(hunter.atk * (1 + atkMult) + atkFlat),
      critRate: Math.min(0.95, (hunter.critRate || 0.05) + critRate),
      critDmg: (hunter.critDmg || 1.5) + critDmg,
      hitRate: Math.min(0.99, (hunter.hitRate || 0.95) + hitRate),
      dodgeRate: Math.min(0.75, (hunter.dodgeRate || 0.05) + dodgeRate),
      def: hunter.def + defFlat,
      maxHp: hunter.maxHp + hpFlat,
      damageReduction: Math.min(0.5, reduction)
    };
  }
};

window.Skills = Skills;