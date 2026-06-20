// weapons.js — 武器資料
// V_0601

const Weapons = {
  data: {
    sword: {
      id: 'sword',
      name_zh: '劍',
      name_en: 'Sword',
      desc_zh: '均衡型武器，攻擊與速度並重。',
      desc_en: 'Balanced weapon, equal attack and speed.',
      baseAtk: 12,
      speed: 1.0,
      critBonus: 0.05,
      icon: '⚔️',
      skillTree: 'sword_skills'
    },
    spear: {
      id: 'spear',
      name_zh: '槍',
      name_en: 'Spear',
      desc_zh: '中距離武器，可先制攻擊。',
      desc_en: 'Mid-range, can attack first.',
      baseAtk: 10,
      speed: 1.1,
      critBonus: 0.03,
      icon: '🔱',
      skillTree: 'spear_skills'
    },
    bow: {
      id: 'bow',
      name_zh: '弓',
      name_en: 'Bow',
      desc_zh: '遠距離武器，暴擊率高。',
      desc_en: 'Long-range, high crit rate.',
      baseAtk: 9,
      speed: 1.2,
      critBonus: 0.10,
      icon: '🏹',
      skillTree: 'bow_skills'
    },
    dual_blade: {
      id: 'dual_blade',
      name_zh: '雙刀',
      name_en: 'Dual Blades',
      desc_zh: '極速雙武器，可連擊。',
      desc_en: 'Ultra-fast dual wield, can combo.',
      baseAtk: 7,
      speed: 1.5,
      critBonus: 0.08,
      icon: '🗡️',
      skillTree: 'dual_skills'
    },
    long_sword: {
      id: 'long_sword',
      name_zh: '太刀',
      name_en: 'Long Sword',
      desc_zh: '大太刀，可蓄力斬擊。',
      desc_en: 'Great sword, can charge slash.',
      baseAtk: 18,
      speed: 0.7,
      critBonus: 0.04,
      icon: '⚔️',
      skillTree: 'longsword_skills'
    },
    hammer: {
      id: 'hammer',
      name_zh: '重錘',
      name_en: 'Hammer',
      desc_zh: '重擊武器，可暈眩敵人。',
      desc_en: 'Heavy strike, can stun.',
      baseAtk: 22,
      speed: 0.5,
      critBonus: 0.02,
      icon: '🔨',
      skillTree: 'hammer_skills'
    },
    gunlance: {
      id: 'gunlance',
      name_zh: '火槍刀',
      name_en: 'Gunlance',
      desc_zh: '槍與火器混合，可爆裂射擊。',
      desc_en: 'Lance + firearm, can blast.',
      baseAtk: 15,
      speed: 0.8,
      critBonus: 0.06,
      icon: '🔫',
      skillTree: 'gunlance_skills'
    }
  },

  get(id) {
    return this.data[id];
  },

  all() {
    return Object.values(this.data);
  }
};

window.Weapons = Weapons;
