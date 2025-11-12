// Улучшенный основной класс игры с «умным» поиском картинок
class BreweryGame {
  constructor() {
    this.levels = {
      1: {
        name: "Основы заторного процесса",
        time: 180,
        settings: [
          { id: "hot-water-temp", correct: 80, min: 0, max: 100, step: 1, label: "Температура в баке горячей воды (°C)" },
          { id: "wort-brewing-time", correct: 7, min: 1, max: 24, step: 1, label: "Время от затирания до перекачки в ЦКТ" }
        ],
        threshold3: 30,
        threshold2: 60,
        description: "Добро пожаловать в варочный цех, ученик пивовара! Прежде чем начать варку, нужно правильно подготовить затор. От точности начальных настроек зависит всё - от прозрачности сусла до будущего вкуса пива. Настрой температуру воды и время затирания.",
        hint: "Температура горячей воды = температуре промывных вод в фильтрационном аппарате. Время затирания подбери опытным путём..."
      },
      2: {
        name: "Сборка варочной линии",
        time: 300,
        slots: [
          { id: "slot1", correct: "malt-crusher", number: 1 },
          { id: "slot2", correct: "steam-generator", number: 2 },
          { id: "slot3", correct: "congestion-device", number: 3 },
          { id: "slot4", correct: "filtration-unit", number: 4 },
          { id: "slot5", correct: "hot-water-tank", number: 5 },
          { id: "slot6", correct: "wort-brewing-machine", number: 6 },
          { id: "slot7", correct: "hydrocyclone-apparatus", number: 7 }
        ],
        equipment: [
          "malt-crusher", "congestion-device", "steam-generator", 
          "hot-water-tank", "filtration-unit", "wort-brewing-machine", 
          "hydrocyclone-apparatus", "heat-exchanger", "chiller", 
          "cylinder-conical-tank"
        ],
        threshold3: 60,
        threshold2: 120,
        description: "Отличная работа с настройками! Теперь собери технологическую цепочку варочного цеха. Расставь оборудование в правильной последовательности - от подготовки сырья до получения сусла. Каждое звено цепи критически важно!",
        hint: "Правильный порядок: Дробилка солода → Парогенератор → .. → .. → Бак горячей воды → .. → .."
      },
      3: {
        name: "Настройки брожения",
        time: 180,
        settings: [
          { id: "tank-temp", correct: -2, min: -10, max: 10, step: 1, label: "Температура в ЦКТ (°C)" },
          { id: "maturation-time", correct: 21, min: 5, max: 60, step: 1, label: "Время созревания (дни)" }
        ],
        threshold3: 30,
        threshold2: 60,
        description: "Сусло готово! Теперь самый деликатный этап - брожение. Дрожжи - живые организмы, требующие идеальных условий. Установи температуру созревания и продолжительность ферментации. Один неверный параметр - и весь результат под угрозой.",
        hint: "Температура в ЦКТ .. , время созревания: 21 день"
      },
      4: {
        name: "Финальная сборка",
        time: 180,
        slots: [
          { id: "slot1", correct: "heat-exchanger", number: 1 },
          { id: "slot2", correct: "chiller", number: 2 },
          { id: "slot3", correct: "cylinder-conical-tank", number: 3 }
        ],
        equipment: [
          "malt-crusher", "congestion-device", "steam-generator", 
          "hot-water-tank", "filtration-unit", "wort-brewing-machine", 
          "hydrocyclone-apparatus", "heat-exchanger", "chiller", 
          "cylinder-conical-tank"
        ],
        threshold3: 30,
        threshold2: 60,
        description: "Пиво почти готово! Осталось собрать линию охлаждения и дображивания. Выбери только необходимое оборудование для финального этапа. Помни - здесь важна не только последовательность, но и правильный выбор аппаратов.",
        hint: "Правильный порядок: .. → Чилер → .."
      }
    };

    this.state = {
      currentLevel: 1,
      timeLeft: 0,
      gameStarted: false,
      equipmentPlaced: 0,
      hintUsed: false,
      draggedItem: null,
      selectedEquipment: null,
      savedLayouts: {1:{settings:{}}, 2:{}, 3:{settings:{}}, 4:{}},
      levelResults: {
        1: { correct: 0, total: 2 },
        2: { correct: 0, total: 7 },
        3: { correct: 0, total: 2 },
        4: { correct: 0, total: 3 }
      }
    };

    this.progress = { unlockedLevels: [1], bestScores: {} };
    this.hintPulseInterval = null;
    this.hintPulseEnabled = true;

    this.initElements();
    this.initEmailForm();

    this.IMAGE_BASE = 'assets/images/';
    this.PLACEHOLDER = this.IMAGE_BASE + 'placeholder.png';
    this.CUSTOM_IMAGE_MAP = {};
    this.IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    this.selectionMode = true;
    this.levelReview = {1:{}, 2:{}, 3:{}, 4:{}};

    this.initEventListeners();
    this.loadProgress();
    this.renderLevelCards();
    this.preloadAssets();

    // Запускаем интро-анимацию при загрузке
    setTimeout(() => {
      this.initIntroAnimation();
    }, 500);
  }

  isVerySmallScreen() {
    return window.innerWidth <= 360;
  }

  initIntroAnimation() {
    const overlay = document.getElementById('animation-overlay');
    const mainContent = document.getElementById('main-content');
    
    if (!overlay || !mainContent) {
      console.log('Элементы анимации не найдены');
      return;
    }
    
setTimeout(() => {
  overlay.style.display = 'none';
  mainContent.classList.remove('hidden');
}, 500); // ← Уменьшите до 0.5 секунды
  }

