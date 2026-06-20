// ui.js — 介面渲染（含戰鬥動畫 + 裝備介面 + 圖鑑）
// V_0602

const UI = {
  battleLog: [],

  init() {
    this.bindEvents();
    this.bindCombatCallbacks();
  },

  bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'startBtn') this.handleCreate();
      if (e.target.classList.contains('weapon-card')) this.selectWeapon(e.target);
      if (e.target.classList.contains('area-btn')) this.switchArea(e.target.dataset.area);
      if (e.target.id === 'langToggle') this.toggleLang();
      if (e.target.id === 'resetBtn') {
        if (confirm(I18n.t('confirm_reset'))) GameCore.reset();
      }
      if (e.target.id === 'forgeBtn') this.openForge();
      if (e.target.id === 'forgeClose') this.closeForge();
      if (e.target.classList.contains('craft-btn')) this.craftItem(e.target.dataset.recipe);
      if (e.target.id === 'tabBestiary') this.showTab('bestiary');
      if (e.target.id === 'tabEquipment') this.showTab('equipment');
      if (e.target.id === 'tabLog') this.showTab('log');
    });
  },

  bindCombatCallbacks() {
    const arena = document.getElementById('battleArena');

    Combat.onAttack = (monster) => {
      const weaponImg = document.getElementById('weaponImg');
      if (weaponImg) {
        weaponImg.classList.add('attack-anim');
        setTimeout(() => weaponImg.classList.remove('attack-anim'), 300);
      }
    };

    Combat.onMonsterHit = (monster, dmg) => {
      const monsterImg = document.getElementById('monsterImg');
      if (monsterImg) {
        monsterImg.classList.add('shake');
        monsterImg.classList.add('flash');
        // 顯示傷害數字
        this.showDamageNumber(dmg, monster.isBoss ? 'boss' : 'monster');
        setTimeout(() => {
          monsterImg.classList.remove('shake');
          monsterImg.classList.remove('flash');
        }, 300);
      }
    };

    Combat.onMonsterAttack = (monster) => {
      const monsterImg = document.getElementById('monsterImg');
      if (monsterImg) {
        monsterImg.classList.add('attack-anim');
        setTimeout(() => monsterImg.classList.remove('attack-anim'), 300);
      }
    };

    Combat.onPlayerHit = (monster, dmg) => {
      const weaponImg = document.getElementById('weaponImg');
      if (weaponImg) {
        weaponImg.classList.add('shake');
        setTimeout(() => weaponImg.classList.remove('shake'), 300);
        this.showDamageNumber(dmg, 'player');
      }
    };

    Combat.onVictory = (monster) => {
      const monsterImg = document.getElementById('monsterImg');
      if (monsterImg) {
        monsterImg.classList.add('fade-out');
        setTimeout(() => monsterImg.classList.remove('fade-out'), 1000);
      }
      if (monster.isBoss) {
        this.showBossVictory(monster);
      }
    };

    Combat.onBossEncounter = (monster) => {
      this.showBossEncounter(monster);
    };

    Combat.onDefeat = (monster) => {
      // 視覺提示
      const weaponImg = document.getElementById('weaponImg');
      if (weaponImg) {
        weaponImg.classList.add('death-flash');
        setTimeout(() => weaponImg.classList.remove('death-flash'), 1000);
      }
    };
  },

  selectWeapon(card) {
    document.querySelectorAll('.weapon-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
  },

  handleCreate() {
    const name = document.getElementById('hunterName').value || '獵人';
    const weapon = document.querySelector('.weapon-card.selected');
    if (!weapon) {
      alert(I18n.t('select_weapon'));
      return;
    }
    GameCore.createHunter(name, weapon.dataset.weapon);
    this.showGame();
  },

  showGame() {
    document.getElementById('createScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    this.updateStats(GameCore.state);
    this.updateInventory(GameCore.state);
    this.renderSkillTree();
    this.renderBestiary();
    this.renderEquipment();
    this.renderAreaButtons();
    this.updatePlayerImg();
  },

  updatePlayerImg() {
    const img = document.getElementById('weaponImg');
    if (img && GameCore.state.hunter) {
      img.src = `assets/weapons/${GameCore.state.hunter.weapon}.png`;
    }
  },

  updateMonsterImg(monster) {
    const img = document.getElementById('monsterImg');
    if (img && monster && monster.id) {
      img.src = `assets/monsters/${monster.id}.png`;
      img.alt = I18n.t(`mon_${monster.id}`, monster.name_zh || monster.id);
    }
  },

  updateStats(state) {
    if (!state.hunter) return;
    const h = state.hunter;
    document.getElementById('hunterName').textContent = h.name;
    document.getElementById('hunterLevel').textContent = h.level;
    document.getElementById('hunterHp').textContent = `${h.hp}/${h.maxHp}`;
    document.getElementById('hunterAtk').textContent = h.atk;
    document.getElementById('hunterDef').textContent = h.def;
    document.getElementById('hunterGold').textContent = h.gold;
    document.getElementById('hunterExp').textContent = `${h.exp}/${h.expToNext}`;
    document.getElementById('skillPoints').textContent = state.skillPoints;
    document.getElementById('totalKills').textContent = state.totalKills;
    document.getElementById('bossKills').textContent = state.bossKills;
    document.getElementById('deathCount').textContent = state.deathCount;

    const area = Monsters[state.currentArea];
    if (area) {
      document.getElementById('currentArea').textContent = `${area.icon} ${I18n.t('area_' + state.currentArea)}`;
    }

    // HP 條
    const hpPercent = (h.hp / h.maxHp) * 100;
    const hpBar = document.getElementById('hpBar');
    if (hpBar) hpBar.style.width = `${hpPercent}%`;

    // Exp 條
    const expPercent = (h.exp / h.expToNext) * 100;
    const expBar = document.getElementById('expBar');
    if (expBar) expBar.style.width = `${expPercent}%`;
  },

  updateInventory(state) {
    const inv = document.getElementById('inventory');
    if (!inv) return;
    inv.innerHTML = '';
    const entries = Object.entries(state.materials).filter(([_, c]) => c > 0);
    if (entries.length === 0) {
      inv.innerHTML = `<p class="empty">${I18n.t('inventory_empty')}</p>`;
      return;
    }
    entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .forEach(([id, count]) => {
        const div = document.createElement('div');
        div.className = 'inv-item';
        div.innerHTML = `<span class="inv-name">${I18n.t(`mat_${id}`, id)}</span><span class="inv-count">×${count}</span>`;
        inv.appendChild(div);
      });
  },

  renderSkillTree() {
    const container = document.getElementById('skillTree');
    if (!container) return;
    const weapon = GameCore.state.hunter.weapon;
    const weaponTree = Skills.getWeaponTree(weapon);
    const allSkills = [
      ...weaponTree.map(s => ({...s, tree: 'weapon'})),
      ...Skills.commonTrees.attack.map(s => ({...s, tree: 'attack'})),
      ...Skills.commonTrees.defense.map(s => ({...s, tree: 'defense'})),
      ...Skills.commonTrees.gather.map(s => ({...s, tree: 'gather'})),
      ...Skills.commonTrees.luck.map(s => ({...s, tree: 'luck'}))
    ];

    container.innerHTML = '';
    allSkills.forEach(skill => {
      const current = GameCore.state.skills[skill.id] || 0;
      const canLearn = Skills.canLearn(skill.id);
      const div = document.createElement('div');
      div.className = `skill-card ${canLearn ? 'learnable' : ''} ${current > 0 ? 'learned' : ''}`;
      div.innerHTML = `
        <div class="skill-name">${I18n.t(`skill_${skill.id}`, skill.name_zh || skill.id)}</div>
        <div class="skill-desc">${I18n.t(`skill_${skill.id}_desc`, skill.desc_zh || skill.id)}</div>
        <div class="skill-meta">
          <span class="skill-level">Lv ${current}/${skill.max}</span>
          <span class="skill-cost">${skill.cost}pt</span>
        </div>
      `;
      if (canLearn) {
        div.addEventListener('click', () => {
          Skills.learn(skill.id);
          this.renderSkillTree();
          this.updateStats(GameCore.state);
        });
      }
      container.appendChild(div);
    });
  },

  renderBestiary() {
    const container = document.getElementById('bestiary');
    if (!container) return;
    container.innerHTML = '';

    ['forest','desert','snow','volcano','swamp','cave'].forEach(areaId => {
      const area = Monsters[areaId];
      const locked = !GameCore.state.unlockedAreas.has(areaId);
      const section = document.createElement('div');
      section.className = 'bestiary-area';
      if (locked) {
        section.innerHTML = `<h3>🔒 ${I18n.t('area_' + areaId)} <span style="color:#888;font-size:10px;">(擊殺 ${areaId === 'desert' ? 5 : areaId === 'snow' ? 10 : areaId === 'volcano' ? 15 : areaId === 'swamp' ? 20 : 25} 隻解鎖)</span></h3>`;
      } else {
        section.innerHTML = `<h3>${area.icon} ${I18n.t('area_' + areaId)}</h3>`;
        area.monsters.forEach(m => {
          const discovered = GameCore.state.discovered.has(m.id);
          const defeated = GameCore.state.defeated[m.id] || 0;
          const card = document.createElement('div');
          card.className = `monster-card ${discovered ? '' : 'undiscovered'}`;
          if (discovered) {
            card.innerHTML = `
              <img src="assets/monsters/${m.id}.png" alt="${m.name_zh}" class="monster-img">
              <div class="m-info">
                <div class="m-name">${I18n.t(`mon_${m.id}`, m.name_zh)}</div>
                <div class="m-kills">×${defeated}</div>
              </div>`;
          } else {
            card.innerHTML = `<div class="m-unknown">❓</div><div class="m-kills">-</div>`;
          }
          section.appendChild(card);
        });
      }
      container.appendChild(section);
    });

    // Boss 區
    const bossSection = document.createElement('div');
    bossSection.className = 'bestiary-boss';
    bossSection.innerHTML = `<h3>👑 ${I18n.t('bosses')}</h3>`;
    Monsters.bosses.forEach(b => {
      const discovered = GameCore.state.discovered.has(b.id);
      const defeated = GameCore.state.defeated[b.id] || 0;
      const card = document.createElement('div');
      card.className = `monster-card boss ${discovered ? '' : 'undiscovered'}`;
      if (discovered) {
        card.innerHTML = `
          <img src="assets/monsters/${b.id}.png" alt="${b.name_zh}" class="monster-img boss-img">
          <div class="m-info">
            <div class="m-name">${I18n.t(`mon_${b.id}`, b.name_zh)}</div>
            <div class="m-kills">×${defeated}</div>
          </div>`;
      } else {
        card.innerHTML = `<div class="m-unknown">👑❓</div><div class="m-kills">-</div>`;
      }
      bossSection.appendChild(card);
    });
    container.appendChild(bossSection);
  },

  // ========== 裝備介面 ==========
  renderEquipment() {
    const container = document.getElementById('equipmentList');
    if (!container) return;
    container.innerHTML = '';

    const weaponId = GameCore.state.hunter.weapon;
    const weaponRecipes = Equipment.getWeaponTiers(weaponId);

    // 武器分頁
    const weaponSection = document.createElement('div');
    weaponSection.innerHTML = `<h4>⚔️ ${I18n.t('weapon_' + weaponId)} ${I18n.t('forge_weapons')}</h4>`;
    weaponRecipes.forEach(recipe => {
      const canCraft = Equipment.canCraft(recipe);
      const owned = GameCore.state.equipment.weapon === recipe.id;
      const div = document.createElement('div');
      div.className = `recipe-card ${owned ? 'owned' : ''} ${canCraft ? 'can-craft' : ''}`;
      const costStr = recipe.cost.map(c => `${I18n.t('mat_' + c.mat, c.mat)}×${c.qty}`).join(', ');
      div.innerHTML = `
        <div class="recipe-name">${I18n.t(recipe.name_zh, recipe.name_zh)} ${owned ? '✅' : ''}</div>
        <div class="recipe-stats">ATK +${recipe.atk}</div>
        <div class="recipe-cost">${costStr}</div>
        <button class="craft-btn" data-recipe="${recipe.id}" ${canCraft && !owned ? '' : 'disabled'}>
          ${owned ? I18n.t('equipped') : canCraft ? I18n.t('forge_craft') : I18n.t('forge_not_enough')}
        </button>
      `;
      weaponSection.appendChild(div);
    });
    container.appendChild(weaponSection);

    // 防具分頁
    const armorSection = document.createElement('div');
    armorSection.innerHTML = `<h4>🛡️ ${I18n.t('forge_armors')}</h4>`;
    Equipment.getArmors().forEach(recipe => {
      const canCraft = Equipment.canCraft(recipe);
      const owned = GameCore.state.equipment.armor === recipe.id;
      const div = document.createElement('div');
      div.className = `recipe-card ${owned ? 'owned' : ''} ${canCraft ? 'can-craft' : ''}`;
      const costStr = recipe.cost.map(c => `${I18n.t('mat_' + c.mat, c.mat)}×${c.qty}`).join(', ');
      div.innerHTML = `
        <div class="recipe-name">${recipe.name_zh} ${owned ? '✅' : ''}</div>
        <div class="recipe-stats">DEF +${recipe.def} / HP +${recipe.hp}</div>
        <div class="recipe-cost">${costStr}</div>
        <button class="craft-btn" data-recipe="${recipe.id}" ${canCraft && !owned ? '' : 'disabled'}>
          ${owned ? I18n.t('equipped') : canCraft ? I18n.t('forge_craft') : I18n.t('forge_not_enough')}
        </button>
      `;
      armorSection.appendChild(div);
    });
    container.appendChild(armorSection);
  },

  openForge() {
    this.renderEquipment();
    document.getElementById('forgeModal').style.display = 'flex';
  },

  closeForge() {
    document.getElementById('forgeModal').style.display = 'none';
  },

  craftItem(recipeId) {
    const result = Equipment.craft(recipeId);
    if (result.ok) {
      this.addBattleLog(`🔨 打造成功：${I18n.t(result.recipe.name_zh, result.recipe.name_zh)}！`, 'craft');
      this.renderEquipment();
      this.updateStats(GameCore.state);
      this.updateInventory(GameCore.state);
    } else {
      this.addBattleLog(`❌ 打造失敗：素材不足`, 'error');
    }
  },

  // ========== 分頁切換 ==========
  showTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
    const targetBtn = document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
    const targetPanel = document.getElementById('panel' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
    if (targetBtn) targetBtn.classList.add('active');
    if (targetPanel) targetPanel.style.display = 'block';

    if (tabName === 'bestiary') this.renderBestiary();
    if (tabName === 'equipment') this.renderEquipment();
    if (tabName === 'log') this.renderLog();
  },

  // ========== 戰鬥日誌 ==========
  addBattleLog(text, type = '') {
    const log = {
      text,
      type,
      time: Date.now()
    };
    this.battleLog.unshift(log);
    if (this.battleLog.length > 50) this.battleLog = this.battleLog.slice(0, 50);
    this.renderLog();
  },

  renderLog() {
    const container = document.getElementById('logList');
    if (!container) return;
    container.innerHTML = '';
    this.battleLog.forEach(log => {
      const p = document.createElement('p');
      p.className = `log-entry log-${log.type}`;
      p.textContent = log.text;
      container.appendChild(p);
    });
    // 自動捲到最頂端（最新訊息在最上方）
    container.scrollTop = 0;
  },

  // ========== 區域切換 ==========
  renderAreaButtons() {
    const container = document.getElementById('areaButtons');
    container.innerHTML = '';
    ['forest','desert','snow','volcano','swamp','cave'].forEach(areaId => {
      const unlocked = GameCore.state.unlockedAreas.has(areaId);
      const btn = document.createElement('button');
      btn.className = `area-btn ${GameCore.state.currentArea === areaId ? 'active' : ''} ${unlocked ? '' : 'locked'}`;
      btn.dataset.area = areaId;
      btn.textContent = unlocked ? I18n.t('area_' + areaId) : '🔒';
      btn.disabled = !unlocked;
      container.appendChild(btn);
    });
  },

  switchArea(areaId) {
    if (GameCore.switchArea(areaId)) {
      this.renderAreaButtons();
      this.updateStats(GameCore.state);
      this.addBattleLog(`🗺️ 移動到 ${I18n.t('area_' + areaId)}`, 'area');
    }
  },

  // ========== Boss 過場 ==========
  showBossEncounter(monster) {
    const overlay = document.getElementById('bossOverlay');
    if (!overlay) return;
    document.getElementById('bossEncounterName').textContent = I18n.t(`mon_${monster.id}`, monster.name_zh);
    document.getElementById('bossEncounterImg').src = `assets/monsters/${monster.id}.png`;
    overlay.style.display = 'flex';
    overlay.classList.add('boss-flash');
    setTimeout(() => {
      overlay.classList.remove('boss-flash');
      overlay.style.display = 'none';
    }, 2500);
  },

  showBossVictory(monster) {
    const overlay = document.getElementById('victoryOverlay');
    if (!overlay) return;
    document.getElementById('victoryName').textContent = I18n.t(`mon_${monster.id}`, monster.name_zh);
    const victoryImg = document.getElementById('victoryImg');
    if (victoryImg && monster.id) {
      victoryImg.src = `assets/monsters/${monster.id}.png`;
    }
    overlay.style.display = 'flex';
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 2000);
  },

  // ========== 傷害數字 ==========
  showDamageNumber(dmg, target) {
    let container;
    if (target === 'player') container = document.getElementById('weaponImg').parentElement;
    else if (target === 'boss') container = document.getElementById('monsterImg').parentElement;
    else container = document.getElementById('monsterImg').parentElement;

    const num = document.createElement('div');
    num.className = 'damage-number';
    num.textContent = `-${dmg}`;
    num.style.left = `${Math.random() * 60 + 20}%`;
    num.style.top = `${Math.random() * 30 + 10}%`;
    container.appendChild(num);
    setTimeout(() => num.remove(), 1000);
  },

  // ========== 語言切換 ==========
  toggleLang() {
    I18n.toggle();
    this.refreshAll();
  },

  refreshAll() {
    if (GameCore.state.hunter) {
      this.updateStats(GameCore.state);
      this.updateInventory(GameCore.state);
      this.renderSkillTree();
      this.renderBestiary();
      this.renderEquipment();
      this.renderAreaButtons();
      this.renderLog();
    }
  }
};

window.UI = UI;