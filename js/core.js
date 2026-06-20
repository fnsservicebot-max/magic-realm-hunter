// core.js — 遊戲核心：狀態管理、放置 loop、存檔、HP 回復
// V_0612 — 即時戰鬥（每秒一回合）

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
    deathCount: 0,
    battle: { active: false, monster: null, timer: null }
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
      expToNext: 200,
      hp: 100,
      maxHp: 100,
      atk: weapon.baseAtk,
      def: 5,
      gold: 0,
      critRate: 0.05,   // 基礎暴擊率 5%
      critDmg: 1.5,     // 暴擊傷害 150%
      dodgeRate: 0.05,  // 基礎閃避率 5%
      hitRate: 0.95,    // 基礎命中率 95%（V_0620 新增）
      skills: {}        // 技能學習狀態（V_0620 傳給 combat 用）
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
      this.updateUI();
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
    // 戰鬥中不重新 encounter
    if (this.state.battle && this.state.battle.active) return;
    const monster = Monsters.encounter(this.state.currentArea, this.state.hunter.level);
    if (!monster) return;
    this.startBattle(monster);
  },

  // 啟動即時戰鬥（每秒一回合）
  startBattle(monster) {
    // 若已有戰鬥，先結束（避免殘留）
    if (this.state.battle && this.state.battle.active) {
      clearInterval(this.state.battle.timer);
      this.state.battle = { active: false, monster: null, timer: null };
    }

    this.state.battle = { active: true, monster, timer: null };

    // 同步技能狀態到 hunter（給 combat 讀）
    this.state.hunter.skills = GameCore.state.skills || {};

    if (typeof UI !== 'undefined' && UI.updateMonsterImg) {
      UI.updateMonsterImg(monster);
    }
    if (typeof UI !== 'undefined' && UI.addBattleLog) {
      const title = monster.isBoss
        ? `👑 ${I18n.t('mon_' + monster.id, monster.name_zh)}（${I18n.t('boss')}）`
        : I18n.t('mon_' + monster.id, monster.name_zh);
      UI.addBattleLog(`⚔️ 遭遇 ${title}！`, 'encounter');
    }

    // 計算玩家有效屬性（包含技能 buff）
    const eff = Skills.getEffectiveStats(this.state.hunter);
    // 怪物屬性（補上預設）
    const mStats = {
      mAtk: monster.atk,
      mCrit: monster.critRate || 0.05,
      mCritDmg: monster.critDmg || 1.5,
      mHit: monster.hitRate || 0.90,
      mDodge: monster.dodgeRate || 0.02
    };
    this.state.battle.playerEff = eff;
    this.state.battle.monsterStats = mStats;

    const round = () => {
      if (!this.state.battle.active) return;
      const eff = this.state.battle.playerEff;
      const ms = this.state.battle.monsterStats;

      // 玩家攻擊（含命中/閃避/暴擊 + 技能 buff）
      if (Combat.onAttack) Combat.onAttack(monster);
      const pResult = Combat.attackWithStats(eff.atk, eff.critRate, eff.critDmg, eff.hitRate, ms.mDodge);
      if (pResult.missed) {
        if (typeof UI !== 'undefined' && UI.addBattleLog) {
          UI.addBattleLog('💨 你的攻擊未命中！', 'miss');
        }
      } else if (pResult.dodged) {
        if (typeof UI !== 'undefined' && UI.addBattleLog) {
          UI.addBattleLog(`💨 ${monster.name_zh || monster.name_en} 閃避了攻擊！`, 'dodge');
        }
        if (Combat.onDodge) Combat.onDodge(monster, this.state.hunter);
      } else {
        monster.hp = Math.max(0, monster.hp - pResult.dmg);
        if (Combat.onMonsterHit) Combat.onMonsterHit(monster, pResult.dmg, pResult.crit);
        if (typeof UI !== 'undefined' && UI.addBattleLog) {
          UI.addBattleLog(pResult.crit ? `💥 暴擊！攻擊：${pResult.dmg} 傷害` : `⚔️ 攻擊：${pResult.dmg} 傷害`, pResult.crit ? 'crit' : 'attack');
        }
      }

      if (monster.hp <= 0) {
        this.endBattle(true);
        return;
      }

      // 怪物反擊
      if (Combat.onMonsterAttack) Combat.onMonsterAttack(monster);
      const mResult = Combat.attackWithStats(ms.mAtk, ms.mCrit, ms.mCritDmg, ms.mHit, eff.dodgeRate);
      if (mResult.missed) {
        if (typeof UI !== 'undefined' && UI.addBattleLog) {
          UI.addBattleLog(`💨 ${monster.name_zh || monster.name_en} 攻擊未命中！`, 'miss');
        }
      } else if (mResult.dodged) {
        if (typeof UI !== 'undefined' && UI.addBattleLog) {
          UI.addBattleLog(`💨 你閃避了 ${monster.name_zh || monster.name_en} 的攻擊！`, 'dodge');
        }
        if (Combat.onDodge) Combat.onDodge(this.state.hunter, monster);
      } else {
        const reduced = Math.floor(mResult.dmg * (1 - eff.damageReduction));
        this.state.hunter.hp = Math.max(0, this.state.hunter.hp - reduced);
        if (Combat.onPlayerHit) Combat.onPlayerHit(monster, reduced, mResult.crit);
        if (typeof UI !== 'undefined' && UI.addBattleLog) {
          UI.addBattleLog(mResult.crit
            ? `💥 ${monster.name_zh || monster.name_en} 暴擊！反擊：${reduced} 傷害`
            : `💥 ${monster.name_zh || monster.name_en} 反擊：${reduced} 傷害`, 'damage');
        }
      }

      // 即時更新 UI（HP 條等）
      if (typeof UI !== 'undefined' && UI.updateStats) {
        UI.updateStats(this.state);
      }

      if (this.state.hunter.hp <= 0) {
        this.endBattle(false);
        return;
      }
    };

    // 立即跑第一回合，之後每 1000ms 一回合
    this.state.battle.timer = setInterval(round, 1000);
    round();
  },

  // 結束戰鬥
  endBattle(victory) {
    if (this.state.battle && this.state.battle.timer) {
      clearInterval(this.state.battle.timer);
    }
    const monster = this.state.battle.monster;
    if (!monster) {
      this.state.battle = { active: false, monster: null, timer: null };
      return;
    }

    this.state.battle = { active: false, monster: null, timer: null };

    if (victory) {
      this.onVictory(monster);
    } else {
      this.onDeath(monster);
    }
    this.save();
    if (typeof UI !== 'undefined' && UI.updateStats) {
      UI.updateStats(this.state);
    }
  },

  // 同步戰鬥（給 E2E 測試 / 手動觸發用）
  hunt(monster) {
    if (typeof UI !== 'undefined' && UI.updateMonsterImg) {
      UI.updateMonsterImg(monster);
    }
    const result = Combat.simulate(this.state.hunter, monster);
    this.state.hunter.hp = Math.max(0, this.state.hunter.hp - result.damageTaken);
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

    // 技能點（僅升級時獲得，擊殺不再給點）
    // 規則：每 2 級 +1 技能點（在 checkLevelUp 內處理）

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
      this.state.hunter.expToNext = Math.floor(this.state.hunter.expToNext * 1.5);
      this.state.hunter.maxHp += 15;
      this.state.hunter.hp = this.state.hunter.maxHp;
      this.state.hunter.atk += 3;
      this.state.hunter.def += 1;
      // 技能點：每 2 級 +1（偶數級才給）
      if (this.state.hunter.level % 2 === 0) {
        this.state.skillPoints += 1;
        if (typeof UI !== 'undefined' && UI.addBattleLog) {
          UI.addBattleLog(`🎉 升級！Lv.${this.state.hunter.level}（+1 技能點）`, 'levelup');
        }
      } else {
        if (typeof UI !== 'undefined' && UI.addBattleLog) {
          UI.addBattleLog(`🎉 升級！Lv.${this.state.hunter.level}`, 'levelup');
        }
      }
    }
  },

  // 計算某區域內的擊殺總數
  getAreaKills(areaId) {
    const area = Monsters[areaId];
    if (!area) return 0;
    return Object.entries(this.state.defeated)
      .filter(([id]) => area.monsters.find(m => m.id === id))
      .reduce((sum, [_, c]) => sum + c, 0);
  },

  // 區域解鎖（方案 B：在前一區擊殺 X 隻解鎖下一區，數量 ×20）
  checkAreaUnlock() {
    const order = ['forest', 'desert', 'snow', 'volcano', 'swamp', 'cave'];
    const requirements = {
      desert: 100,    // 100 隻森林擊殺
      snow: 200,      // 200 隻荒漠擊殺
      volcano: 300,
      swamp: 400,
      cave: 500
    };

    order.forEach((areaId, idx) => {
      if (idx === 0) return;
      const need = requirements[areaId];
      const prevArea = order[idx - 1];
      const prevKills = this.getAreaKills(prevArea);
      if (prevKills >= need) {
        this.state.unlockedAreas.add(areaId);
      }
    });
  },

  // ========== 補血藥劑系統 ==========
  potions: {
    small:  { id: 'small',  name_zh: '小型藥水', name_en: 'Small Potion',  heal: 30,  cost: 10,  icon: '🧪' },
    medium: { id: 'medium', name_zh: '中型藥水', name_en: 'Medium Potion', heal: 80,  cost: 30,  icon: '🧪' },
    large:  { id: 'large',  name_zh: '大型藥水', name_en: 'Large Potion',  heal: 200, cost: 100, icon: '🧪' }
  },

  // 購買並使用藥劑（扣金幣、加 HP、上限保護）
  buyPotion(potionId) {
    const potion = this.potions[potionId];
    if (!potion) return { ok: false, reason: 'unknown_potion' };
    const h = this.state.hunter;
    if (!h) return { ok: false, reason: 'no_hunter' };
    if (h.hp >= h.maxHp) {
      return { ok: false, reason: 'full_hp' };
    }
    if (h.gold < potion.cost) {
      return { ok: false, reason: 'not_enough_gold' };
    }
    h.gold -= potion.cost;
    const before = h.hp;
    h.hp = Math.min(h.maxHp, h.hp + potion.heal);
    const healed = h.hp - before;
    this.save();
    return { ok: true, healed, spent: potion.cost, potion };
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