  setSmartImage(imgEl, equipId) {
    const manual = this.CUSTOM_IMAGE_MAP[equipId];
    const baseNames = manual
      ? [manual]
      : [
          equipId,
          equipId.replace(/-/g, '_'),
          equipId.replace(/-/g, ' '),
          equipId.replace(/-/g, ''),
        ];

    const candidates = [];
    for (const base of baseNames) {
      if (/\.(png|jpg|jpeg|webp|gif)$/i.test(base)) {
        candidates.push(this.IMAGE_BASE + base);
      } else {
        for (const ext of this.IMAGE_EXTS) {
          candidates.push(this.IMAGE_BASE + base + ext);
        }
      }
    }
    candidates.push(this.PLACEHOLDER);

    let idx = 0;
    const tryNext = () => {
      if (idx >= candidates.length) return;
      const url = candidates[idx++];
      imgEl.src = url;
    };

    imgEl.onerror = () => {
      if (imgEl.src.endsWith(this.PLACEHOLDER)) return;
      tryNext();
    };

    tryNext();
  }

initElements() {
    this.elements = {
        startScreen: document.getElementById('start-screen'),
        levelSelectScreen: document.getElementById('level-select-screen'),
        gameScreen: document.getElementById('game-screen'),
        winScreen: document.getElementById('win-screen'),
        loseScreen: document.getElementById('lose-screen'),
        startBtn: document.getElementById('start-btn'),
        backToMenuBtn: document.getElementById('back-to-menu'),
        levelCardsContainer: document.querySelector('.level-cards'),
        launchBtn: document.getElementById('launch-btn'),
        hintBtn: document.getElementById('hint-btn'),
        timerDisplay: document.querySelector('.timer'),
        feedbackMessage: document.querySelector('.feedback-message'),
        timeSpentDisplay: document.getElementById('time-spent'),
        scoreDisplay: document.getElementById('score-earned'),
        scoreDisplayLose: document.getElementById('score-earned-lose'),
        levelNameDisplay: document.querySelector('.level-name'),
        levelDescText: document.getElementById('level-desc-text'),
        playground: document.querySelector('.playground'),
        equipmentPanel: document.querySelector('.equipment-panel'),
        equipmentPanelContainer: document.querySelector('.equipment-panel-container'),
        hintModal: document.getElementById('hint-modal'),
        hintText: document.getElementById('hint-text'),
        closeModal: document.querySelector('.close-modal'),
        settingsContainer: document.querySelector('.settings-container'),
        levelDetails: document.getElementById('level-details'),
        levelDetailsLose: document.getElementById('level-details-lose'),
        breweryBackground: document.querySelector('.brewery-background'), // ← ЗАПЯТАЯ вместо точки с запятой
        playgroundContainer: document.querySelector('.playground-container') // ← БЕЗ точки с запятой в конце
    };

    this.sounds = {
      success: new Audio('assets/sounds/success.mp3'),
      error: new Audio('assets/sounds/error.mp3'),
      click: new Audio('assets/sounds/click.mp3')
    };
    Object.values(this.sounds).forEach(a => { try { a.preload = 'auto'; } catch(_){} });
  }

  buildPartialHint(levelNum) {
    if (levelNum === 1) {
      return "Температура горячей воды = температуре промывных вод в фильтрационном аппарате. Время затирания подбери опытным путём...";
    }
    if (levelNum === 2) {
      const map = {
        1: this.getEquipmentName(this.levels[2].slots[0].correct),
        2: this.getEquipmentName(this.levels[2].slots[1].correct),
        5: this.getEquipmentName(this.levels[2].slots[4].correct),
      };
      let lines = [];
      for (let i = 1; i <= 7; i++) {
        if (map[i]) {
          lines.push(`${i}) ${map[i]}`);
        } else {
          lines.push(`${i}) •••`);
        }
      }
      return lines.join('\n');
    }
    if (levelNum === 3) {
      return "Подсказка: температура в ЦКТ .. , время созревания 21 день (±2 дня)";
    }
    if (levelNum === 4) {
      const name = this.getEquipmentName(this.levels[4].slots[1].correct);
      return `1) •••\n2) ${name}\n3) •••`;
    }
    return "";
  }

  openInfoModal(text, buttons = []) {
    this.elements.hintText.textContent = "";
    this.elements.hintText.innerText = text;
    const oldBtns = this.elements.hintModal.querySelectorAll('.modal-action');
    oldBtns.forEach(b => b.remove());
    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.justifyContent = 'center';
    footer.style.gap = '10px';
    footer.style.marginTop = '10px';
    buttons.forEach(({label, onClick, variant}) => {
      const btn = document.createElement('button');
      btn.className = 'modal-action';
      btn.textContent = label;
      btn.style.padding = '10px 16px';
      btn.style.borderRadius = '10px';
      btn.style.border = 'none';
      btn.style.cursor = 'pointer';
      btn.style.fontWeight = '600';
      btn.style.background = variant === 'secondary' ? '#e5e7eb' : '#3b82f6';
      btn.style.color = variant === 'secondary' ? '#111827' : '#fff';
      btn.addEventListener('click', () => { onClick(); this.closeHintModal(); });
      footer.appendChild(btn);
    });
    this.elements.hintModal.querySelector('.modal-content').appendChild(footer);
    this.elements.hintModal.classList.remove('hidden');
  }

  initEventListeners() {
    this.elements.startBtn.addEventListener('click', () => this.showLevelSelect());
    this.elements.backToMenuBtn.addEventListener('click', () => this.showStartScreen());
    this.elements.launchBtn.addEventListener('click', () => this.checkSolution());
    this.elements.hintBtn.addEventListener('click', () => this.showHint());
    this.elements.closeModal.addEventListener('click', () => this.closeHintModal());
    this.elements.hintModal.addEventListener('click', (e)=>{
      if (e.target === this.elements.hintModal) this.closeHintModal();
    });

    if (this.selectionMode) { this.initSelectionHandlers(); } else if (this.isMobile()) { this.initMobileHandlers(); } else { this.initDesktopHandlers(); }

    document.querySelectorAll('.restart-btn').forEach(btn => {
      btn.addEventListener('click', () => this.restartLevel()); 
    });
    const _nextBtn = document.querySelector('.next-level-btn');
    if (_nextBtn) { _nextBtn.addEventListener('click', () => this.nextLevel()); }
  }

