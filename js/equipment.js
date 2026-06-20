// equipment.js — 裝備打造系統
// V_0602

const Equipment = {
  // 裝備配方表（每個武器都有 3 個等級 + 共用防具）
  recipes: {
    // 武器專屬（每武器 3 等級：村裝 → 強裝 → 神裝）
    weapons: {
      sword: [
        { id: 'sword_basic', name_zh: '鐵劍', name_en: 'Iron Sword', atk: 5, cost: [{mat:'wolf_fang', qty:5}], tier: 1 },
        { id: 'sword_advanced', name_zh: '鋼劍', name_en: 'Steel Sword', atk: 12, cost: [{mat:'wolf_fang', qty:10},{mat:'serpent_fang', qty:3}], tier: 2 },
        { id: 'sword_legend', name_zh: '聖劍', name_en: 'Holy Blade', atk: 30, cost: [{mat:'demon_heart', qty:1},{mat:'god_essence', qty:1}], tier: 3 }
      ],
      spear: [
        { id: 'spear_basic', name_zh: '木槍', name_en: 'Wooden Spear', atk: 4, cost: [{mat:'wolf_fang', qty:5}], tier: 1 },
        { id: 'spear_advanced', name_zh: '鋼槍', name_en: 'Steel Spear', atk: 10, cost: [{mat:'lizard_scale', qty:10},{mat:'sand_scale', qty:5}], tier: 2 },
        { id: 'spear_legend', name_zh: '龍騎槍', name_en: 'Dragon Lance', atk: 25, cost: [{mat:'dragon_scale', qty:3},{mat:'serpent_fang', qty:2}], tier: 3 }
      ],
      bow: [
        { id: 'bow_basic', name_zh: '木弓', name_en: 'Wooden Bow', atk: 3, cost: [{mat:'spider_silk', qty:5}], tier: 1 },
        { id: 'bow_advanced', name_zh: '長弓', name_en: 'Longbow', atk: 8, cost: [{mat:'spider_silk', qty:10},{mat:'ice_feather', qty:3}], tier: 2 },
        { id: 'bow_legend', name_zh: '天神弓', name_en: 'Celestial Bow', atk: 20, cost: [{mat:'sky_feather', qty:5},{mat:'wind_gem', qty:1}], tier: 3 }
      ],
      dual_blade: [
        { id: 'dual_basic', name_zh: '短刃', name_en: 'Short Blades', atk: 2, cost: [{mat:'wolf_fang', qty:3}], tier: 1 },
        { id: 'dual_advanced', name_zh: '雙刃', name_en: 'Dual Blades', atk: 6, cost: [{mat:'serpent_fang', qty:2},{mat:'imp_horn', qty:3}], tier: 2 },
        { id: 'dual_legend', name_zh: '魔雙刃', name_en: 'Demon Twins', atk: 18, cost: [{mat:'demon_heart', qty:1},{mat:'void_crystal', qty:2}], tier: 3 }
      ],
      long_sword: [
        { id: 'lsword_basic', name_zh: '長刀', name_en: 'Long Sword', atk: 8, cost: [{mat:'wolf_fang', qty:8}], tier: 1 },
        { id: 'lsword_advanced', name_zh: '大太刀', name_en: 'Great Sword', atk: 18, cost: [{mat:'imp_horn', qty:5},{mat:'flame_heart', qty:1}], tier: 2 },
        { id: 'lsword_legend', name_zh: '天叢雲', name_en: 'Ame-no-Murakumo', atk: 40, cost: [{mat:'god_essence', qty:2},{mat:'demon_heart', qty:3}], tier: 3 }
      ],
      hammer: [
        { id: 'hammer_basic', name_zh: '石錘', name_en: 'Stone Hammer', atk: 10, cost: [{mat:'golem_stone', qty:3}], tier: 1 },
        { id: 'hammer_advanced', name_zh: '鐵鎚', name_en: 'Iron Hammer', atk: 20, cost: [{mat:'lava_core', qty:2},{mat:'golem_stone', qty:5}], tier: 2 },
        { id: 'hammer_legend', name_zh: '巨人之鎚', name_en: "Giant's Hammer", atk: 45, cost: [{mat:'void_crystal', qty:3},{mat:'abyss_horn', qty:1}], tier: 3 }
      ],
      gunlance: [
        { id: 'gl_basic', name_zh: '鐵槍', name_en: 'Iron Lance', atk: 6, cost: [{mat:'camel_hide', qty:5}], tier: 1 },
        { id: 'gl_advanced', name_zh: '火槍', name_en: 'Gunlance', atk: 15, cost: [{mat:'fire_scale', qty:5},{mat:'lava_core', qty:2}], tier: 2 },
        { id: 'gl_legend', name_zh: '龍擊砲', name_en: 'Wyvern Buster', atk: 35, cost: [{mat:'dragon_scale', qty:5},{mat:'flame_heart', qty:3}], tier: 3 }
      ]
    },
    // 共用防具（4 階）
    armors: [
      { id: 'armor_basic', name_zh: '皮甲', name_en: 'Leather Armor', def: 5, hp: 30, cost: [{mat:'camel_hide', qty:5}], tier: 1 },
      { id: 'armor_iron', name_zh: '鐵甲', name_en: 'Iron Armor', def: 12, hp: 80, cost: [{mat:'bear_hide', qty:5},{mat:'turtle_shell', qty:3}], tier: 2 },
      { id: 'armor_dragon', name_zh: '龍鱗甲', name_en: 'Dragon Armor', def: 25, hp: 200, cost: [{mat:'dragon_scale', qty:5},{mat:'ice_crown', qty:1}], tier: 3 },
      { id: 'armor_godly', name_zh: '神鎧', name_en: 'Godly Armor', def: 50, hp: 500, cost: [{mat:'god_essence', qty:3},{mat:'demon_heart', qty:2}], tier: 4 }
    ]
  },

  // 取得武器的 3 階裝備
  getWeaponTiers(weaponId) {
    return this.recipes.weapons[weaponId] || [];
  },

  // 取得所有防具
  getArmors() {
    return this.recipes.armors;
  },

  // 檢查素材是否足夠
  canCraft(recipe) {
    return recipe.cost.every(c => (GameCore.state.materials[c.mat] || 0) >= c.qty);
  },

  // 打造裝備
  craft(recipeId) {
    const recipe = this.findRecipe(recipeId);
    if (!recipe) return { ok: false, reason: 'recipe_not_found' };
    if (!this.canCraft(recipe)) return { ok: false, reason: 'materials_not_enough' };

    // 扣素材
    recipe.cost.forEach(c => {
      GameCore.state.materials[c.mat] -= c.qty;
      if (GameCore.state.materials[c.mat] <= 0) {
        delete GameCore.state.materials[c.mat];
      }
    });

    // 套用裝備效果
    if (recipe.atk !== undefined) {
      GameCore.state.equipment.weapon = recipe.id;
      GameCore.state.hunter.atk += recipe.atk;
    }
    if (recipe.def !== undefined) {
      GameCore.state.equipment.armor = recipe.id;
      GameCore.state.hunter.def += recipe.def;
      GameCore.state.hunter.maxHp += recipe.hp || 0;
      GameCore.state.hunter.hp += recipe.hp || 0;
    }

    GameCore.save();
    return { ok: true, recipe };
  },

  findRecipe(recipeId) {
    for (const weaponId in this.recipes.weapons) {
      const r = this.recipes.weapons[weaponId].find(r => r.id === recipeId);
      if (r) return r;
    }
    return this.recipes.armors.find(r => r.id === recipeId);
  }
};

window.Equipment = Equipment;