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
      }
    };

    // Бизнес-уровни (помещения)
    this.businessLevels = {
      'preparation': {
        name: "Подготовительная",
        price: 50,
        area: "250м²",
        baseCapacity: "1,500 л/мес",
        maxCapacity: "10,000 л/мес",
        equipment: "2-в-1 система, 1 сотрудник",
        description: "Базовое помещение для старта. Идеально для обучения и первых экспериментов."
      },
      'mashing': {
        name: "Заторно-сусловарная", 
        price: 150,
        area: "500м²",
        baseCapacity: "4,000 л/мес",
        maxCapacity: "25,000 л/мес", 
        equipment: "Автоматические системы, 4 сотрудника",
        description: "Профессиональное оборудование для качественного заторного процесса."
      },
      'fermentation': {
        name: "Цех брожения",
        price: 300,
        area: "1000м²", 
        baseCapacity: "8,000 л/мес",
        maxCapacity: "50,000 л/мес",
        equipment: "Контролируемые танки, 5 сотрудников",
        description: "Современные ЦКТ с точным контролем температуры и давления."
      },
      'bottling': {
        name: "Розливная",
        price: 500,
        area: "1000м²",
        baseCapacity: "12,000 л/мес", 
        maxCapacity: "90,000 л/мес",
        equipment: "4-линейная система, +96% эффективности",
        description: "Автоматизированные линии розлива и упаковки."
      },
      'production': {
        name: "Производственный цех",
        price: 800, 
        area: "3000м²",
        baseCapacity: "24,000 л/мес",
        maxCapacity: "180,000 л/мес",
        equipment: "Автоматизированная линия, x3 мощность",
        description: "Полноценное производство с высокой степенью автоматизации."
      },
      'advanced': {
        name: "Продвинутый цех",
        price: 1200,
        area: "3000м²",
        baseCapacity: "47,000 л/мес", 
        maxCapacity: "350,000 л/мес",
        equipment: "+96% эффективности, непрерывное производство",
        description: "Инновационные технологии для максимальной производительности."
      },
      'complex': {
        name: "Пивоваренный комплекс", 
        price: 2000,
        area: "5000м²",
        baseCapacity: "160,000 л/мес",
        maxCapacity: "1,000,000 л/мес",
        equipment: "Полная автоматизация, премиум оборудование",
        description: "Крупнейший комплекс с передовыми технологиями пивоварения."
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
        5: { correct: 0, total: 3 }
      },
      business: {
        balance: 100,
        purchasedFacilities: []
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
    this.levelReview = {1:{}, 2:{}, 3:{}, 4:{}, 5:{}};

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
    const continueBtn = document.createElement('button');
    continueBtn.id = 'continue-to-business';
    continueBtn.textContent = 'Начать свой бизнес →';
    continueBtn.className = 'restart-btn';
    continueBtn.style.margin = '10px';
    continueBtn.style.background = 'linear-gradient(135deg, #ff8c00 0%, #ff4500 100%)';
    
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

    // Инициализируем обработчики для бизнес-карточек
    this.initBusinessEventListeners();
  }

  initBusinessEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('business-action-btn')) {
        const facilityCard = e.target.closest('.business-card');
        const facilityType = facilityCard.dataset.type;
        const price = parseInt(e.target.dataset.price);
        
        this.rentFacility(facilityType, price);
      }
    });
  }

  showBusinessStartScreen() {
    this.playSound('click');
    this.elements.winScreen.classList.add('hidden');
    this.elements.loseScreen.classList.add('hidden');
    this.elements.businessStartScreen.classList.remove('hidden');
    this.updateBusinessDisplay();
    this.renderBusinessCards();
  }

  renderBusinessCards() {
    const businessOptions = document.querySelector('.business-options');
    if (!businessOptions) return;

    businessOptions.innerHTML = '';

    const facilityOrder = ['preparation', 'mashing', 'fermentation', 'bottling', 'production', 'advanced', 'complex'];
    
    facilityOrder.forEach((facilityType, index) => {
      const facility = this.businessLevels[facilityType];
      const isAvailable = this.isFacilityAvailable(facilityType);
      const isPurchased = this.state.business.purchasedFacilities.includes(facilityType);
      
      const card = document.createElement('div');
      card.className = `business-card ${isAvailable ? 'available' : 'locked'}`;
      card.dataset.type = facilityType;
      
      let buttonHTML = '';
      if (isAvailable && !isPurchased) {
        buttonHTML = `<button class="business-action-btn" data-price="${facility.price}">Арендовать за ${facility.price} BP</button>`;
      } else if (isPurchased) {
        buttonHTML = `<button class="business-action-btn equipped" onclick="game.startFacilityLevel('${facilityType}')">Оснастить оборудованием →</button>`;
      }
      
      card.innerHTML = `
        <div class="business-image ${facilityType}-image"></div>
        <h3>${isAvailable ? facility.name : facility.name + ' 🔒'}</h3>
        <p class="business-card-desc">
          <strong>Площадь:</strong> ${facility.area}<br>
          <strong>База:</strong> ${facility.baseCapacity}<br>
          <strong>Макс:</strong> ${facility.maxCapacity}<br>
          <strong>Оснащение:</strong> ${facility.equipment}
        </p>
        <div class="business-price">Стоимость: ${facility.price} BP</div>
        <div class="business-balance">Ваш баланс: <span>${this.state.business.balance}</span> BP</div>
        ${buttonHTML}
      `;
      
      businessOptions.appendChild(card);
    });
  }

  isFacilityAvailable(facilityType) {
    const facilityOrder = ['preparation', 'mashing', 'fermentation', 'bottling', 'production', 'advanced', 'complex'];
    const currentIndex = facilityOrder.indexOf(facilityType);
    
    if (currentIndex === 0) return true; // Первое помещение всегда доступно
    
    const previousFacility = facilityOrder[currentIndex - 1];
    return this.state.business.purchasedFacilities.includes(previousFacility);
  }

  rentFacility(facilityType, price) {
    if (this.state.business.balance >= price && 
        !this.state.business.purchasedFacilities.includes(facilityType)) {
        
        this.state.business.balance -= price;
        this.state.business.purchasedFacilities.push(facilityType);
        this.playSound('success');
        
        this.updateBusinessDisplay();
        this.renderBusinessCards();
        
        const facilityName = this.businessLevels[facilityType].name;
        this.showFeedback(`Помещение "${facilityName}" успешно арендовано!`, 'correct');
        
        // ВМЕСТО ТОГО ЧТОБЫ СРАЗУ ВОЗВРАЩАТЬ К ВЫБОРУ - ОТКРЫВАЕМ ЭКРАН ОБОРУДОВАНИЯ
        this.showFacilityEquipment(facilityType);
        
        // Разблокируем следующее помещение
        this.unlockNextFacility(facilityType);
    } else {
        this.showFeedback('Недостаточно средств или помещение уже куплено', 'incorrect');
    }
}

  unlockNextFacility(currentFacility) {
    const facilityOrder = ['preparation', 'mashing', 'fermentation', 'bottling', 'production', 'advanced', 'complex'];
    const currentIndex = facilityOrder.indexOf(currentFacility);
    
    if (currentIndex !== -1 && currentIndex < facilityOrder.length - 1) {
      const nextFacility = facilityOrder[currentIndex + 1];
      // Следующее помещение автоматически станет доступным при следующем рендере
      console.log(`Разблокировано помещение: ${nextFacility}`);
    }
  }

  startFacilityLevel(facilityType) {
    this.playSound('click');
    this.elements.businessStartScreen.classList.add('hidden');
    
    // Здесь можно добавить специфичные уровни для каждого помещения
    this.showFacilityDetails(facilityType);
  }

  showFacilityDetails(facilityType) {
    const facility = this.businessLevels[facilityType];
    
    let message = `
      🏭 <strong>${facility.name}</strong>\n\n
      📊 <strong>Характеристики:</strong>\n
      • Площадь: ${facility.area}\n
      • Базовая производительность: ${facility.baseCapacity}\n
      • Максимальная производительность: ${facility.maxCapacity}\n
      • Оснащение: ${facility.equipment}\n\n
      ${facility.description}
    `;
    
    this.openInfoModal(message, [
      {
        label: 'Закупить оборудование →',
        onClick: () => this.startEquipmentSetup(facilityType),
        variant: 'primary'
      },
      {
        label: 'Вернуться к выбору',
        onClick: () => this.showBusinessStartScreen(),
        variant: 'secondary'
      }
    ]);
  }

  startEquipmentSetup(facilityType) {
    // Здесь будет логика настройки оборудования для конкретного помещения
    this.showFeedback(`Начинаем оснащение ${this.businessLevels[facilityType].name}`, 'correct');
    
    // Временная заглушка - возвращаем к выбору помещений
    setTimeout(() => {
      this.showBusinessStartScreen();
    }, 2000);
  }

  updateBusinessDisplay() {
    const balanceDisplay = document.getElementById('balance-display');
    const currentBalance = document.getElementById('current-balance');
    
    if (balanceDisplay) balanceDisplay.textContent = this.state.business.balance;
    if (currentBalance) currentBalance.textContent = this.state.business.balance;
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
            this.progress.unlockedLevels = parsed.unlockedLevels || [1]; // Гарантируем что 1 уровень разблокирован
            this.progress.bestScores = parsed.bestScores || {};
            
            // Если почему-то разблокированы другие уровни, оставляем только 1
            if (this.progress.unlockedLevels.length > 1 && !this.progress.unlockedLevels.includes(1)) {
                this.progress.unlockedLevels = [1];
            }
        } catch (e) { 
            console.error('Ошибка загрузки прогресса:', e);
            this.progress.unlockedLevels = [1]; // По умолчанию только 1 уровень
        }
    } else {
        this.progress.unlockedLevels = [1]; // Новый игрок - только 1 уровень
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
        
        // РАЗБЛОКИРУЕМ ТОЛЬКО ПЕРВЫЙ УРОВЕНЬ, остальные по прогрессу
        const isUnlocked = levelNum === 1 || this.progress.unlockedLevels.includes(levelNum);

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

        if (isUnlocked) {
            card.addEventListener('click', () => this.startLevel(levelNum));
            card.style.cursor = 'pointer';
            card.style.opacity = '1';
        } else {
            card.style.cursor = 'not-allowed';
            card.style.opacity = '0.7';
        }
        
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

    this.updateLevelDisplay(levelNum);

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
    
    // Если закончили уровень 5 - переходим к бизнесу
    if (this.state.currentLevel === 5) {
        this.endGame(true);
    } else if (nextLevel <= 5) {
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

  updateLevelDisplay(levelNum) {
    // Сбрасываем все контейнеры
    this.elements.playgroundContainer.classList.add('hidden');
    this.elements.equipmentPanelContainer.classList.add('hidden');
    this.elements.settingsContainer.classList.add('hidden');
    this.elements.breweryBackground.classList.add('hidden');

    const level = this.levels[levelNum];
    
    if (levelNum === 1 || levelNum === 2 || levelNum === 4) {
        // Уровни с настройками - показываем настройки и фон
        this.createSettingsInterface(level);
        this.elements.settingsContainer.classList.remove('hidden');
        this.elements.breweryBackground.classList.remove('hidden');
        this.updateBackgroundImage(levelNum);
    } else if (levelNum === 3 || levelNum === 5) {
        // Уровни с оборудованием - показываем слоты и панель оборудования
        this.createEquipmentSlots(level);
        this.createEquipmentPanel(level);
        this.elements.playgroundContainer.classList.remove('hidden');
        this.elements.equipmentPanelContainer.classList.remove('hidden');
    }
    
    // Всегда показываем кнопку подсказки
    this.elements.hintBtn.classList.remove('hidden');
  }

  // === МЕТОДЫ ДЛЯ ЭКРАНА ОБОРУДОВАНИЯ ===

  showFacilityEquipment(facilityType) {
    this.playSound('click');
    this.elements.businessStartScreen.classList.add('hidden');
    
    const facility = this.businessLevels[facilityType];
    const equipmentScreen = document.getElementById('facility-equipment-screen');
    
    // Обновляем информацию о помещении
    document.getElementById('equipment-facility-name').textContent = `Оснащение ${facility.name}`;
    document.getElementById('current-facility-name').textContent = facility.name;
    
    // Устанавливаем бюджет в зависимости от помещения
    const budget = this.getFacilityBudget(facilityType);
    document.getElementById('equipment-budget').textContent = budget;
    document.getElementById('total-budget').textContent = budget + ' BP';
    document.getElementById('total-cost').textContent = '0 BP';
    document.getElementById('remaining-budget').textContent = budget + ' BP';
    
    equipmentScreen.classList.remove('hidden');
    
    // Инициализируем выбор оборудования
    setTimeout(() => {
        this.initEquipmentSelection(facilityType);
    }, 100);
  }

  getFacilityBudget(facilityType) {
    const budgets = {
        'preparation': 50,
        'mashing': 100,
        'fermentation': 150,
        'bottling': 200,
        'production': 250,
        'advanced': 300,
        'complex': 400
    };
    return budgets[facilityType] || 50;
  }

  initEquipmentSelection(facilityType) {
    console.log('Инициализация выбора оборудования для:', facilityType);
    
    // Сначала выберем базовое оборудование
    this.selectBasicEquipment(facilityType);
    
    // Затем добавим обработчики событий
    const equipmentOptions = document.querySelectorAll('.equipment-option-wide input');
    
    equipmentOptions.forEach(option => {
        option.addEventListener('change', () => {
            console.log('Изменение оборудования:', option.id, option.checked);
            this.updateEquipmentSelection(facilityType);
        });
    });
    
    // Кнопка запуска производства
    const startBtn = document.getElementById('start-production-btn');
    const backBtn = document.getElementById('back-to-facilities-btn');
    
    startBtn.addEventListener('click', () => {
        this.startProduction(facilityType);
    });
    
    backBtn.addEventListener('click', () => {
        this.showBusinessStartScreen();
    });
    
    // Инициализируем первый расчет
    this.updateEquipmentSelection(facilityType);

    initMobileEquipmentBehavior() 
    {
    // Плавная прокрутка к категориям
    const categoryHeaders = document.querySelectorAll('.equipment-category-wide h3');
    categoryHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            const category = header.closest('.equipment-category-wide');
            category.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });

    // Оптимизация для touch devices
    if (this.isMobile()) {
        const equipmentOptions = document.querySelectorAll('.equipment-option-wide');
        equipmentOptions.forEach(option => {
            option.addEventListener('touchstart', () => {
                option.style.transform = 'scale(0.98)';
            });
            
            option.addEventListener('touchend', () => {
                option.style.transform = '';
            });
        });
    }
}
  }

  selectBasicEquipment(facilityType) {
    console.log('Выбор базового оборудования для:', facilityType);
    
    // Автоматически выбираем обязательное оборудование в зависимости от помещения
    const basicEquipment = {
        'preparation': ['mash-250', 'crusher-100', 'pump-1', 'chemical'],
        'mashing': ['mash-500', 'filter-500', 'crusher-200', 'pump-4', 'chemical'],
        'fermentation': ['mash-1000', 'filter-1000', 'crusher-300', 'pump-5', 'chemical'],
        'bottling': ['mash-1000', 'filter-1000', 'crusher-300', 'pump-6', 'chemical'],
        'production': ['mash-3000', 'filter-1000', 'crusher-500', 'pump-6', 'chemical'],
        'advanced': ['mash-3000', 'filter-1000', 'crusher-500', 'pump-6', 'chemical'],
        'complex': ['mash-5000', 'filter-1000', 'crusher-1000', 'pump-7', 'chemical']
    };
    
    const equipmentIds = basicEquipment[facilityType] || basicEquipment['preparation'];
    
    equipmentIds.forEach(equipId => {
        const input = document.getElementById(equipId);
        if (input) {
            input.checked = true;
            console.log('Выбрано оборудование:', equipId);
        } else {
            console.log('Оборудование не найдено:', equipId);
        }
    });
  }

  updateEquipmentSelection(facilityType) {
    console.log('Обновление выбора оборудования');
    
    const selectedMash = document.querySelector('input[name="mashTun"]:checked');
    const selectedFilters = document.querySelectorAll('#filtration-equipment input:checked');
    const selectedWaterTanks = document.querySelectorAll('#hot-water-tanks input:checked');
    const selectedCCTs = document.querySelectorAll('#fermentation-tanks input:checked');
    const selectedAuxiliary = document.querySelectorAll('#auxiliary-equipment input:checked');
    
    let totalCost = 0;
    const selectedEquipment = [];
    
    // Собираем выбранное оборудование
    const collectEquipment = (element, category) => {
        if (element) {
            const equipElement = element.closest('.equipment-option-wide');
            const price = parseInt(equipElement.dataset.price);
            const name = equipElement.querySelector('strong').textContent;
            totalCost += price;
            selectedEquipment.push({ name, price, category });
            console.log('Добавлено оборудование:', name, price, category);
        }
    };
    
    const collectMultipleEquipment = (elements, category) => {
        elements.forEach(element => {
            const equipElement = element.closest('.equipment-option-wide');
            const price = parseInt(equipElement.dataset.price);
            const name = equipElement.querySelector('strong').textContent;
            totalCost += price;
            selectedEquipment.push({ name, price, category });
            console.log('Добавлено оборудование:', name, price, category);
        });
    };
    
    // Заторные аппараты
    collectEquipment(selectedMash, 'Варочное');
    
    // Фильтрационные аппараты
    collectMultipleEquipment(selectedFilters, 'Фильтрационное');
    
    // Баки горячей воды
    collectMultipleEquipment(selectedWaterTanks, 'Водоподготовка');
    
    // ЦКТ
    collectMultipleEquipment(selectedCCTs, 'Ферментационное');
    
    // Вспомогательное оборудование
    collectMultipleEquipment(selectedAuxiliary, 'Вспомогательное');
    
    console.log('Общая стоимость:', totalCost);
    console.log('Выбранное оборудование:', selectedEquipment);
    
    // Обновляем интерфейс
    this.updateEquipmentUI(totalCost, selectedEquipment, this.getFacilityBudget(facilityType), facilityType);
  }

  updateEquipmentUI(totalCost, selectedEquipment, budget, facilityType) {
    console.log('Обновление UI - стоимость:', totalCost, 'бюджет:', budget);
    
    // Обновляем стоимость
    document.getElementById('total-cost').textContent = totalCost + ' BP';
    document.getElementById('remaining-budget').textContent = (budget - totalCost) + ' BP';
    
    // Показываем выбранное оборудование - с проверкой существования элемента
    const selectedList = document.getElementById('selected-equipment-wide');
    if (!selectedList) {
        console.error('Элемент selected-equipment-wide не найден в DOM!');
        return;
    }
    
    if (selectedEquipment.length > 0) {
    selectedList.innerHTML = selectedEquipment.map(item => 
        `<div class="selected-equipment-item" data-id="${item.id}">
            <span class="equipment-item-name">${item.name}</span>
            <span class="equipment-item-price">${item.price} BP</span>
        </div>`
    ).join('') + 
    `<div class="equipment-total">
        <span>ИТОГО:</span>
        <span>${totalCost} BP</span>
    </div>`;
    console.log('Сводка оборудования обновлена');
} else {
    selectedList.innerHTML = '<p class="empty-selection-wide">Выберите оборудование выше...</p>';
    console.log('Сводка оборудования пуста');
}
    
    // Проверяем совместимость
    const compatibilityCheck = document.getElementById('compatibility-check');
    const isCompatible = this.checkEquipmentCompatibility(selectedEquipment, facilityType);
    
    if (!isCompatible) {
        compatibilityCheck.classList.remove('hidden');
    } else {
        compatibilityCheck.classList.add('hidden');
    }
    
    // Проверяем бюджет
    const budgetWarning = document.getElementById('budget-warning');
    if (totalCost > budget) {
        budgetWarning.classList.remove('hidden');
    } else {
        budgetWarning.classList.add('hidden');
    }
    
    // Активируем кнопку если все ок
    const selectedMash = document.querySelector('input[name="mashTun"]:checked');
    const hasChemical = document.getElementById('chemical')?.checked || false;
    const isValid = selectedMash && hasChemical && totalCost <= budget && isCompatible;
    
    const startBtn = document.getElementById('start-production-btn');
    startBtn.disabled = !isValid;
    
    console.log('Кнопка запуска активна:', isValid);
}

  checkEquipmentCompatibility(selectedEquipment, facilityType) {
    // Базовая проверка совместимости оборудования с помещением
    const hasMashTun = selectedEquipment.some(item => item.category === 'Варочное');
    const hasChemical = selectedEquipment.some(item => item.name.includes('Химраствор'));
    
    console.log('Проверка совместимости - есть варочный:', hasMashTun, 'есть химраствор:', hasChemical);
    
    return hasMashTun && hasChemical;
  }

  startProduction(facilityType) {
    this.playSound('success');
    const facility = this.businessLevels[facilityType];
    
    // Собираем информацию о выбранном оборудовании
    const selectedMash = document.querySelector('input[name="mashTun"]:checked');
    const selectedEquipment = [];
    
    if (selectedMash) {
        const mashElement = selectedMash.closest('.equipment-option-wide');
        selectedEquipment.push(mashElement.querySelector('strong').textContent);
    }
    
    // Добавляем остальное выбранное оборудование
    const allSelected = document.querySelectorAll('#facility-equipment-screen input:checked');
    allSelected.forEach(input => {
        if (input.name !== 'mashTun') {
            const element = input.closest('.equipment-option-wide');
            selectedEquipment.push(element.querySelector('strong').textContent);
        }
    });
    
    this.showFeedback(`🎉 Производство на ${facility.name} запущено! Выбрано оборудование: ${selectedEquipment.join(', ')}`, "correct");
    
    // Закрываем экран оборудования и возвращаем к выбору помещений
    setTimeout(() => {
        document.getElementById('facility-equipment-screen').classList.add('hidden');
        this.showBusinessStartScreen();
    }, 3000);
  }
  // Добавьте этот метод для обновления интерфейса чека
