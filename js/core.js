// core.js — 遊戲核心：狀態管理、放置 loop、存檔、HP 回復
// V_0602

const GameCore = {
  state: {
    hunter: null,
    materials: {},
    discovered: new Set(),
    defeated: {},
    skills: {},
    skillPoints: 0,
    equipment: { weapon: null, armor: null },
    currentArea: 'forest',
    unlockedAreas: new Set(['forest']),
    totalKills: 0,
    bossKills: 0,
    startTime: Date.now(),
    lastSaved: Date.now(),
    playerImg: 'assets/weapons/sword.png',
    isDead: false,
    deathCount: 0
  },

  init() {
    this.load();
    this.startLoop();
    this.startHpRegen();
  },

  save() {
    this.state.lastSaved = Date.now();
    const data = {
      ...this.state,
      discovered: Array.from(this.state.discovered),
      unlockedAreas: Array.from(this.state.unlockedAreas)
    };
    localStorage.setItem('mrh_save', JSON.stringify(data));
  },

  load() {
    const raw = localStorage.getItem('mrh_save');
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      this.state = {
        ...this.state,
        ...data,
        discovered: new Set(data.discovered || []),
        unlockedAreas: new Set(data.unlockedAreas || ['forest'])
      };
      // 更新玩家圖
      if (this.state.hunter) {
        this.state.playerImg = `assets/weapons/${this.state.hunter.weapon}.png`;
      }
      return true;
    } catch (e) {
      console.error('Load failed:', e);
      return false;
    }
  },

  reset() {
    localStorage.removeItem('mrh_save');
    location.reload();
  },

  createHunter(name, weaponId) {
    const weapon = Weapons.get(weaponId);
    this.state.hunter = {
      name: name || '獵人',
      weapon: weaponId,
      level: 1,
      exp: 0,
      expToNext: 100,
      hp: 100,
      maxHp: 100,
      atk: weapon.baseAtk,
      def: 5,
      gold: 0,
      critRate: 0.05,
      critDmg: 1.5
    };
    this.state.playerImg = `assets/weapons/${weaponId}.png`;
    this.save();
  },

  startLoop() {
    // 每 3 秒自動狩獵
    setInterval(() => {
      if (!this.state.hunter || this.state.isDead) return;
      this.tick();
    }, 3000);

    // UI 每 500ms 更新（讓動畫更順）
    setInterval(() => {
      if (typeof UI !== 'undefined') UI.updateUI();
    }, 500);
  },

  startHpRegen() {
    // 每秒自動回復 2 HP
    setInterval(() => {
      if (!this.state.hunter || this.state.isDead) return;
      if (this.state.hunter.hp < this.state.hunter.maxHp) {
        this.state.hunter.hp = Math.min(
          this.state.hunter.maxHp,
          this.state.hunter.hp + 2
        );
      }
    }, 1000);
  },

  tick() {
    if (!this.state.hunter || this.state.isDead) return;
    const monster = Monsters.encounter(this.state.currentArea, this.state.hunter.level);
    if (!monster) return;
    this.hunt(monster);
  },

  hunt(monster) {
    const result = Combat.simulate(this.state.hunter, monster);
    if (result.victory) {
      this.onVictory(monster, result);
    } else {
      this.onDeath(monster);
    }
    this.save();
  },

  onVictory(monster, result) {
    const h = this.state.hunter;
    const drops = monster.drops || [];
    let dropText = [];

    // 經驗值（含技能加成）
    let expGain = monster.exp;
    if (this.hasSkill('luck_3')) {
      expGain = Math.floor(expGain * 1.25);
    }
    h.exp += expGain;

    // 金幣（含技能加成）
    let goldGain = monster.gold;
    if (this.hasSkill('gather_3')) {
      goldGain = Math.floor(goldGain * 1.3);
    }
    h.gold += goldGain;

    // 素材掉落
    drops.forEach(drop => {
      let count = drop.count || 1;
      if (this.hasSkill('gather_1')) {
        count = Math.floor(count * 1.2);
      }
      this.state.materials[drop.id] = (this.state.materials[drop.id] || 0) + count;
      dropText.push(I18n.t(`mat_${drop.id}`, drop.id) + '×' + count);
    });

    // 圖鑑
    this.state.discovered.add(monster.id);
    this.state.defeated[monster.id] = (this.state.defeated[monster.id] || 0) + 1;
    this.state.totalKills++;
    if (monster.isBoss) this.state.bossKills++;

    // 升級檢查
    this.checkLevelUp();

    // 技能點
    this.state.skillPoints += monster.isBoss ? 5 : 1;

    // 死亡時重置 HP
    if (h.hp <= 0) h.hp = 1;

    // 戰鬥日誌
    if (typeof UI !== 'undefined' && UI.addBattleLog) {
      const title = monster.isBoss
        ? `👑 ${I18n.t('mon_' + monster.id, monster.name_zh)}（${I18n.t('boss')}）`
        : I18n.t('mon_' + monster.id, monster.name_zh);
      UI.addBattleLog(`✅ 擊敗 ${title}！EXP +${expGain} / Gold +${goldGain}${dropText.length ? ' / ' + dropText.join(', ') : ''}`, 'win');
    }

    // 區域解鎖（每擊殺 5 隻解鎖下一區）
    this.checkAreaUnlock();
  },

  onDeath(monster) {
    this.state.deathCount++;
    // 死亡懲罰：經驗值 -30%（不扣到負），金幣 -20%
    const h = this.state.hunter;
    h.exp = Math.max(0, Math.floor(h.exp * 0.7));
    h.gold = Math.max(0, Math.floor(h.gold * 0.8));
    h.hp = h.maxHp; // 復活（滿血）

    if (typeof UI !== 'undefined' && UI.addBattleLog) {
      UI.addBattleLog(`💀 你被 ${I18n.t('mon_' + monster.id, monster.name_zh)} 打敗了！損失 30% EXP 與 20% Gold`, 'death');
    }
  },

  hasSkill(skillId) {
    return (this.state.skills[skillId] || 0) > 0;
  },

  checkLevelUp() {
    while (this.state.hunter.exp >= this.state.hunter.expToNext) {
      this.state.hunter.exp -= this.state.hunter.expToNext;
      this.state.hunter.level++;
      this.state.hunter.expToNext = Math.floor(this.state.hunter.expToNext * 1.3);
      this.state.hunter.maxHp += 15;
      this.state.hunter.hp = this.state.hunter.maxHp;
      this.state.hunter.atk += 3;
      this.state.hunter.def += 1;
      this.state.skillPoints += 3;
      if (typeof UI !== 'undefined' && UI.addBattleLog) {
        UI.addBattleLog(`🎉 升級！Lv.${this.state.hunter.level}`, 'levelup');
      }
    }
  },

  checkAreaUnlock() {
    const order = ['forest', 'desert', 'snow', 'volcano', 'swamp', 'cave'];
    const killed = this.state.defeated;
    const requirements = {
      desert: 5,    // 5 隻森林魔物
      snow: 10,     // 10 隻森林
      volcano: 15,
      swamp: 20,
      cave: 25
    };

    order.forEach((areaId, idx) => {
      if (idx === 0) return;
      const need = requirements[areaId];
      const forestKills = Object.entries(killed)
        .filter(([id]) => Monsters.forest.monsters.find(m => m.id === id))
        .reduce((sum, [_, c]) => sum + c, 0);
      // 簡化：總擊殺數
      if (this.state.totalKills >= need * (idx)) {
        this.state.unlockedAreas.add(areaId);
      }
    });
  },

  switchArea(areaId) {
    if (this.state.unlockedAreas.has(areaId)) {
      this.state.currentArea = areaId;
      this.save();
      return true;
    }
    return false;
  },

  unlockArea(areaId) {
    this.state.unlockedAreas.add(areaId);
    this.save();
  },

  updateUI() {
    if (!this.state.hunter) return;
    if (typeof UI !== 'undefined') {
      UI.updateStats(this.state);
      UI.updateInventory(this.state);
    }
  }
};

window.GameCore = GameCore;