  initSelectionHandlers() {
    this.elements.equipmentPanel.addEventListener('click', (e) => {
      const btn = e.target.closest('.equipment-btn');
      if (!btn || btn.style.display === 'none') return;
      this.selectEquipment(btn);
    });

    this.elements.playground.addEventListener('click', (e) => {
      const slot = e.target.closest('.slot');
      if (!slot) return;
      if (this.state.selectedEquipment) {
        if (slot.dataset.filled === 'true') {
          const prev = slot.dataset.equipment;
          const prevBtn = document.querySelector(`.equipment-btn[data-equipment="${prev}"]`);
          if (prevBtn) prevBtn.style.display = '';
        }
        this.setSlotEquipment(slot, this.state.selectedEquipment);
        this.state.savedLayouts[this.state.currentLevel][slot.id] = this.state.selectedEquipment;
        this.computeEquipmentPlaced();
        this.deselectEquipment();
      } else if (slot.dataset.filled === 'true') {
        this.removeFromSlot(slot);
      }
    });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.deselectEquipment(); });
  }

  isMobile() { return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0); }

  initMobileHandlers() {
    document.addEventListener('touchstart', (e) => {
      const equipmentBtn = e.target.closest('.equipment-btn');
      if (equipmentBtn && equipmentBtn.style.display !== 'none') {
        e.preventDefault();
        this.selectEquipment(equipmentBtn);
        this.state.draggedItem = equipmentBtn;
      }
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (this.state.draggedItem) {
        e.preventDefault();
        const touch = e.touches[0];
        this.state.draggedItem.style.position = 'absolute';
        this.state.draggedItem.style.left = (touch.clientX - 75) + 'px';
        this.state.draggedItem.style.top = (touch.clientY - 75) + 'px';
      }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
      if (this.state.draggedItem) {
        const el = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        const slot = el ? el.closest('.slot') : null;
        if (slot) { this.placeEquipment(slot, this.state.draggedItem.dataset.equipment); }
        this.resetDraggedVisual();
      }
    });
  }

  computeEquipmentPlaced() {
    const level = this.levels[this.state.currentLevel];
    const count = (level.slots||[]).filter(s => document.getElementById(s.id).dataset.filled==='true').length;
    this.state.equipmentPlaced = count;
    this.elements.launchBtn.disabled = count !== (level.slots?.length || 0);
  }

  setSlotEquipment(slot, equipmentId) {
    slot.innerHTML = '';
    const slotNumber = document.createElement('div');
    slotNumber.className = 'slot-number';
    slotNumber.textContent = slot.dataset.number;
    slot.appendChild(slotNumber);

    if (equipmentId) {
      const img = document.createElement('img');
      img.className = 'equipment-placed';
      img.alt = equipmentId;
      this.setSmartImage(img, equipmentId);
      slot.appendChild(img);
      slot.dataset.filled = 'true';
      slot.dataset.equipment = equipmentId;
      if (!this.selectionMode) { slot.onclick = () => this.removeFromSlot(slot); } else { slot.onclick = null; }
      const btn = document.querySelector(`.equipment-btn[data-equipment="${equipmentId}"]`);
      if (btn) btn.style.display = 'none';
    } else {
      slot.dataset.filled = 'false';
      slot.dataset.equipment = '';
    }
  }

  initDesktopHandlers() {
    document.addEventListener('mousedown', (e) => {
      const equipmentBtn = e.target.closest('.equipment-btn');
      const filledSlot = e.target.closest('.slot');
      if (equipmentBtn && equipmentBtn.style.display !== 'none') {
        this.selectEquipment(equipmentBtn);
        this.state.draggedItem = equipmentBtn;
        this.state.dragSource = { type: 'panel', equipId: equipmentBtn.dataset.equipment };
        equipmentBtn.classList.add('dragging');
      } else if (filledSlot && filledSlot.dataset.filled === 'true') {
        this.state.draggedItem = filledSlot;
        this.state.dragSource = { type: 'slot', slotEl: filledSlot, equipId: filledSlot.dataset.equipment };
        filledSlot.classList.add('dragging');
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.state.draggedItem) {
        this.state.draggedItem.style.position = 'absolute';
        this.state.draggedItem.style.left = (e.clientX - 75) + 'px';
        this.state.draggedItem.style.top = (e.clientY - 75) + 'px';

        const overEl = document.elementFromPoint(e.clientX, e.clientY);
        const slot = overEl?.closest?.('.slot');
        document.querySelectorAll('.slot').forEach(s => s.classList.remove('drop-target'));
        if (slot) slot.classList.add('drop-target');
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (this.state.draggedItem) {
        const overEl = document.elementFromPoint(e.clientX, e.clientY);
        const targetSlot = overEl?.closest?.('.slot');
        const overPanel = overEl?.closest?.('.equipment-panel-container');

        if (this.state.dragSource?.type === 'panel') {
          if (targetSlot) {
            if (targetSlot.dataset.filled === 'true') {
              const prev = targetSlot.dataset.equipment;
              const prevBtn = document.querySelector(`.equipment-btn[data-equipment="${prev}"]`);
              if (prevBtn) prevBtn.style.display = '';
            }
            this.setSlotEquipment(targetSlot, this.state.dragSource.equipId);
            this.state.savedLayouts[this.state.currentLevel][targetSlot.id] = this.state.dragSource.equipId;
            const btn = document.querySelector(`.equipment-btn[data-equipment="${this.state.dragSource.equipId}"]`);
            if (btn) btn.style.display = 'none';
          }
        } else if (this.state.dragSource?.type === 'slot') {
          if (targetSlot && targetSlot !== this.state.dragSource.slotEl) {
            const src = this.state.dragSource.slotEl;
            const srcId = src.dataset.equipment;
            if (targetSlot.dataset.filled === 'true') {
              const dstId = targetSlot.dataset.equipment;
              this.setSlotEquipment(src, dstId);
              this.setSlotEquipment(targetSlot, srcId);
              this.state.savedLayouts[this.state.currentLevel][src.id] = dstId;
              this.state.savedLayouts[this.state.currentLevel][targetSlot.id] = srcId;
            } else {
              this.setSlotEquipment(targetSlot, srcId);
              const srcBtn = document.querySelector(`.equipment-btn[data-equipment="${srcId}"]`);
              if (srcBtn) srcBtn.style.display = 'none';
              src.innerHTML = '';
              const slotNumber = document.createElement('div');
              slotNumber.className = 'slot-number';
              slotNumber.textContent = src.dataset.number;
              src.appendChild(slotNumber);
              src.dataset.filled = 'false';
              src.dataset.equipment = '';
              this.state.savedLayouts[this.state.currentLevel][src.id] = '';
            }
          } else if (overPanel) {
            const src = this.state.dragSource.slotEl;
            const id = src.dataset.equipment;
            const btn = document.querySelector(`.equipment-btn[data-equipment="${id}"]`);
            if (btn) btn.style.display = '';
            src.innerHTML = '';
            const slotNumber = document.createElement('div');
            slotNumber.className = 'slot-number';
            slotNumber.textContent = src.dataset.number;
            src.appendChild(slotNumber);
            src.dataset.filled = 'false';
            src.dataset.equipment = '';
            this.state.savedLayouts[this.state.currentLevel][src.id] = '';
          }
        }

        this.computeEquipmentPlaced();
        this.resetDraggedVisual();
        this.state.dragSource = null;
      }
    });
  }

  resetDraggedVisual() {
    this.state.draggedItem.style.position = '';
    this.state.draggedItem.style.left = '';
    this.state.draggedItem.style.top = '';
    this.state.draggedItem.classList?.remove('dragging');
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('drop-target'));
    this.state.draggedItem = null;
    this.deselectEquipment();
  }

  loadProgress() {
    const saved = localStorage.getItem('breweryGameProgress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.progress.unlockedLevels = parsed.unlockedLevels || [1];
        this.progress.bestScores = parsed.bestScores || {};
      } catch (e) { console.error('Ошибка загрузки прогресса:', e); }
    }
  }

  saveProgress() { localStorage.setItem('breweryGameProgress', JSON.stringify(this.progress)); }

  startGame() {
    this.state.gameStarted = true;
    this.state.equipmentPlaced = 0;
    this.state.hintUsed = false;

    if (this.state.currentLevel <= 4) {
      this.state.levelResults[this.state.currentLevel].correct = 0;
    }

    const level = this.levels[this.state.currentLevel];
    this.state.timeLeft = level.time;
    this.updateTimerDisplay();
    this.elements.launchBtn.disabled = true;
    this.elements.feedbackMessage.textContent = '';
    this.elements.feedbackMessage.className = 'feedback-message';

    clearInterval(this.timer);
    this.timer = setInterval(() => this.updateTimer(), 1000);

    this.elements.hintBtn.classList.remove('hidden');
    this.elements.hintBtn.disabled = false;
    this.elements.hintBtn.style.opacity = '';

    if (this.state.currentLevel === 1) {
      this.elements.launchBtn.textContent = 'Запустить заторный процесс';
      this.elements.launchBtn.disabled = false;
    } else if (this.state.currentLevel === 3) {
      this.elements.launchBtn.textContent = 'Запустить брожение';
      this.elements.launchBtn.disabled = false;
    } else if (this.state.currentLevel === 4) {
      this.elements.launchBtn.textContent = 'Завершить производство';
      this.elements.launchBtn.disabled = true;
    } else {
      this.elements.launchBtn.textContent = 'Далее →';
      this.elements.launchBtn.disabled = true;
    }

    this.startHintPulse();
  }

  updateTimer() {
    this.state.timeLeft--;
    this.updateTimerDisplay();
    if (this.state.timeLeft <= 10) this.elements.timerDisplay.classList.add('low-time');
    if (this.state.timeLeft <= 0) {
      clearInterval(this.timer);
      this.playSound('error');
      this.endGame(false);
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  updateTimerDisplay() { this.elements.timerDisplay.textContent = this.formatTime(this.state.timeLeft); }

  selectEquipment(equipmentBtn) {
    this.playSound('click');
    this.state.selectedEquipment = equipmentBtn.dataset.equipment;
    document.querySelectorAll('.equipment-btn').forEach(btn => { btn.classList.toggle('selected', btn === equipmentBtn); btn.style.opacity = '1'; });
    this.elements.feedbackMessage.textContent = `Выбрано: ${this.getEquipmentName(this.state.selectedEquipment)}`;
    this.elements.feedbackMessage.className = 'feedback-message';
  }

  getEquipmentName(id) {
    const names = {
      'malt-crusher': 'Дробилка солода',
      'congestion-device': 'Заторный аппарат',
      'steam-generator': 'Парогенератор',
      'hot-water-tank': 'Бак горячей воды',
      'filtration-unit': 'Фильтрационный аппарат',
      'wort-brewing-machine': 'Сусловарочный аппарат',
      'hydrocyclone-apparatus': 'Гидроциклонный аппарат',
      'heat-exchanger': 'Теплообменник',
      'chiller': 'Чилер',
      'cylinder-conical-tank': 'Цилиндро-конический танк'
    };
    return names[id] || id;
  }

  deselectEquipment() {
    this.state.selectedEquipment = null;
    document.querySelectorAll('.equipment-btn').forEach(btn => btn.classList.remove('selected')); this.elements.feedbackMessage.textContent = '';
  }

  placeEquipment(slot, equipmentId) {
    if (slot.dataset.filled === 'true') return;

    this.playSound('click');

    const equipmentImg = document.createElement('img');
    equipmentImg.className = 'equipment-placed';
    equipmentImg.alt = equipmentId;
    this.setSmartImage(equipmentImg, equipmentId);

    slot.innerHTML = '';
    const slotNumber = document.createElement('div');
    slotNumber.className = 'slot-number';
    slotNumber.textContent = slot.dataset.number;
    slot.appendChild(slotNumber);
    slot.appendChild(equipmentImg);

    slot.dataset.filled = 'true';
    slot.dataset.equipment = equipmentId;

    const btn = document.querySelector(`.equipment-btn[data-equipment="${equipmentId}"]`);
    if (btn) btn.style.display = 'none';

    slot.addEventListener('click', () => this.removeFromSlot(slot), { once: true });

    this.state.equipmentPlaced++;
    if (this.state.equipmentPlaced === (this.levels[this.state.currentLevel].slots?.length || 0)) {
      this.elements.launchBtn.disabled = false;
      this.showFeedback('Все оборудование размещено!', 'correct');
    }
    this.state.savedLayouts[this.state.currentLevel][slot.id] = equipmentId;
    this.computeEquipmentPlaced();
  }

  removeFromSlot(slot) {
    if (slot.dataset.filled !== 'true') return;
    const equipId = slot.dataset.equipment;
    slot.dataset.filled = 'false';
    slot.dataset.equipment = '';
    slot.innerHTML = '';
    const slotNumber = document.createElement('div');
    slotNumber.className = 'slot-number';
    slotNumber.textContent = slot.dataset.number;
    slot.appendChild(slotNumber);

    const btn = document.querySelector(`.equipment-btn[data-equipment="${equipId}"]`);
    if (btn) btn.style.display = '';

    this.state.equipmentPlaced = Math.max(0, this.state.equipmentPlaced - 1);
    this.elements.launchBtn.disabled = true;
  }

  checkSolution() {
    if (this.state.currentLevel === 1 || this.state.currentLevel === 3) { 
      this.checkSettingsSolution(); 
      return; 
    }

    const level = this.levels[this.state.currentLevel];
    let correctCount = 0;

    level.slots.forEach(slotConfig => {
      const slot = document.getElementById(slotConfig.id);
      if (slot.dataset.equipment === slotConfig.correct) {
        correctCount++;
        this.highlightSlot(slot, 'correct');
      } else {
        this.highlightSlot(slot, 'incorrect');
      }
    });

    this.state.levelResults[this.state.currentLevel].correct = correctCount;

    if (correctCount === level.slots.length) {
      this.showFeedback('Правильно! Оборудование установлено верно!', 'correct');
      this.playSound('success');
    } else {
      this.showFeedback(`Правильно ${correctCount} из ${level.slots.length}`, 'incorrect');
      this.playSound('error');
    }

    const wrong = [];
    const right = [];
    level.slots.forEach((slotConfig, idx) => {
      const slot = document.getElementById(slotConfig.id);
      const placed = slot.dataset.equipment || '—';
      if (placed === slotConfig.correct) right.push(idx+1); else wrong.push(idx+1);
    });
    this.levelReview[this.state.currentLevel] = { right, wrong };

    let text = `Промежуточный разбор уровня «${level.name}»\n\n`;
    text += right.length ? `Верно расположены позиции: ${right.join(', ')}\n` : 'Пока нет верно расположенных позиций.\n';
    if (wrong.length) text += `Требуют внимания позиции: ${wrong.join(', ')}. Попробуйте переосмыслить поток процесса (от подготовки к варке и далее).`;

    let buttonText = 'Далее →';
    if (this.state.currentLevel === 2) {
      buttonText = 'К брожению →';
    } else if (this.state.currentLevel === 4) {
      buttonText = 'Посмотреть результаты';
    }

    this.openInfoModal(text, [{label: buttonText, variant:'primary', onClick:()=>this.nextLevel()}]);
  }

  checkSettingsSolution() {
    const level = this.levels[this.state.currentLevel];
    let correctCount = 0;

    level.settings.forEach(setting => {
      const input = document.getElementById(setting.id);
      const value = parseInt(input.value);
      const diff = Math.abs(value - setting.correct);

      let allowedDeviation = 3;
      
      if (setting.id === "wort-brewing-time") {
        allowedDeviation = 1;
      } else if (setting.id === "maturation-time") {
        allowedDeviation = 2;
      }

      if (diff <= allowedDeviation) {
        correctCount++;
        input.classList.add('correct-setting');
        setTimeout(() => input.classList.remove('correct-setting'), 1000);
      } else {
        input.classList.add('incorrect-setting');
        setTimeout(() => input.classList.remove('incorrect-setting'), 1000);
      }
    });

    this.state.levelResults[this.state.currentLevel].correct = correctCount;
    
    const tips = [];
    level.settings.forEach(s => {
      const val = parseInt(document.getElementById(s.id).value);
      const diff = Math.abs(val - s.correct);
      if (diff > (s.id === "wort-brewing-time" ? 1 : s.id === "maturation-time" ? 2 : 3)) {
        tips.push(s.label);
      }
    });
    
    let text = `Проверка настроек уровня «${level.name}»:\n\n`;
    text += `Правильно настроено: ${correctCount} из ${level.settings.length}\n\n`;
    
    if (tips.length) {
      text += 'Эти параметры требуют уточнения: ' + tips.join('; ') + '. Постарайтесь держать значения ближе к целевым.';
    } else {
      text += 'Отлично, все в допустимых пределах!';
    }
    
    let buttonLabel = 'К варочной линии →';
    if (this.state.currentLevel === 3) {
      buttonLabel = 'К финальной сборке →';
    }

    this.openInfoModal(text, [{label: buttonLabel, variant:'primary', onClick:()=>this.nextLevel()}]);
  }

  highlightSlot(slot, type) {
    slot.classList.add(`highlight-${type}`);
    setTimeout(() => slot.classList.remove(`highlight-${type}`), 800);
  }

  endGame(isWin) {
    this.stopHintPulse();

    if (isWin) {
        const emailForm = document.getElementById('email-form');
        const sendBtn = document.getElementById('send-results-btn');
        
        if (emailForm) emailForm.reset();
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.textContent = 'Отправить результаты';
            sendBtn.style.background = '';
        }
        
        this.prepareEmailData();
    }

    clearInterval(this.timer);
    this.state.gameStarted = false;

    const timeSpent = this.levels[this.state.currentLevel].time - this.state.timeLeft;
    this.elements.timeSpentDisplay.textContent = this.formatTime(Math.max(0, timeSpent));

    const totalScore = this.calculateTotalScore();
    this.elements.scoreDisplay.textContent = totalScore;
    this.elements.scoreDisplayLose.textContent = totalScore;

    const detailsHTML = (where) => {
      let html = '<div class="level-results">';
      const level = 1;
      const result = this.state.levelResults[level];
      const review = this.levelReview[level] || {right:[], wrong:[]};
      const errors = result.total - result.correct;
      html += `
        <div class="level-result">
          <h3>Уровень ${level}: ${this.levels[level].name}</h3>
          <p>Правильно: ${result.correct} из ${result.total}</p>
          <p>Ошибки: ${errors} (${errors * 5} баллов)</p>
          ${review.right?.length || review.wrong?.length ?
            `<p><strong>Верные позиции:</strong> ${review.right.join(', ') || '—'}</p>
             <p><strong>Пересмотрите позиции:</strong> ${review.wrong.join(', ') || '—'}</p>`
            : ''}
        </div>`;
      html += '</div>';
      where.innerHTML = html;
    };
    detailsHTML(this.elements.levelDetails);
    detailsHTML(this.elements.levelDetailsLose);

    if (isWin) {
      this.updateProgress(totalScore);
      this.elements.gameScreen.classList.add('hidden');
      this.elements.winScreen.classList.remove('hidden');
      this.playSound('success');
      this.createConfetti();
    } else {
      this.elements.gameScreen.classList.add('hidden');
      this.elements.loseScreen.classList.remove('hidden');
    }
  }

  calculateTotalScore() {
    let score = 100;
    for (let level = 1; level <= 4; level++) {
      const errors = this.state.levelResults[level].total - this.state.levelResults[level].correct;
      score -= errors * 5;
    }
    return Math.max(0, score);
  }

  updateProgress(score) {
    if (!this.progress.bestScores[this.state.currentLevel] || score > this.progress.bestScores[this.state.currentLevel]) {
      this.progress.bestScores[this.state.currentLevel] = score;
    }
    const nextLevel = this.state.currentLevel + 1;
    if (nextLevel <= Object.keys(this.levels).length && !this.progress.unlockedLevels.includes(nextLevel)) {
      this.progress.unlockedLevels.push(nextLevel);
    }
    this.saveProgress();
    this.renderLevelCards();
  }

  showStartScreen() {
    this.playSound('click');
    this.elements.levelSelectScreen.classList.add('hidden');
    this.elements.startScreen.classList.remove('hidden');
    
    const overlay = document.getElementById('animation-overlay');
    const mainContent = document.getElementById('main-content');
    
    if (overlay && mainContent) {
      overlay.style.display = 'flex';
      mainContent.classList.add('hidden');
      
      setTimeout(() => {
        this.initIntroAnimation();
      }, 100);
    }
  }

  showLevelSelect() {
    this.playSound('click');
    this.elements.startScreen.classList.add('hidden');
    this.elements.levelSelectScreen.classList.remove('hidden');
    this.renderLevelCards();
  }

  renderLevelCards() {
    this.elements.levelCardsContainer.innerHTML = '';
    for (const [id, level] of Object.entries(this.levels)) {
      const levelNum = parseInt(id);
      const isUnlocked = this.progress.unlockedLevels.includes(levelNum);

      const card = document.createElement('div');
      card.className = 'level-card';
      card.dataset.level = id;
      card.innerHTML = `
        <h2>${level.name}</h2>
        <p>${level.slots ? level.slots.length + ' оборудования' : 'Настройки температуры'}</p>
        <p>${level.time} секунд</p>
        <div class="level-score">
          ${this.progress.bestScores[levelNum] ? 'Лучший счет: ' + this.progress.bestScores[levelNum] : ''}
        </div>
        <div class="lock-icon ${isUnlocked ? 'hidden' : ''}"></div>`;

      if (isUnlocked) card.addEventListener('click', () => this.startLevel(levelNum));
      this.elements.levelCardsContainer.appendChild(card);
    }
  }

  startLevel(levelNum) {
    this.playSound('click');
    this.state.currentLevel = levelNum;
    const level = this.levels[levelNum];
    this.elements.playground.innerHTML = '';
    this.elements.equipmentPanel.innerHTML = '';
    this.elements.settingsContainer.innerHTML = '';
    this.elements.levelNameDisplay.textContent = `Уровень: ${level.name}`;
    this.elements.levelDescText.textContent = level.description;

    // АВТОМАТИЧЕСКИ ПРИМЕНЯЕМ КОМПАКТНЫЙ СТИЛЬ ДЛЯ МОБИЛЬНЫХ
    if ((levelNum === 1 || levelNum === 3) && this.isMobile()) {
        this.elements.settingsContainer.classList.add('compact');
        if (this.isVerySmallScreen()) {
            this.elements.settingsContainer.classList.add('super-compact');
        } else {
            this.elements.settingsContainer.classList.remove('super-compact');
        }
    } else {
        this.elements.settingsContainer.classList.remove('compact', 'super-compact');
    }

    if (levelNum === 1 || levelNum === 3) {
        this.createSettingsInterface(level);
        this.elements.hintBtn.classList.remove('hidden');
        // Скрываем playground и equipment, показываем settings и картинку
        this.elements.playgroundContainer.classList.add('hidden');
        this.elements.equipmentPanelContainer.classList.add('hidden');
        this.elements.settingsContainer.classList.remove('hidden');
        this.elements.breweryBackground.classList.remove('hidden'); // ← ДОБАВЬ ЭТУ СТРОКУ
    } else {
        this.createEquipmentSlots(level);
        this.createEquipmentPanel(level);
        this.elements.hintBtn.classList.remove('hidden');
        // Скрываем settings и картинку, показываем playground и equipment
        this.elements.settingsContainer.classList.add('hidden');
        this.elements.playgroundContainer.classList.remove('hidden');
        this.elements.equipmentPanelContainer.classList.remove('hidden');
        this.elements.breweryBackground.classList.add('hidden'); // ← ДОБАВЬ ЭТУ СТРОКУ
    }

    this.elements.levelSelectScreen.classList.add('hidden');
    this.elements.gameScreen.classList.remove('hidden');
    this.startGame();
  }

createSettingsInterface(level) {
    const settingsHTML = level.settings.map(setting => {
      let unit = '°C';
      if (setting.id === "wort-brewing-time") unit = 'ч';
      if (setting.id === "maturation-time") unit = 'дн';
      
      const initialValue = Math.round((setting.min + setting.max) / 2);
      
      return `
      <div class="setting-item">
        <label for="${setting.id}">${setting.label}</label>
        <div class="setting-controls">
          <input type="range" id="${setting.id}" min="${setting.min}" max="${setting.max}" step="${setting.step}" value="${initialValue}" class="temp-slider">
          <span class="temp-value">${initialValue}${unit}</span>
        </div>
      </div>`;
    }).join('');

    this.elements.settingsContainer.innerHTML = settingsHTML;
    
    // На мобильных добавляем класс для горизонтального расположения
    if (this.isMobile()) {
        this.elements.settingsContainer.classList.add('mobile-horizontal');
    } else {
        this.elements.settingsContainer.classList.remove('mobile-horizontal');
    }

    level.settings.forEach(setting => {
      const slider = document.getElementById(setting.id);
      const valueDisplay = slider.nextElementSibling;
      
      let unit = '°C';
      if (setting.id === "wort-brewing-time") unit = 'ч';
      if (setting.id === "maturation-time") unit = 'дн';
      
      slider.addEventListener('input', () => {
        valueDisplay.textContent = `${slider.value}${unit}`;
        this.elements.launchBtn.disabled = false;
      });
    });
  }

  createEquipmentSlots(level) {
    level.slots.forEach(slotConfig => {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.id = slotConfig.id;
      slot.dataset.correct = slotConfig.correct;
      slot.dataset.number = slotConfig.number;
      slot.dataset.filled = 'false';

      const slotNumber = document.createElement('div');
      slotNumber.className = 'slot-number';
      slotNumber.textContent = slotConfig.number;
      slot.appendChild(slotNumber);

      this.elements.playground.appendChild(slot);
    });
  }

  createEquipmentPanel(level) {
    level.equipment.forEach(equipId => {
      const btn = document.createElement('div');
      btn.className = 'equipment-btn';
      btn.dataset.equipment = equipId;

      const img = document.createElement('img');
      img.className = 'equipment';
      img.alt = equipId;
      this.setSmartImage(img, equipId);

      btn.appendChild(img);
      this.elements.equipmentPanel.appendChild(btn);
    });

    const saved = this.state.savedLayouts[this.state.currentLevel] || {};
    level.slots.forEach(slotConfig => {
      const slot = document.getElementById(slotConfig.id);
      const eid = saved[slotConfig.id];
      if (eid) {
        this.setSlotEquipment(slot, eid);
      }
    });
    Object.values(saved).filter(Boolean).forEach(eid => {
      const btn = document.querySelector(`.equipment-btn[data-equipment="${eid}"]`);
      if (btn) btn.style.display = 'none';
    });
    this.computeEquipmentPlaced();
  }

  resetEquipment() {
    this.playSound('click');

    if (this.state.currentLevel === 3) {
      this.levels[3].settings.forEach(setting => {
        const slider = document.getElementById(setting.id);
        slider.value = 0;
        slider.nextElementSibling.textContent = '0°C';
      });
      this.elements.launchBtn.disabled = true;
      return;
    }

    const level = this.levels[this.state.currentLevel];
    document.querySelectorAll('.slot').forEach(slot => {
      slot.innerHTML = '';
      slot.dataset.filled = 'false';
      slot.dataset.equipment = '';
      const slotNumber = document.createElement('div');
      slotNumber.className = 'slot-number';
      slotNumber.textContent = slot.dataset.number;
      slot.appendChild(slotNumber);
    });

    level.equipment.forEach(equipId => {
      const btn = document.querySelector(`.equipment-btn[data-equipment="${equipId}"]`);
      if (btn) btn.style.display = '';
      const img = btn?.querySelector('img');
      if (img) this.setSmartImage(img, equipId);
    });

    this.state.equipmentPlaced = 0;
    this.elements.launchBtn.disabled = true;
    this.deselectEquipment();
  }

  showHint() {
    if (this.state.hintUsed) return;
    this.playSound('click');
    this.state.hintUsed = true;

    this.disableHintPulse();

    const partial = this.buildPartialHint(this.state.currentLevel);
    this.openInfoModal(partial, [{label:'Понял', onClick:()=>{}, variant:'primary'}]);

    this.elements.hintBtn.disabled = true;
    this.elements.hintBtn.style.opacity = '0.6';

    if (this.state.currentLevel !== 3) this.highlightCorrectSlots();
  }

  highlightCorrectSlots() {
    const level = this.levels[this.state.currentLevel];
    level.slots.forEach(slotConfig => {
      const slot = document.getElementById(slotConfig.id);
      if (slot.dataset.filled === 'false') {
        slot.classList.add('hint-highlight');
        setTimeout(() => { slot.classList.remove('hint-highlight'); }, 2000);
      }
    });
  }

  closeHintModal() {
    this.playSound('click');
    this.elements.hintModal.classList.add('hidden');
  }

  restartLevel() {
    this.playSound('click');
    this.elements.winScreen.classList.add('hidden');
    this.elements.loseScreen.classList.add('hidden');
    this.elements.gameScreen.classList.remove('hidden');
    this.startLevel(this.state.currentLevel);
  }

  nextLevel() {
    this.playSound('click');
    this.elements.gameScreen.classList.add('hidden');
    const nextLevel = this.state.currentLevel + 1;
    if (nextLevel <= Object.keys(this.levels).length) {
      this.startLevel(nextLevel);
    } else {
      this.endGame(true);
    }
  }

  showFeedback(message, type) {
    this.elements.feedbackMessage.textContent = message;
    this.elements.feedbackMessage.className = `feedback-message ${type}`;
  }

  createConfetti() {
    const confettiContainer = document.querySelector('.confetti');
    confettiContainer.innerHTML = '';
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = this.getRandomColor();
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      confetti.style.borderRadius = '50%';
      confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
      confettiContainer.appendChild(confetti);
    }
  }

  getRandomColor() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  playSound(type) {
    try {
      const snd = this.sounds[type];
      if (!snd) return;
      snd.currentTime = 0;
      snd.play().catch(()=>{});
    } catch (e) { }
  }

  preloadAssets() {
    const allIds = [
      'malt-crusher', 'congestion-device', 'steam-generator',
      'hot-water-tank', 'filtration-unit', 'wort-brewing-machine',
      'hydrocyclone-apparatus', 'heat-exchanger', 'chiller',
      'cylinder-conical-tank', 'placeholder'
    ];

    allIds.forEach(equipId => {
      const img = new Image();
      this.setSmartImage(img, equipId);
    });
  }

  startHintPulse() {
    if (!this.hintPulseEnabled) return;
    
    this.stopHintPulse();
    
    this.hintPulseInterval = setInterval(() => {
      if (!this.state.hintUsed && this.elements.hintBtn && !this.elements.hintBtn.disabled) {
        this.elements.hintBtn.classList.add('hint-btn-pulse');
        
        setTimeout(() => {
          if (this.elements.hintBtn) {
            this.elements.hintBtn.classList.remove('hint-btn-pulse');
          }
        }, 900);
      }
    }, 5000);
  }

  stopHintPulse() {
    if (this.hintPulseInterval) {
      clearInterval(this.hintPulseInterval);
      this.hintPulseInterval = null;
    }
    if (this.elements.hintBtn) {
      this.elements.hintBtn.classList.remove('hint-btn-pulse');
    }
  }

  disableHintPulse() {
    this.hintPulseEnabled = false;
    this.stopHintPulse();
  }

  initEmailForm() {
    const emailForm = document.getElementById('email-form');
    const emailInput = document.getElementById('user-email');
    const sendBtn = document.getElementById('send-results-btn');
    
    if (emailForm && emailInput && sendBtn) {
        emailInput.addEventListener('input', () => {
            const isValid = this.isValidEmail(emailInput.value);
            sendBtn.disabled = !isValid;
            sendBtn.style.opacity = isValid ? '1' : '0.6';
        });
        
        emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.isValidEmail(emailInput.value)) {
                this.showFeedback('Пожалуйста, введите корректный email', 'incorrect');
                return;
            }
            
            this.prepareEmailData();
            sendBtn.textContent = 'Отправляем...';
            sendBtn.disabled = true;
            
            try {
                const formData = new FormData(emailForm);
                const response = await fetch(emailForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    this.showFormSuccess(sendBtn);
                    this.showFeedback('✅ Результаты отправлены! Проверьте почту', 'correct');
                } else {
                    throw new Error('Formspree failed');
                }
            } catch (error) {
                console.log('Formspree не работает, пробуем резервный метод...');
                this.tryBackupEmailMethod(emailInput.value, sendBtn);
            }
        });
    }
  }

  tryBackupEmailMethod(email, sendBtn) {
    const totalScore = this.calculateTotalScore();
    const totalTime = this.formatTime(this.levels[this.state.currentLevel].time - this.state.timeLeft);
    
    console.log('=== РЕЗУЛЬТАТЫ ИГРЫ ===');
    console.log('Email:', email);
    console.log('Общий счет:', totalScore);
    console.log('Время:', totalTime);
    console.log('Уровень 1:', `${this.state.levelResults[1].correct}/${this.state.levelResults[1].total}`);
    console.log('Уровень 2:', `${this.state.levelResults[2].correct}/${this.state.levelResults[2].total}`);
    console.log('Уровень 3:', `${this.state.levelResults[3].correct}/${this.state.levelResults[3].total}`);
    console.log('Уровень 4:', `${this.state.levelResults[4].correct}/${this.state.levelResults[4].total}`);
    console.log('====================');
    
    this.showFeedback('📧 Результаты сохранены! Скопируйте из консоли браузера (F12)', 'correct');
    this.showFormSuccess(sendBtn);
  }

  showFormSuccess(sendBtn) {
    sendBtn.textContent = '✅ Отправлено!';
    sendBtn.disabled = true;
    sendBtn.style.background = '#10b981';
    sendBtn.style.opacity = '1';
    
    setTimeout(() => {
        sendBtn.textContent = 'Отправить результаты';
        sendBtn.disabled = false;
        sendBtn.style.background = '';
    }, 5000);
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  prepareEmailData() {
    const totalScore = this.calculateTotalScore();
    const totalTime = this.formatTime(this.levels[this.state.currentLevel].time - this.state.timeLeft);
    
    const subjectEl = document.getElementById('email-subject');
    const scoreEl = document.getElementById('email-score');
    const timeEl = document.getElementById('email-time');
    const level1El = document.getElementById('email-level1');
    const level2El = document.getElementById('email-level2');
    const level3El = document.getElementById('email-level3');
    const level4El = document.getElementById('email-level4');
    const totalTimeEl = document.getElementById('email-totalTime');
    
    if (subjectEl) subjectEl.value = `🎯 Результат игры: ${totalScore} баллов`;
    if (scoreEl) scoreEl.value = totalScore;
    if (timeEl) timeEl.value = totalTime;
    if (level1El) level1El.value = `${this.state.levelResults[1].correct}/${this.state.levelResults[1].total}`;
    if (level2El) level2El.value = `${this.state.levelResults[2].correct}/${this.state.levelResults[2].total}`;
    if (level3El) level3El.value = `${this.state.levelResults[3].correct}/${this.state.levelResults[3].total}`;
    if (level4El) level4El.value = `${this.state.levelResults[4].correct}/${this.state.levelResults[4].total}`;
    if (totalTimeEl) totalTimeEl.value = totalTime;
  }
}
// ★★★★ КЛАСС ЗАКАНЧИВАЕТСЯ ЗДЕСЬ ★★★★
document.addEventListener('DOMContentLoaded', () => { new BreweryGame(); });