updateEquipmentUI(totalCost, selectedEquipment, budget, facilityType) {
    console.log('Обновление UI - стоимость:', totalCost, 'бюджет:', budget);
    
    // Обновляем стоимость
    document.getElementById('total-cost').textContent = totalCost + ' BP';
    document.getElementById('remaining-budget').textContent = (budget - totalCost) + ' BP';
    
    // Показываем выбранное оборудование в стиле чека
    const selectedList = document.getElementById('selected-equipment-wide');
    if (!selectedList) {
        console.error('Элемент selected-equipment-wide не найден в DOM!');
        return;
    }
    
    if (selectedEquipment.length > 0) {
        selectedList.innerHTML = selectedEquipment.map(item => 
            `<div class="selected-equipment-item" data-id="${item.id}">
                <span class="equipment-item-name">${item.name}</span>
                <span class="equipment-item-price">${item.price} BP</span>
                <button class="remove-equipment-btn" onclick="game.removeEquipment('${item.id}')">×</button>
            </div>`
        ).join('') + 
        `<div class="equipment-total">
            <span>ИТОГО:</span>
            <span>${totalCost} BP</span>
        </div>`;
        
        console.log('Сводка оборудования обновлена');
    } else {
        selectedList.innerHTML = '<p class="empty-selection-wide">Выберите оборудование выше...</p>';
        console.log('Сводка оборудования пуста');
    }
    
    // Остальной код проверок совместимости и бюджета...
    const compatibilityCheck = document.getElementById('compatibility-check');
    const isCompatible = this.checkEquipmentCompatibility(selectedEquipment, facilityType);
    
    if (!isCompatible) {
        compatibilityCheck.classList.remove('hidden');
    } else {
        compatibilityCheck.classList.add('hidden');
    }
    
    const budgetWarning = document.getElementById('budget-warning');
    if (totalCost > budget) {
        budgetWarning.classList.remove('hidden');
    } else {
        budgetWarning.classList.add('hidden');
    }
    
    const selectedMash = document.querySelector('input[name="mashTun"]:checked');
    const hasChemical = document.getElementById('chemical')?.checked || false;
    const isValid = selectedMash && hasChemical && totalCost <= budget && isCompatible;
    
    const startBtn = document.getElementById('start-production-btn');
    startBtn.disabled = !isValid;
    
    console.log('Кнопка запуска активна:', isValid);
}


// Добавьте этот вспомогательный метод
getCurrentFacilityType() {
    const facilityName = document.getElementById('current-facility-name').textContent;
    const facilityTypes = {
        'Подготовительной': 'preparation',
        'Заторно-сусловарной': 'mashing', 
        'Цеха брожения': 'fermentation',
        'Розливной': 'bottling',
        'Производственного цеха': 'production',
        'Продвинутого цеха': 'advanced',
        'Пивоваренного комплекса': 'complex'
    };
    return facilityTypes[facilityName] || 'preparation';
}
}

// Создаем глобальную переменную для доступа из HTML
const game = new BreweryGame();