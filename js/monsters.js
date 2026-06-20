// monsters.js — 魔物資料（30 一般 + 10 Boss）
// V_0601

const Monsters = {
  // ========== 6 個棲息地，每地 5 隻 = 30 一般魔物 ==========
  forest: {
    name_zh: '翠綠森林',
    name_en: 'Verdant Forest',
    levelRange: [1, 8],
    icon: '🌲',
    monsters: [
      { id: 'wolf', name_zh: '森林狼', name_en: 'Forest Wolf', hp: 30, atk: 5, exp: 10, gold: 3, drops: [{id:'wolf_fang', count:1}] },
      { id: 'spider', name_zh: '巨蛛', name_en: 'Giant Spider', hp: 25, atk: 6, exp: 12, gold: 4, drops: [{id:'spider_silk', count:1}] },
      { id: 'mushroom', name_zh: '毒菇人', name_en: 'Poison Shroom', hp: 40, atk: 4, exp: 14, gold: 5, drops: [{id:'mushroom_spore', count:2}] },
      { id: 'lizard', name_zh: '林蜥', name_en: 'Forest Lizard', hp: 35, atk: 7, exp: 15, gold: 4, drops: [{id:'lizard_scale', count:1}] },
      { id: 'bee', name_zh: '巨蜂', name_en: 'Giant Bee', hp: 20, atk: 8, exp: 18, gold: 6, drops: [{id:'bee_sting', count:1},{id:'honey',count:1}] }
    ]
  },
  desert: {
    name_zh: '流沙荒漠',
    name_en: 'Quicksand Desert',
    levelRange: [5, 15],
    icon: '🏜️',
    monsters: [
      { id: 'sand_lizard', name_zh: '沙蜥', name_en: 'Sand Lizard', hp: 50, atk: 9, exp: 22, gold: 7, drops: [{id:'sand_scale', count:1}] },
      { id: 'camel', name_zh: '駝獸', name_en: 'Dune Camel', hp: 70, atk: 8, exp: 25, gold: 8, drops: [{id:'camel_hide', count:1}] },
      { id: 'scorpion', name_zh: '巨蠍', name_en: 'Giant Scorpion', hp: 60, atk: 12, exp: 30, gold: 10, drops: [{id:'scorpion_venom', count:1}] },
      { id: 'sand_worm', name_zh: '沙蟲', name_en: 'Sand Worm', hp: 80, atk: 10, exp: 35, gold: 12, drops: [{id:'worm_tooth', count:2}] },
      { id: 'skeleton', name_zh: '骷髏兵', name_en: 'Skeleton', hp: 55, atk: 11, exp: 32, gold: 9, drops: [{id:'bone', count:2}] }
    ]
  },
  snow: {
    name_zh: '霜凍雪原',
    name_en: 'Frost Tundra',
    levelRange: [10, 20],
    icon: '❄️',
    monsters: [
      { id: 'snow_rabbit', name_zh: '雪兔', name_en: 'Snow Rabbit', hp: 40, atk: 7, exp: 28, gold: 6, drops: [{id:'rabbit_fur', count:1}] },
      { id: 'ice_wolf', name_zh: '冰狼', name_en: 'Ice Wolf', hp: 70, atk: 14, exp: 45, gold: 14, drops: [{id:'wolf_fang', count:1},{id:'ice_crystal',count:1}] },
      { id: 'frost_giant', name_zh: '霜巨魔', name_en: 'Frost Giant', hp: 120, atk: 18, exp: 65, gold: 22, drops: [{id:'giant_ice', count:2}] },
      { id: 'ice_bird', name_zh: '冰鳥', name_en: 'Ice Bird', hp: 60, atk: 16, exp: 50, gold: 16, drops: [{id:'ice_feather', count:2}] },
      { id: 'white_bear', name_zh: '白熊', name_en: 'Polar Bear', hp: 100, atk: 20, exp: 70, gold: 25, drops: [{id:'bear_hide', count:1}] }
    ]
  },
  volcano: {
    name_zh: '灼熱火山',
    name_en: 'Scorching Volcano',
    levelRange: [15, 30],
    icon: '🌋',
    monsters: [
      { id: 'fire_lizard', name_zh: '火蜥', name_en: 'Fire Lizard', hp: 90, atk: 22, exp: 80, gold: 28, drops: [{id:'fire_scale', count:1}] },
      { id: 'rock_turtle', name_zh: '岩龜', name_en: 'Rock Turtle', hp: 180, atk: 18, exp: 100, gold: 35, drops: [{id:'turtle_shell', count:1}] },
      { id: 'lava_golem', name_zh: '熔岩魔像', name_en: 'Lava Golem', hp: 150, atk: 25, exp: 120, gold: 40, drops: [{id:'lava_core', count:1}] },
      { id: 'fire_bird', name_zh: '火鳥', name_en: 'Fire Bird', hp: 80, atk: 30, exp: 110, gold: 38, drops: [{id:'fire_feather', count:2}] },
      { id: 'flame_imp', name_zh: '炎魔像', name_en: 'Flame Imp', hp: 110, atk: 28, exp: 130, gold: 45, drops: [{id:'imp_horn', count:1}] }
    ]
  },
  swamp: {
    name_zh: '腐蝕沼澤',
    name_en: 'Corrosive Swamp',
    levelRange: [20, 40],
    icon: '🌫️',
    monsters: [
      { id: 'frog', name_zh: '蛙人', name_en: 'Frog Man', hp: 100, atk: 24, exp: 100, gold: 30, drops: [{id:'frog_leg', count:1}] },
      { id: 'swamp_dragon', name_zh: '沼龍', name_en: 'Swamp Dragon', hp: 220, atk: 32, exp: 180, gold: 60, drops: [{id:'dragon_scale', count:1}] },
      { id: 'poison_snake', name_zh: '毒蛇', name_en: 'Poison Snake', hp: 120, atk: 35, exp: 140, gold: 45, drops: [{id:'snake_venom', count:2}] },
      { id: 'leech', name_zh: '巨蛭', name_en: 'Giant Leech', hp: 80, atk: 30, exp: 110, gold: 35, drops: [{id:'leech_sucker', count:1}] },
      { id: 'undead', name_zh: '腐屍', name_en: 'Rotting Corpse', hp: 180, atk: 28, exp: 160, gold: 50, drops: [{id:'undead_bone', count:2}] }
    ]
  },
  cave: {
    name_zh: '幽暗洞窟',
    name_en: 'Dark Cave',
    levelRange: [30, 50],
    icon: '🕳️',
    monsters: [
      { id: 'bat', name_zh: '巨蝠', name_en: 'Giant Bat', hp: 130, atk: 30, exp: 150, gold: 45, drops: [{id:'bat_wing', count:1}] },
      { id: 'rat', name_zh: '巨鼠', name_en: 'Giant Rat', hp: 110, atk: 28, exp: 140, gold: 42, drops: [{id:'rat_fur', count:1}] },
      { id: 'ghost', name_zh: '幽靈', name_en: 'Ghost', hp: 150, atk: 35, exp: 180, gold: 55, drops: [{id:'spirit_essence', count:1}] },
      { id: 'crystal', name_zh: '結晶獸', name_en: 'Crystal Beast', hp: 200, atk: 32, exp: 200, gold: 65, drops: [{id:'crystal_shard', count:2}] },
      { id: 'stone_golem', name_zh: '石像鬼', name_en: 'Stone Golem', hp: 250, atk: 30, exp: 220, gold: 70, drops: [{id:'golem_stone', count:1}] }
    ]
  },

  // ========== 10 隻 Boss（每隻 50% 機率出現在 Boss 戰）==========
  bosses: [
    { id: 'boss_forest_king', area: 'forest', name_zh: '森林之王', name_en: 'Forest King', hp: 500, atk: 25, exp: 200, gold: 100, drops: [{id:'king_fang',count:1},{id:'ancient_leaf',count:1}], icon: '👑' },
    { id: 'boss_bee_queen', area: 'forest', name_zh: '蜂巢女王', name_en: 'Hive Queen', hp: 600, atk: 28, exp: 220, gold: 110, drops: [{id:'queen_sting',count:1},{id:'royal_jelly',count:2}], icon: '👸' },
    { id: 'boss_ancient_tree', area: 'forest', name_zh: '遠古樹人', name_en: 'Ancient Treant', hp: 800, atk: 30, exp: 280, gold: 130, drops: [{id:'ancient_wood',count:2},{id:'seed_of_life',count:1}], icon: '🌳' },
    { id: 'boss_flame_lord', area: 'volcano', name_zh: '火焰領主', name_en: 'Flame Lord', hp: 1200, atk: 50, exp: 500, gold: 250, drops: [{id:'flame_heart',count:1},{id:'lord_ember',count:1}], icon: '🔥' },
    { id: 'boss_ice_queen', area: 'snow', name_zh: '冰雪女王', name_en: 'Ice Queen', hp: 1500, atk: 55, exp: 600, gold: 300, drops: [{id:'ice_crown',count:1},{id:'queen_scale',count:1}], icon: '❄️' },
    { id: 'boss_sand_serpent', area: 'desert', name_zh: '沙海巨蛇', name_en: 'Sand Serpent', hp: 1800, atk: 60, exp: 700, gold: 350, drops: [{id:'serpent_fang',count:1},{id:'sand_pearl',count:1}], icon: '🐍' },
    { id: 'boss_swamp_king', area: 'swamp', name_zh: '沼澤之王', name_en: 'Swamp King', hp: 2500, atk: 75, exp: 1000, gold: 500, drops: [{id:'king_crown',count:1},{id:'swamp_eye',count:1}], icon: '👁️' },
    { id: 'boss_abyss_beast', area: 'cave', name_zh: '深淵巨獸', name_en: 'Abyssal Beast', hp: 3500, atk: 90, exp: 1500, gold: 800, drops: [{id:'abyss_horn',count:1},{id:'void_crystal',count:1}], icon: '👹' },
    { id: 'boss_sky_lord', area: 'cave', name_zh: '天空之主', name_en: 'Sky Lord', hp: 5000, atk: 120, exp: 2500, gold: 1500, drops: [{id:'sky_feather',count:2},{id:'wind_gem',count:1}], icon: '🦅' },
    { id: 'boss_demon_god', area: 'cave', name_zh: '魔神', name_en: 'Demon God', hp: 10000, atk: 200, exp: 5000, gold: 3000, drops: [{id:'demon_heart',count:1},{id:'god_essence',count:1}], icon: '😈' }
  ],

  // ========== 遭遇魔物（5% 機率 Boss）==========
  encounter(areaId) {
    const area = this[areaId];
    if (!area) return null;
    // Boss 遭遇檢查（5%）
    if (Math.random() < 0.05) {
      const areaBosses = this.bosses.filter(b => b.area === areaId);
      if (areaBosses.length > 0) {
        const b = areaBosses[Math.floor(Math.random() * areaBosses.length)];
        return { ...b, isBoss: true, maxHp: b.hp, critRate: 0.10, critDmg: 1.8, dodgeRate: 0.05 };
      }
    }
    // 一般魔物（依等級調整暴擊率，高等魔物更會暴擊）
    const lv = GameCore.state.hunter ? GameCore.state.hunter.level : 1;
    const base = { ...area.monsters[Math.floor(Math.random() * area.monsters.length)], isBoss: false };
    return {
      ...base,
      maxHp: base.hp,  // V_0622 記錄初始 HP 用於血條
      critRate: 0.05 + Math.min(0.10, lv * 0.005),  // 5% 起，每級 +0.5%，最高 15%
      critDmg: 1.5,
      dodgeRate: 0.03 + Math.min(0.07, lv * 0.003)   // 3% 起，每級 +0.3%，最高 10%
    };
  },

  all() {
    const all = [];
    ['forest','desert','snow','volcano','swamp','cave'].forEach(area => {
      this[area].monsters.forEach(m => all.push({...m, area, isBoss: false}));
    });
    this.bosses.forEach(b => all.push({...b, area: b.area, isBoss: true}));
    return all;
  },

  get(id) {
    return this.all().find(m => m.id === id);
  }
};

window.Monsters = Monsters;
