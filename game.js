// @ts-nocheck
// Улучшенный основной класс игры с «умным» поиском картинок
class BreweryGame {
  constructor() {
    this.levels = {
      1: {
        name: "Подготовка сырья",
        time: 180,
        settings: [
          { 
            id: "malt-consumption", 
            correct: 185, 
            min: 100, 
            max: 500, 
            step: 5, 
            label: "Расход солода на 1000 л пива (кг)" 
          },
          { 
            id: "wort-boiling-temp", 
            correct: 90, 
            min: 70, 
            max: 110, 
            step: 1, 
            label: "Температура варки сусла (°C)" 
          }
        ],
        threshold3: 30,
        threshold2: 60,
        description: "Добро пожаловать в пивоварню! Начнем с основ - расчета сырья и температурного режима. От точности этих параметров зависит качество будущего пива.",
        hint: "Расход солода: 170-200 кг на 1000 литров. Температура варки .. подберите опытным путем"
      },
      2: {
        name: "Основы заторного процесса",
        time: 180,
        settings: [
          { id: "hot-water-temp", correct: 80, min: 0, max: 100, step: 1, label: "Температура в баке горячей воды (°C)" },
          { id: "wort-brewing-time", correct: 7, min: 1, max: 24, step: 1, label: "Время от затирания до перекачки в ЦКТ" }
        ],
        threshold3: 30,
        threshold2: 60,
        description: "Добро пожаловать в варочный цех, ученик пивовара! Прежде чем начать варку, нужно правильно подготовить затор. От точности начальных настроек зависит всё - от прозрачности сусла до будущего вкуса пива.",
        hint: "Температура горячей воды = температуре промывных вод в фильтрационном аппарате. Время затирания подбери опытным путём..."
      },
      3: {
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
      4: {
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
      5: {
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
      },
      6: {
        name: "Оборудование гаража",
        time: 600,
        type: "garage_setup", 
        budget: 50,
        equipment: {
          brewKettles: [
            { id: "kettle-500", name: "Варочник 500л", price: 15, volume: 500 },
            { id: "kettle-1000", name: "Варочник 1000л", price: 25, volume: 1000 },
            { id: "kettle-2000", name: "Варочник 2000л", price: 35, volume: 2000 },
            { id: "kettle-3000", name: "Варочник 3000л", price: 45, volume: 3000 }
          ],
          cctTanks: [
            { id: "cct-500", name: "ЦКТ 500л", price: 10, volume: 500 },
            { id: "cct-1000", name: "ЦКТ 1000л", price: 15, volume: 1000 },
            { id: "cct-1500", name: "ЦКТ 1500л", price: 20, volume: 1500 },
            { id: "cct-2000", name: "ЦКТ 2000л", price: 25, volume: 2000 },
            { id: "cct-3000", name: "ЦКТ 3000л", price: 30, volume: 3000 }
          ],
          required: [
            { id: "crusher", name: "Дробилка солода", price: 3 },
            { id: "steam-gen", name: "Парогенератор", price: 3 },
            { id: "chiller", name: "Чиллер", price: 2 },
            { id: "heat-ex", name: "Теплообменник", price: 2 },
            { id: "chemical", name: "Химраствор для мойки", price: 2 }
          ]
        },
        description: "Распределите 50 BP на оборудование для гаража. Выберите варочник, ЦКТ и обязательное оборудование. Помните: без химраствора производство невозможно!",
        hint: "Оптимальный старт: варочник 500л + ЦКТ 1000л + все обязательное оборудование = 42 BP"
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
      savedLayouts: {1:{settings:{}}, 2:{settings:{}}, 3:{}, 4:{settings:{}}, 5:{}},
      levelResults: {
        1: { correct: 0, total: 2 },
        2: { correct: 0, total: 2 },
        3: { correct: 0, total: 7 },
        4: { correct: 0, total: 2 },
        5: { correct: 0, total: 3 },
        6: { correct: 0, total: 1 }
      },
      business: {
        balance: 100,
        purchasedGarage: false
      }
    };

    this.progress = { unlockedLevels: [1], bestScores: {} };
    this.hintPulseInterval = null;
    this.hintPulseEnabled = true;

    this.initElements();
    this.initEmailForm();
    this.initBusinessScreen();

    this.IMAGE_BASE = 'assets/images/';
    this.PLACEHOLDER = this.IMAGE_BASE + 'placeholder.png';
    this.CUSTOM_IMAGE_MAP = {};
    this.IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    this.selectionMode = true;
    this.levelReview = {1:{}, 2:{}, 3:{}, 4:{}, 5:{}, 6:{}};

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
    }, 500);
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
      console.log(`Image not found for: ${equipId}, tried: ${imgEl.src}`);
      
      if (imgEl.src.endsWith(this.PLACEHOLDER)) return;
      
      if (idx < candidates.length) {
        tryNext();
      } else {
        imgEl.src = this.PLACEHOLDER;
      }
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
      businessStartScreen: document.getElementById('business-start-screen'),
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
      breweryBackground: document.querySelector('.brewery-background'),
      playgroundContainer: document.querySelector('.playground-container')
    };

    this.sounds = {
      success: new Audio('assets/sounds/success.mp3'),
      error: new Audio('assets/sounds/error.mp3'),
      click: new Audio('assets/sounds/click.mp3')
    };
    Object.values(this.sounds).forEach(a => { try { a.preload = 'auto'; } catch(_){} });
  }

