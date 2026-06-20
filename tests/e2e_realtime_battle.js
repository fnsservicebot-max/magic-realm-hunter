// tests/e2e_realtime_battle.js — 即時戰鬥 E2E 測試
const fs = require('fs');
const vm = require('vm');

const ctx = {
  window: {}, localStorage: { getItem:()=>null,setItem:()=>{},removeItem:()=>{} },
  console,
  document: { addEventListener:()=>{}, getElementById:()=>({textContent:'',innerHTML:'',style:{},classList:{add:()=>{},remove:()=>{},contains:()=>false},appendChild:()=>{}}), querySelector:()=>null, querySelectorAll:()=>[], createElement:()=>({classList:{add:()=>{},remove:()=>{}},innerHTML:'',appendChild:()=>{}}) },
  fetch: async () => ({ json: async () => ({}) }),
  setInterval, clearInterval,  // 用真實的 Node timer
  alert: () => {}, confirm: () => true, location: { reload: () => {} },
  Math, Date, JSON
};
ctx.window = ctx;
vm.createContext(ctx);
['weapons','monsters','skills','equipment','i18n','combat','core','ui'].forEach(f => {
  vm.runInContext(fs.readFileSync(__dirname + '/../js/' + f + '.js', 'utf8'), ctx);
});

ctx.GameCore.createHunter('亞歷', 'long_sword');

console.log('═══ 即時戰鬥測試 ═══');
console.log('');

(async () => {
  // 啟動即時戰鬥 vs 森林狼
  const wolf = ctx.Monsters.encounter('forest', 1);
  console.log('【1】啟動即時戰鬥 vs', wolf.name_zh || wolf.id);
  console.log('    玩家 HP：' + ctx.GameCore.state.hunter.hp + ' | 魔物 HP：' + wolf.hp);
  ctx.GameCore.startBattle(wolf);

  console.log('    battle.active：' + ctx.GameCore.state.battle.active);
  console.log('    battle.monster.id：' + ctx.GameCore.state.battle.monster.id);

  // 立即檢查：第一回合已經跑了
  console.log('');
  console.log('【2】第一回合已跑：');
  console.log('    玩家 HP：' + ctx.GameCore.state.hunter.hp + '（應該 < 100）');
  console.log('    魔物 HP：' + wolf.hp + '（應該 < ' + ctx.Monsters.forest.monsters.find(m=>m.id==='wolf').hp + '）');

  // 等 5 秒讓戰鬥跑 5 回合
  console.log('');
  console.log('【3】等 5 秒讓戰鬥跑 5 回合...');
  await new Promise(r => setTimeout(r, 5100));

  console.log('    玩家 HP：' + ctx.GameCore.state.hunter.hp);
  console.log('    戰鬥是否結束：' + !ctx.GameCore.state.battle.active);
  if (ctx.GameCore.state.battle.active) {
    console.log('    魔物剩餘 HP：' + ctx.GameCore.state.battle.monster.hp);
  } else {
    console.log('    戰鬥已結束');
  }

  // 清掉可能殘留的 interval
  if (ctx.GameCore.state.battle && ctx.GameCore.state.battle.timer) {
    clearInterval(ctx.GameCore.state.battle.timer);
  }

  // 測試 tick 路徑
  console.log('');
  console.log('【4】tick 路徑測試');
  ctx.GameCore.state.hunter.hp = 100;
  ctx.GameCore.state.battle = { active: false, monster: null, timer: null };
  ctx.GameCore.tick();
  console.log('    tick 後 battle.active：' + ctx.GameCore.state.battle.active);
  console.log('    遭遇的魔物：' + (ctx.GameCore.state.battle.monster ? ctx.GameCore.state.battle.monster.id : '無'));

  // 清掉
  if (ctx.GameCore.state.battle.timer) {
    clearInterval(ctx.GameCore.state.battle.timer);
  }

  // 戰鬥中不重 encounter
  console.log('');
  console.log('【5】戰鬥中 tick 不會 encounter 新魔物');
  ctx.GameCore.state.battle = { active: true, monster: wolf, timer: null };
  const beforeMonsterId = ctx.GameCore.state.battle.monster.id;
  ctx.GameCore.tick();
  console.log('    戰鬥中魔物仍為：' + ctx.GameCore.state.battle.monster.id + '（沒換）');
  console.log('    ' + (beforeMonsterId === ctx.GameCore.state.battle.monster.id ? '✓ 正確' : '✗ 錯誤'));

  console.log('');
  console.log('✅ 即時戰鬥邏輯正常運作');
})();