// === RESULTS DEDUP + HIDE NEXT BTN + TOTAL SCORE ===
(function(){
  try {
    if (window.__RESULTS_FIX_PATCH__) return;
    window.__RESULTS_FIX_PATCH__ = true;

    const WEIGHTS = {1:{ok:10}, 2:{ok:15}, 3:{ok:20}, 4:{ok:15}};

    if (!BreweryGame.prototype.calculateTotalScore || BreweryGame.prototype.calculateTotalScore.__patched__ !== true) {
      const calc = function(){
        try{
          let total = 0;
          for (let lvl = 1; lvl <= 4; lvl++) {
            const res = (this.state && this.state.levelResults && this.state.levelResults[lvl]) || {correct:0};
            total += (res.correct || 0) * WEIGHTS[lvl].ok;
          }
          return total;
        } catch(e){ return 0; }
      };
      calc.__patched__ = true;
      BreweryGame.prototype.calculateTotalScore = calc;
    }

    function buildDetailsHTML(self){
      let html = '<div class="level-results">';
      const lvl = 1;
      const result = (self.state && self.state.levelResults && self.state.levelResults[lvl]) || {correct:0,total:0};
      const review = (self.levelReview && self.levelReview[lvl]) || {rightNames:[], wrong:[]};
      const lvlScore = (result.correct || 0) * WEIGHTS[lvl].ok;
      html += `
        <div class="level-result">
          <h3>Уровень ${lvl}: ${self.levels[lvl].name}</h3>
          <p>Очки за уровень: ${lvlScore}</p>
          <p>Правильно: ${result.correct} из ${result.total}</p>
          ${review.rightNames && review.rightNames.length ? `<p><strong>Верно расставлено:</strong> ${review.rightNames.join(', ')}</p>` : ''}
          ${review.wrong && review.wrong.length ? `<p><strong>Проверьте слоты:</strong> ${review.wrong.join(', ')}</p>` : ''}
        </div>`;
      html += '</div>';
      return html;
    }

    const _origEndGame = BreweryGame.prototype.endGame;
    BreweryGame.prototype.endGame = function(isWin){
      if (typeof _origEndGame === 'function') _origEndGame.call(this, isWin);

      try {
        const html = buildDetailsHTML(this);

        const winDetails = document.getElementById('level-details');
        if (winDetails) winDetails.innerHTML = html;

        const loseDetails = document.getElementById('level-details-lose');
        if (loseDetails) loseDetails.innerHTML = html;

        const totalEl = document.getElementById('score-earned');
        if (totalEl) totalEl.textContent = this.calculateTotalScore();

        document.querySelectorAll('.next-level-btn').forEach(btn => btn.remove());
      } catch(e){
        console.error('RESULTS FIX normalize error:', e);
      }
    };

    function removeNextButtons(root){
      (root || document).querySelectorAll('.next-level-btn').forEach(b => b.remove());
    }
    removeNextButtons(document);
    const mo = new MutationObserver(muts => muts.forEach(m => {
      m.addedNodes && m.addedNodes.forEach(n => { if (n.nodeType === 1) removeNextButtons(n); });
    }));
    mo.observe(document.documentElement, { childList: true, subtree: true });
    window.__NEXT_BTN_KILLER__ = mo;
  } catch(e){
    console.error('RESULTS FIX PATCH init error:', e);
  }
})();