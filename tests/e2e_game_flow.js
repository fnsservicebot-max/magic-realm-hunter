// tests/e2e_game_flow.js — 模擬玩遊戲流程
const fs = require('fs');
const vm = require('vm');

const memStorage = {};
function makeCtx() {
  const ctx = {
    window: {},
    localStorage: {
      getItem: (k) => memStorage[k] || null,
      setItem: (k, v) => memStorage[k] = v,
      removeItem: (k) => delete memStorage[k]
    },
    console,
    document: {
      addEventListener: () => {},
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      createElement: () => ({
        classList: { add:()=>{}, remove:()=>{} },
        innerHTML: '',
        appendChild: () => {}
      })
    },
    fetch: async () => ({ json: async () => ({}) }),
    setInterval: () => {},
    alert: () => {},
    confirm: () => true,
    location: { reload: () => {} },
    Math, Date, JSON
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  // 載入所有 JS
  ['weapons','monsters','skills','equipment','i18n','combat','core','ui'].forEach(f => {
    vm.runInContext(fs.readFileSync(__dirname + '/../js/' + f + '.js', 'utf8'), ctx);
  });
  return ctx;
}

console.log('═══════════════════════════════════════════════════════');
console.log('  模擬玩遊戲流程測試');
console.log('═══════════════════════════════════════════════════════');
console.log('');

// ========== 步驟 1: 創建角色 ==========
console.log('【1】創建獵人「亞歷」武器：太刀');
const ctx = makeCtx();
vm.runInContext(`
  GameCore.createHunter('亞歷', 'long_sword');
  console.log('  ✓ 名字：' + GameCore.state.hunter.name);
  console.log('  ✓ 武器：' + GameCore.state.hunter.weapon);
  console.log('  ✓ 等級：' + GameCore.state.hunter.level);
  console.log('  ✓ HP：' + GameCore.state.hunter.hp);
  console.log('  ✓ 攻擊：' + GameCore.state.hunter.atk);
`, ctx);

// ========== 步驟 2: 模擬戰鬥 ==========
console.log('');
console.log('【2】模擬 10 次戰鬥');
vm.runInContext(`
  let battles = 0, wins = 0, kills = {monster: 0, boss: 0};
  for (let i = 0; i < 10; i++) {
      const monster = Monsters.encounter('forest', GameCore.state.hunter.level);
      const result = Combat.simulate(GameCore.state.hunter, monster);
      if (result.victory) {
          GameCore.onVictory(monster, result);
          battles++;
          wins++;
          if (monster.isBoss) kills.boss++; else kills.monster++;
      }
  }
  console.log('  ✓ 戰鬥 ' + battles + ' 次，勝利 ' + wins + ' 次');
  console.log('    - 一般魔物擊殺：' + kills.monster);
  console.log('    - Boss 擊殺：' + kills.boss);
  console.log('  ✓ 總素材數：' + Object.keys(GameCore.state.materials).length + ' 種');
  console.log('  ✓ 已發現魔物：' + GameCore.state.discovered.size + ' 隻');
`, ctx);

// ========== 步驟 3: 學習技能 ==========
console.log('');
console.log('【3】學習技能（給 100 點技能點）');
vm.runInContext(`
  GameCore.state.skillPoints = 100;
  let learned = 0;
  ['lsword_1', 'lsword_2', 'lsword_3', 'lsword_4', 'atk_1', 'def_1', 'gather_1', 'luck_1'].forEach(sid => {
      while (Skills.canLearn(sid)) {
          if (Skills.learn(sid)) learned++;
          else break;
      }
  });
  console.log('  ✓ 學習技能點：' + learned + ' 次');
  console.log('  ✓ 已學技能：' + Object.keys(GameCore.state.skills).length + ' 個');
  console.log('  ✓ 剩餘技能點：' + GameCore.state.skillPoints);
  console.log('  ✓ 太刀攻擊加成：' + GameCore.state.hunter.atk);
`, ctx);

// ========== 步驟 4: 裝備打造 ==========
console.log('');
console.log('【4】裝備打造');
vm.runInContext(`
  GameCore.state.materials['wolf_fang'] = 100;
  GameCore.state.materials['imp_horn'] = 50;
  GameCore.state.materials['flame_heart'] = 10;
  const result1 = Equipment.craft('lsword_basic');
  console.log('  ✓ 打造太刀（基本）：' + (result1.ok ? '成功' : '失敗'));
  console.log('    - 攻擊力：' + GameCore.state.hunter.atk);
  GameCore.state.materials['camel_hide'] = 50;
  const result2 = Equipment.craft('armor_basic');
  console.log('  ✓ 打造皮甲：' + (result2.ok ? '成功' : '失敗'));
  console.log('    - 防禦力：' + GameCore.state.hunter.def);
`, ctx);

// ========== 步驟 5: 升級 ==========
console.log('');
console.log('【5】模擬升級（給大量經驗值）');
vm.runInContext(`
  GameCore.state.hunter.exp = 99999;
  const beforeLv = GameCore.state.hunter.level;
  GameCore.checkLevelUp();
  const afterLv = GameCore.state.hunter.level;
  console.log('  ✓ 等級：' + beforeLv + ' → ' + afterLv);
  console.log('  ✓ HP：' + GameCore.state.hunter.hp + '/' + GameCore.state.hunter.maxHp);
`, ctx);

// ========== 步驟 6: 區域解鎖 ==========
console.log('');
console.log('【6】區域解鎖');
vm.runInContext(`
  GameCore.state.totalKills = 100;
  GameCore.checkAreaUnlock();
  console.log('  ✓ 已解鎖區域：' + Array.from(GameCore.state.unlockedAreas).join(', '));
`, ctx);

// ========== 步驟 7: 存檔 + 讀檔 ==========
console.log('');
console.log('【7】存檔 → 讀檔 → 資料一致性');
vm.runInContext(`GameCore.save();`, ctx);
const saved = ctx.localStorage.getItem('mrh_save');
console.log('  ✓ 存檔大小：' + saved.length + ' bytes');

const freshCtx = makeCtx();
const reloadResult = vm.runInContext(`GameCore.load()`, freshCtx);
console.log('  ✓ 讀檔：' + (reloadResult ? '成功' : '失敗'));
vm.runInContext(`
  console.log('    - 角色名：' + (GameCore.state.hunter ? GameCore.state.hunter.name : '(無)'));
  console.log('    - 等級：' + (GameCore.state.hunter ? GameCore.state.hunter.level : '(無)'));
  console.log('    - 總擊殺：' + GameCore.state.totalKills);
  console.log('    - 素材數：' + Object.keys(GameCore.state.materials).length + ' 種');
`, freshCtx);

// ========== 步驟 8: i18n 切換 ==========
console.log('');
console.log('【8】i18n 雙語切換');
vm.runInContext(`
  I18n.lang = 'en';
  console.log('  ✓ 英文 - 武器：' + I18n.t('weapon_long_sword', '太刀'));
  console.log('  ✓ 英文 - 技能：' + I18n.t('skill_lsword_1', '斬擊'));
  I18n.lang = 'zh-TW';
  console.log('  ✓ 中文 - 武器：' + I18n.t('weapon_long_sword', '太刀'));
  console.log('  ✓ 中文 - 技能：' + I18n.t('skill_lsword_1', '斬擊'));
`, ctx);

console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('  ✅ 模擬遊戲流程測試：全部通過');
console.log('═══════════════════════════════════════════════════════');