  initBusinessScreen() {
    const rentBtn = document.getElementById('rent-garage-btn');
    if (rentBtn) {
      rentBtn.addEventListener('click', () => this.rentGarage());
    }
    
    const continueBtn = document.createElement('button');
    continueBtn.id = 'continue-to-business';
    continueBtn.textContent = 'Продолжить путь пивовара →';
    continueBtn.className = 'restart-btn';
    continueBtn.style.margin = '10px';
    
    const winContent = this.elements.winScreen.querySelector('.win-content');
    if (winContent) {
      const emailForm = winContent.querySelector('#email-form');
      if (emailForm) {
        winContent.insertBefore(continueBtn, emailForm.nextSibling);
      } else {
        winContent.appendChild(continueBtn);
      }
      
      continueBtn.addEventListener('click', () => this.showBusinessStartScreen());
    }
  }

  showBusinessStartScreen() {
    this.playSound('click');
    this.elements.winScreen.classList.add('hidden');
    this.elements.loseScreen.classList.add('hidden');
    this.elements.businessStartScreen.classList.remove('hidden');
    this.updateBusinessDisplay();
  }

  updateBusinessDisplay() {
    const balanceDisplay = document.getElementById('balance-display');
    const currentBalance = document.getElementById('current-balance');
    
    if (balanceDisplay) balanceDisplay.textContent = this.state.business.balance;
    if (currentBalance) currentBalance.textContent = this.state.business.balance;
  }

  rentGarage() {
    if (this.state.business.balance >= 50 && !this.state.business.purchasedGarage) {
      this.state.business.balance -= 50;
      this.state.business.purchasedGarage = true;
      this.playSound('success');
      this.updateBusinessDisplay();
      
      const rentBtn = document.getElementById('rent-garage-btn');
      if (rentBtn) {
        rentBtn.textContent = 'Закупить оборудование →';
        rentBtn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
        rentBtn.onclick = () => this.startGarageLevel();
      }
      
      this.showFeedback('Гараж успешно арендован! Осталось 50 BP на оборудование.', 'correct');
    }
  }

  startGarageLevel() {
    if (this.state.business.purchasedGarage) {
      this.playSound('click');
      this.elements.businessStartScreen.classList.add('hidden');
      // СРАЗУ запускаем уровень 6 без задержки
      this.startLevel(6);
    }
  }

  buildPartialHint(levelNum) {
    if (levelNum === 1) {
      return "Расход солода: 170-200 кг на 1000 литров. Температура варки сусла должна достигать точки кипения...";
    }
    if (levelNum === 2) {
      return "Температура горячей воды = температуре промывных вод в фильтрационном аппарате. Время затирания подбери опытным путём...";
    }
    if (levelNum === 3) {
      const map = {
        1: this.getEquipmentName(this.levels[3].slots[0].correct),
        2: this.getEquipmentName(this.levels[3].slots[1].correct),
        5: this.getEquipmentName(this.levels[3].slots[4].correct),
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
    if (levelNum === 4) {
      return "Подсказка: температура в ЦКТ .. , время созревания 21 день (±2 дня)";
    }
    if (levelNum === 5) {
      const name = this.getEquipmentName(this.levels[5].slots[1].correct);
      return `1) •••\n2) ${name}\n3) •••`;
    }
    if (levelNum === 6) {
      return "Оптимальный выбор: Варочник 500л (15 BP) + ЦКТ 1000л (15 BP) + обязательное оборудование (12 BP) = 42 BP";
    }
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

    if (this.selectionMode) { 
      this.initSelectionHandlers(); 
    } else if (this.isMobile()) { 
      this.initMobileHandlers(); 
    } else { 
      this.initDesktopHandlers(); 
    }

    document.querySelectorAll('.restart-btn').forEach(btn => {
      btn.addEventListener('click', () => this.restartLevel()); 
    });
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

  isMobile() { 
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0); 
  }

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

  saveProgress() { 
    localStorage.setItem('breweryGameProgress', JSON.stringify(this.progress)); 
  }

  startGame() {
    this.state.gameStarted = true;
    this.state.equipmentPlaced = 0;
    this.state.hintUsed = false;

    if (this.state.currentLevel <= 5) {
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

    if (this.state.currentLevel === 1 || this.state.currentLevel === 2) {
      this.elements.launchBtn.textContent = 'Запустить заторный процесс';
      this.elements.launchBtn.disabled = false;
    } else if (this.state.currentLevel === 4) {
      this.elements.launchBtn.textContent = 'Запустить брожение';
      this.elements.launchBtn.disabled = false;
    } else if (this.state.currentLevel === 5) {
      this.elements.launchBtn.textContent = 'Завершить производство';
      this.elements.launchBtn.disabled = true;
    } else if (this.state.currentLevel === 6) {
      this.elements.launchBtn.textContent = 'Запустить производство';
      this.elements.launchBtn.disabled = true;
    } else {
      this.elements.launchBtn.textContent = 'Далее →';
      this.elements.launchBtn.disabled = true;
    }

    this.startHintPulse();
  }

  updateTimer() {
    // Если мы на экране бизнеса - не обновляем таймер
    if (!this.elements.businessStartScreen.classList.contains('hidden')) {
        return;
    }
    
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

  updateTimerDisplay() { 
    this.elements.timerDisplay.textContent = this.formatTime(this.state.timeLeft); 
  }

  selectEquipment(equipmentBtn) {
    this.playSound('click');
    this.state.selectedEquipment = equipmentBtn.dataset.equipment;
    document.querySelectorAll('.equipment-btn').forEach(btn => { 
      btn.classList.toggle('selected', btn === equipmentBtn); 
      btn.style.opacity = '1'; 
    });
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
      'chiller': 'Чиллер',
      'cylinder-conical-tank': 'Цилиндро-конический танк'
    };
    return names[id] || id;
  }

  deselectEquipment() {
    this.state.selectedEquipment = null;
    document.querySelectorAll('.equipment-btn').forEach(btn => btn.classList.remove('selected')); 
    this.elements.feedbackMessage.textContent = '';
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
    // ← ПРОВЕРКА ДЛЯ УРОВНЯ 6 ДОБАВЛЕНА
    if (this.state.currentLevel === 6) {
        this.checkGarageSolution();
        return;
    }

    if (this.state.currentLevel === 1 || this.state.currentLevel === 2 || this.state.currentLevel === 4) { 
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
    if (this.state.currentLevel === 3) {
        buttonText = 'К брожению →';
    } else if (this.state.currentLevel === 5) {
        buttonText = 'Посмотреть результаты';
    }

    this.openInfoModal(text, [{label: buttonText, variant:'primary', onClick:()=>this.nextLevel()}]);
  }

  checkSettingsSolution() {
    const level = this.levels[this.state.currentLevel];
    let correctCount = 0;
    const userValues = {};

    level.settings.forEach(setting => {
      const input = document.getElementById(setting.id);
      const value = parseInt(input.value);
      userValues[setting.id] = value;

      const diff = Math.abs(value - setting.correct);
      let allowedDeviation = 3;
      
      if (setting.id === "malt-consumption") {
        allowedDeviation = 15;
      } else if (setting.id === "wort-brewing-time") {
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

    this.levelReview[this.state.currentLevel] = this.levelReview[this.state.currentLevel] || {};
    this.levelReview[this.state.currentLevel].userValues = userValues;
    localStorage.setItem('lastUserValues', JSON.stringify(userValues));

    this.state.levelResults[this.state.currentLevel].correct = correctCount;
    
    const tips = [];
    level.settings.forEach(s => {
      const val = parseInt(document.getElementById(s.id).value);
      const diff = Math.abs(val - s.correct);
      
      let allowedDeviation = 3;
      if (s.id === "malt-consumption") {
        allowedDeviation = 15;
      } else if (s.id === "wort-brewing-time") {
        allowedDeviation = 1;
      } else if (s.id === "maturation-time") {
        allowedDeviation = 2;
      }
      
      if (diff > allowedDeviation) {
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
    if (this.state.currentLevel === 2) {
      buttonLabel = 'К варочной линии →';
    } else if (this.state.currentLevel === 4) {
      buttonLabel = 'К финальной сборке →';
    }

    this.openInfoModal(text, [{label: buttonLabel, variant:'primary', onClick:()=>this.nextLevel()}]);
  }

  checkGarageSolution() {
    this.playSound('success');
    this.showFeedback("Отличный выбор оборудования!", "correct");
    
    // Пока всегда успех, если дошли до проверки
    this.state.levelResults[6].correct = 1;
    
    setTimeout(() => {
        this.endGame(true);
    }, 2000);
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

    const createDetailedResults = () => {
      const level = 1;
      const result = this.state.levelResults[level];
      
      let maltValue = 0;
      let tempValue = 0;
      
      const userValues = this.levelReview[level]?.userValues;
      if (userValues) {
        maltValue = userValues['malt-consumption'] || 0;
        tempValue = userValues['wort-boiling-temp'] || 0;
      } else {
        const savedValues = localStorage.getItem('lastUserValues');
        if (savedValues) {
          const parsed = JSON.parse(savedValues);
          maltValue = parsed['malt-consumption'] || 0;
          tempValue = parsed['wort-boiling-temp'] || 0;
        } else {
          const maltInput = document.getElementById('malt-consumption');
          const tempInput = document.getElementById('wort-boiling-temp');
          if (maltInput) maltValue = parseInt(maltInput.value) || 0;
          if (tempInput) tempValue = parseInt(tempInput.value) || 0;
        }
      }

      const maltCorrect = Math.abs(maltValue - 185) <= 15;
      const tempCorrect = Math.abs(tempValue - 90) <= 2;
      
      const maltIcon = maltCorrect ? '✅' : '❌';
      const tempIcon = tempCorrect ? '✅' : '❌';
      
      let maltComment = '';
      let tempComment = '';
      
      if (maltCorrect) {
        maltComment = 'оптимальный расход солода';
      } else if (maltValue < 170) {
        maltComment = 'недостаточно солода, будет слабое тело пива';
      } else {
        maltComment = 'избыток солода, возможна высокая плотность';
      }
      
      if (tempCorrect) {
        tempComment = 'идеальная температура затора';
      } else if (tempValue < 88) {
        tempComment = 'недостаточная для правильного затора';
      } else {
        tempComment = 'превышение, возможна избыточная карамелизация';
      }

      return `
        <div class="level-results">
          <div class="level-result">
            <h3>Уровень ${level}: ${this.levels[level].name}</h3>
            <div class="parameter-results">
              <div class="parameter ${maltCorrect ? 'correct' : 'incorrect'}">
                ${maltIcon} <strong>Расход солода:</strong> ${maltValue} кг
                <div class="parameter-comment">${maltComment}</div>
                <div class="parameter-range">Оптимально: 170-200 кг</div>
              </div>
              <div class="parameter ${tempCorrect ? 'correct' : 'incorrect'}">
                ${tempIcon} <strong>Температура варки:</strong> ${tempValue}°C
                <div class="parameter-comment">${tempComment}</div>
                <div class="parameter-range">Целевая: 88-92°C</div>
              </div>
            </div>
            <div class="level-summary">
              <p><strong>Итог:</strong> ${result.correct} из ${result.total} параметров настроено верно</p>
              ${result.correct === 2 ? 
                '<p>Отличный старт! Параметры обеспечат сбалансированное сусло.</p>' : 
                '<p>Обратите внимание на рекомендации выше для улучшения качества.</p>'
              }
            </div>
          </div>
        </div>
      `;
    };

    setTimeout(() => {
      const detailedHTML = createDetailedResults();
      if (this.elements.levelDetails) {
        this.elements.levelDetails.innerHTML = detailedHTML;
      }
      if (this.elements.levelDetailsLose) {
        this.elements.levelDetailsLose.innerHTML = detailedHTML;
      }
    }, 100);

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
    for (let level = 1; level <= 5; level++) {
      const result = this.state.levelResults[level];
      const correctCount = result.correct || 0;
      score += correctCount * 20;
    }
    return Math.min(score, 500);
  }

  updateProgress(score) {
    if (!this.progress.bestScores[this.state.currentLevel] || score > this.progress.bestScores[this.state.currentLevel]) {
      this.progress.bestScores[this.state.currentLevel] = score;
    }
    
    // Разблокируем следующий уровень только для обучения (1-5)
    const nextLevel = this.state.currentLevel + 1;
    if (nextLevel <= 5 && !this.progress.unlockedLevels.includes(nextLevel)) {
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
      
      // Уровень 6 не показываем в списке - он доступен только через бизнес-экран
      if (levelNum === 6) continue;
      
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
    // Останавливаем любой предыдущий таймер
    clearInterval(this.timer);
    
    this.playSound('click');
    this.state.currentLevel = levelNum;
    const level = this.levels[levelNum];
    this.elements.playground.innerHTML = '';
    this.elements.equipmentPanel.innerHTML = '';
    this.elements.settingsContainer.innerHTML = '';
    this.elements.levelNameDisplay.textContent = `Уровень: ${level.name}`;
    this.elements.levelDescText.textContent = level.description;

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

    if (levelNum === 1 || levelNum === 2 || levelNum === 4) {
      this.createSettingsInterface(level);
      this.elements.hintBtn.classList.remove('hidden');
      this.elements.playgroundContainer.classList.add('hidden');
      this.elements.equipmentPanelContainer.classList.add('hidden');
      this.elements.settingsContainer.classList.remove('hidden');
      this.elements.breweryBackground.classList.remove('hidden');
      this.updateBackgroundImage(levelNum);
    } else if (levelNum === 6) {
      this.createGarageSetupInterface(level);
      this.elements.hintBtn.classList.remove('hidden');
      this.elements.settingsContainer.classList.remove('hidden');
      this.elements.playgroundContainer.classList.add('hidden');
      this.elements.equipmentPanelContainer.classList.add('hidden');
      this.elements.breweryBackground.classList.add('hidden');
    } else {
      this.createEquipmentSlots(level);
      this.createEquipmentPanel(level);
      this.elements.hintBtn.classList.remove('hidden');
      this.elements.settingsContainer.classList.add('hidden');
      this.elements.playgroundContainer.classList.remove('hidden');
      this.elements.equipmentPanelContainer.classList.remove('hidden');
      this.elements.breweryBackground.classList.add('hidden');
    }

    this.elements.levelSelectScreen.classList.add('hidden');
    this.elements.gameScreen.classList.remove('hidden');
    this.startGame();
  }

  createSettingsInterface(level) {
    const settingsHTML = level.settings.map(setting => {
      let unit = '°C';
      if (setting.id === "malt-consumption") unit = 'кг';
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
    
    level.settings.forEach(setting => {
      const slider = document.getElementById(setting.id);
      const valueDisplay = slider.nextElementSibling;
      
      let unit = '°C';
      if (setting.id === "malt-consumption") unit = 'кг';
      if (setting.id === "wort-brewing-time") unit = 'ч';
      if (setting.id === "maturation-time") unit = 'дн';
      
      slider.addEventListener('input', () => {
        valueDisplay.textContent = `${slider.value}${unit}`;
        this.elements.launchBtn.disabled = false;
      });
    });
  }

  createGarageSetupInterface(level) {
    console.log("Создаем интерфейс гаража для уровня", this.state.currentLevel);
    
    const equipment = level.equipment;
    
    const interfaceHTML = `
        <div style="padding: 20px; max-height: 70vh; overflow-y: auto;">
            <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                <h2>🎯 Оборудование гаража</h2>
                <div style="display: flex; justify-content: space-around; margin-top: 10px;">
                    <p>Ваш бюджет: <strong>${level.budget} BP</strong></p>
                    <p>Потрачено: <strong id="total-cost">0 BP</strong></p>
                    <p>Осталось: <strong id="remaining-budget">50 BP</strong></p>
                </div>
            </div>

            <div>
                <!-- ВАРОЧНИКИ -->
                <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 15px; border: 2px solid #e5e7eb;">
                    <h3 style="color: #1f2937; margin-bottom: 10px;">🔧 Выберите варочник (ОБЯЗАТЕЛЬНО):</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 10px;" id="brew-kettles">
                        ${equipment.brewKettles.map(kettle => `
                            <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 10px; cursor: pointer; transition: all 0.3s;" 
                                 class="equipment-option" data-type="kettle" data-id="${kettle.id}" data-price="${kettle.price}" data-volume="${kettle.volume}">
                                <input type="radio" name="brewKettle" id="${kettle.id}" value="${kettle.id}">
                                <label for="${kettle.id}" style="cursor: pointer; display: block;">
                                    <strong>${kettle.name}</strong><br>
                                    Объем: ${kettle.volume}л<br>
                                    Цена: ${kettle.price} BP
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- ЦКТ -->
                <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 15px; border: 2px solid #e5e7eb;">
                    <h3 style="color: #1f2937; margin-bottom: 10px;">🛢️ Выберите ЦКТ (можно несколько):</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 10px;" id="cct-tanks">
                        ${equipment.cctTanks.map(tank => `
                            <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 10px; cursor: pointer; transition: all 0.3s;" 
                                 class="equipment-option" data-type="cct" data-id="${tank.id}" data-price="${tank.price}" data-volume="${tank.volume}">
                                <input type="checkbox" id="${tank.id}" value="${tank.id}">
                                <label for="${tank.id}" style="cursor: pointer; display: block;">
                                    <strong>${tank.name}</strong><br>
                                    Объем: ${tank.volume}л<br>
                                    Цена: ${tank.price} BP
                                </label>
                            </div>
                        `).join('')}
                    </div>
                    <p style="font-size: 12px; color: #6b7280; font-style: italic; margin-top: 5px;">
                        💡 Можно выбрать несколько ЦКТ. Общий объем должен быть не меньше объема варочника.
                    </p>
                </div>

                <!-- ОБЯЗАТЕЛЬНОЕ ОБОРУДОВАНИЕ -->
                <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 15px; border: 2px solid #e5e7eb;">
                    <h3 style="color: #1f2937; margin-bottom: 10px;">⚙️ Обязательное оборудование:</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 10px;" id="required-equipment">
                        ${equipment.required.map(item => `
                            <div style="border: 2px solid #0ea5e9; border-radius: 8px; padding: 10px; background: #f0f9ff;" 
                                 class="equipment-option required-item" data-type="required" data-id="${item.id}" data-price="${item.price}">
                                <input type="checkbox" id="${item.id}" value="${item.id}" checked disabled>
                                <label for="${item.id}" style="cursor: pointer; display: block;">
                                    <strong>${item.name}</strong><br>
                                    Цена: ${item.price} BP
                                    ${item.id === 'chemical' ? '<br><span style="color: red;">⚠️ Без этого нельзя!</span>' : ''}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                    <p style="font-size: 12px; color: #6b7280; font-style: italic; margin-top: 5px;">
                        ✅ Это оборудование обязательно для работы пивоварни
                    </p>
                </div>

                <!-- СВОДКА -->
                <div style="background: #f8fafc; padding: 15px; border-radius: 10px; border: 2px solid #e2e8f0;">
                    <h3 style="color: #1f2937; margin-bottom: 10px;">📊 Ваш выбор:</h3>
                    <div id="selected-equipment">
                        <p>Выберите оборудование выше...</p>
                    </div>
                    <div id="volume-check" style="display: none; background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 5px; margin: 10px 0; border: 1px solid #fecaca;">
                        <p>⚠️ <strong>Внимание:</strong> Объем ЦКТ меньше объема варочника!</p>
                    </div>
                    <div id="budget-warning" style="display: none; background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 5px; margin: 10px 0; border: 1px solid #fecaca;">
                        <p>❌ <strong>Превышен бюджет!</strong> Уберите лишнее оборудование.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    this.elements.settingsContainer.innerHTML = interfaceHTML;
    this.elements.settingsContainer.classList.remove('hidden');
    this.elements.launchBtn.disabled = true;
    this.elements.launchBtn.textContent = "Запустить производство";
    
    // Добавляем обработчики событий
    this.initGarageEventListeners(level);
  }

  initGarageEventListeners(level) {
    const equipmentOptions = document.querySelectorAll('.equipment-option input');
    
    equipmentOptions.forEach(option => {
        option.addEventListener('change', () => {
            this.updateGarageSelection(level);
        });
    });
    
    // Инициализируем первый расчет
    this.updateGarageSelection(level);
  }

  updateGarageSelection(level) {
    const selectedKettle = document.querySelector('input[name="brewKettle"]:checked');
    const selectedCCTs = document.querySelectorAll('#cct-tanks input:checked');
    const requiredItems = document.querySelectorAll('#required-equipment input:checked');
    
    let totalCost = 0;
    let kettleVolume = 0;
    let totalCCTVolume = 0;
    
    // Собираем выбранное оборудование
    const selectedEquipment = [];
    
    // Варочник
    if (selectedKettle) {
        const kettleElement = selectedKettle.closest('.equipment-option');
        const kettlePrice = parseInt(kettleElement.dataset.price);
        const kettleVol = parseInt(kettleElement.dataset.volume);
        totalCost += kettlePrice;
        kettleVolume = kettleVol;
        selectedEquipment.push({
            name: kettleElement.querySelector('strong').textContent,
            price: kettlePrice,
            volume: kettleVol
        });
    }
    
    // ЦКТ
    selectedCCTs.forEach(cct => {
        const cctElement = cct.closest('.equipment-option');
        const cctPrice = parseInt(cctElement.dataset.price);
        const cctVol = parseInt(cctElement.dataset.volume);
        totalCost += cctPrice;
        totalCCTVolume += cctVol;
        selectedEquipment.push({
            name: cctElement.querySelector('strong').textContent,
            price: cctPrice,
            volume: cctVol
        });
    });
    
    // Обязательное оборудование
    requiredItems.forEach(item => {
        const itemElement = item.closest('.equipment-option');
        const itemPrice = parseInt(itemElement.dataset.price);
        totalCost += itemPrice;
        selectedEquipment.push({
            name: itemElement.querySelector('strong').textContent,
            price: itemPrice
        });
    });
    
    // Обновляем интерфейс
    this.updateGarageUI(totalCost, kettleVolume, totalCCTVolume, selectedEquipment, level.budget);
  }

  updateGarageUI(totalCost, kettleVolume, totalCCTVolume, selectedEquipment, budget) {
    // Обновляем стоимость
    document.getElementById('total-cost').textContent = totalCost + ' BP';
    document.getElementById('remaining-budget').textContent = (budget - totalCost) + ' BP';
    
    // Показываем выбранное оборудование
    const selectedList = document.getElementById('selected-equipment');
    if (selectedEquipment.length > 0) {
        selectedList.innerHTML = selectedEquipment.map(item => 
            `<div style="padding: 5px 0; border-bottom: 1px solid #e5e7eb;">✅ ${item.name} - ${item.price} BP${item.volume ? ` (${item.volume}л)` : ''}</div>`
        ).join('');
    } else {
        selectedList.innerHTML = '<p>Выберите оборудование выше...</p>';
    }
    
    // Проверяем объемы
    const volumeCheck = document.getElementById('volume-check');
    if (kettleVolume > 0 && totalCCTVolume > 0 && kettleVolume > totalCCTVolume) {
        volumeCheck.style.display = 'block';
    } else {
        volumeCheck.style.display = 'none';
    }
    
    // Проверяем бюджет
    const budgetWarning = document.getElementById('budget-warning');
    if (totalCost > budget) {
        budgetWarning.style.display = 'block';
    } else {
        budgetWarning.style.display = 'none';
    }
    
    // Активируем кнопку если все ок
    const selectedKettle = document.querySelector('input[name="brewKettle"]:checked');
    const hasChemical = document.getElementById('chemical').checked;
    const isValid = selectedKettle && hasChemical && totalCost <= budget && kettleVolume <= totalCCTVolume;
    
    this.elements.launchBtn.disabled = !isValid;
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
    
    // Если закончили уровень 5 - переходим к результатам, а НЕ к уровню 6
    if (this.state.currentLevel === 5) {
        this.endGame(true); // ← ПЕРЕХОДИМ К РЕЗУЛЬТАТАМ
    } else if (nextLevel <= 5) { // ← ТОЛЬКО уровни 1-5
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

  updateBackgroundImage(levelNum) {
    const bgImage = this.elements.breweryBackground.querySelector('img');
    if (!bgImage) return;
    
    const levelImages = {
      1: 'assets/images/brewery-background-level1.png',
      2: 'assets/images/brewery-background-level2.png', 
      4: 'assets/images/brewery-background-level4.png'
    };
    
    if (levelImages[levelNum]) {
      bgImage.src = levelImages[levelNum];
    }
  }
}

document.addEventListener('DOMContentLoaded', () => { new BreweryGame(); });