// Основной класс игры
class BreweryGame {
  constructor() {
    // Конфигурация уровней
    this.levels = {
      1: {
        name: "Варочный цех",
        time: 300,
        slots: [
          { id: "slot1", correct: "malt-crusher", number: 1 },
          { id: "slot2", correct: "congestion-device", number: 2 },
          { id: "slot3", correct: "steam-generator", number: 3 },
          { id: "slot4", correct: "hot-water-tank", number: 4 },
          { id: "slot5", correct: "filtration-unit", number: 5 },
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
        description: "Соберите правильную последовательность оборудования варочного цеха. Вам нужно расставить 7 из 10 предложенных элементов оборудования в правильном порядке.",
        hint: "Правильный порядок: Дробилка солода → Заторный аппарат → Парогенератор → Бак горячей воды → Фильтрационный аппарат → Сусловарочный аппарат → Гидроциклонный аппарат"
      },
      2: {
        name: "Бродильный цех",
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
        description: "Теперь соберите оборудование бродильного цеха. Вам нужно правильно расставить 3 элемента оборудования из 10 возможных.",
        hint: "Правильный порядок: Теплообменник → Чилер → Цилиндро-конический танк"
      },
      3: {
        name: "Настройки температуры",
        time: 120,
        settings: [
          { id: "hot-water-temp", correct: 50, min: 0, max: 100, step: 1, label: "Температура в баке горячей воды (°C)" },
          { id: "tank-temp", correct: -2, min: -10, max: 10, step: 1, label: "Температура в ЦКТ (°C)" }
        ],
        threshold3: 30,
        threshold2: 60,
        description: "Установите правильные температурные режимы для оборудования. Бак горячей воды должен быть +50°C, а ЦКТ -2°C.",
        hint: "Используйте ползунки для установки температуры. Точность важна - отклонение более чем на 3°C считается ошибкой."
      }
    };

    // Состояние игры
    this.state = {
      currentLevel: 1,
      timeLeft: 0,
      gameStarted: false,
      equipmentPlaced: 0,
      hintUsed: false,
      draggedItem: null,
      levelResults: {
        1: { correct: 0, total: 7 },
        2: { correct: 0, total: 3 },
        3: { correct: 0, total: 2 }
      }
    };

    // Прогресс игрока
    this.progress = {
      unlockedLevels: [1],
      bestScores: {}
    };

    // Инициализация игры
    this.initElements();
    this.initEventListeners();
    this.loadProgress();
    this.renderLevelCards();
    this.preloadAssets();
  }

  // Инициализация DOM элементов
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
      resetBtn: document.getElementById('reset-btn'),
      timerDisplay: document.querySelector('.timer'),
      feedbackMessage: document.querySelector('.feedback-message'),
      timeSpentDisplay: document.getElementById('time-spent'),
      scoreDisplay: document.getElementById('score-earned'),
      levelNameDisplay: document.querySelector('.level-name'),
      levelDescText: document.getElementById('level-desc-text'),
      playground: document.querySelector('.playground'),
      equipmentPanel: document.querySelector('.equipment-panel'),
      hintModal: document.getElementById('hint-modal'),
      hintText: document.getElementById('hint-text'),
      closeModal: document.querySelector('.close-modal'),
      settingsContainer: document.querySelector('.settings-container'),
      levelDetails: document.getElementById('level-details')
    };

    this.sounds = {
      success: new Audio('assets/sounds/success.mp3'),
      error: new Audio('assets/sounds/error.mp3'),
      click: new Audio('assets/sounds/click.mp3')
    };
  }

  // Инициализация обработчиков событий
  initEventListeners() {
    // Кнопки интерфейса
    this.elements.startBtn.addEventListener('click', () => this.showLevelSelect());
    this.elements.backToMenuBtn.addEventListener('click', () => this.showStartScreen());
    this.elements.launchBtn.addEventListener('click', () => this.checkSolution());
    this.elements.hintBtn.addEventListener('click', () => this.showHint());
    this.elements.resetBtn.addEventListener('click', () => this.resetEquipment());
    this.elements.closeModal.addEventListener('click', () => this.closeHintModal());

    // Обработчики для мобильных и десктопных устройств
    if (this.isMobile()) {
      this.initMobileHandlers();
    } else {
      this.initDesktopHandlers();
    }

    // Кнопки рестарта и следующего уровня
    document.querySelectorAll('.restart-btn').forEach(btn => {
      btn.addEventListener('click', () => this.restartLevel());
    });
    
    document.querySelector('.next-level-btn').addEventListener('click', () => {
      this.nextLevel();
    });
  }

  // Проверка мобильного устройства
  isMobile() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }

  // Инициализация обработчиков для мобильных устройств
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
        // Обновляем позицию перетаскиваемого элемента
        const touch = e.touches[0];
        this.state.draggedItem.style.position = 'absolute';
        this.state.draggedItem.style.left = (touch.clientX - 75) + 'px';
        this.state.draggedItem.style.top = (touch.clientY - 75) + 'px';
      }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
      if (this.state.draggedItem) {
        const slot = document.elementFromPoint(
          e.changedTouches[0].clientX,
          e.changedTouches[0].clientY
        ).closest('.slot');
        
        if (slot) {
          this.placeEquipment(slot, this.state.draggedItem.dataset.equipment);
        }
        
        // Возвращаем элемент на место
        this.state.draggedItem.style.position = '';
        this.state.draggedItem.style.left = '';
        this.state.draggedItem.style.top = '';
        
        this.state.draggedItem = null;
        this.deselectEquipment();
      }
    });
  }

  // Инициализация обработчиков для десктопов
  initDesktopHandlers() {
    document.addEventListener('mousedown', (e) => {
      const equipmentBtn = e.target.closest('.equipment-btn');
      if (equipmentBtn && equipmentBtn.style.display !== 'none') {
        this.selectEquipment(equipmentBtn);
        this.state.draggedItem = equipmentBtn;
        
        // Для визуального эффекта перетаскивания
        equipmentBtn.classList.add('dragging');
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.state.draggedItem) {
        // Обновляем позицию перетаскиваемого элемента
        this.state.draggedItem.style.position = 'absolute';
        this.state.draggedItem.style.left = (e.clientX - 75) + 'px';
        this.state.draggedItem.style.top = (e.clientY - 75) + 'px';
        
        // Подсветка потенциального слота
        const slot = document.elementFromPoint(e.clientX, e.clientY).closest('.slot');
        document.querySelectorAll('.slot').forEach(s => {
          s.classList.remove('drop-target');
        });
        if (slot) {
          slot.classList.add('drop-target');
        }
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (this.state.draggedItem) {
        const slot = document.elementFromPoint(e.clientX, e.clientY).closest('.slot');
        if (slot) {
          this.placeEquipment(slot, this.state.draggedItem.dataset.equipment);
        }
        
        // Возвращаем элемент на место
        this.state.draggedItem.style.position = '';
        this.state.draggedItem.style.left = '';
        this.state.draggedItem.style.top = '';
        this.state.draggedItem.classList.remove('dragging');
        
        // Снимаем подсветку
        document.querySelectorAll('.slot').forEach(s => {
          s.classList.remove('drop-target');
        });
        
        this.state.draggedItem = null;
        this.deselectEquipment();
      }
    });
  }

  // Загрузка сохраненного прогресса
  loadProgress() {
    const saved = localStorage.getItem('breweryGameProgress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.progress.unlockedLevels = parsed.unlockedLevels || [1];
        this.progress.bestScores = parsed.bestScores || {};
      } catch (e) {
        console.error('Ошибка загрузки прогресса:', e);
      }
    }
  }

  // Сохранение прогресса
  saveProgress() {
    localStorage.setItem('breweryGameProgress', JSON.stringify(this.progress));
  }

  // Начало игры
  startGame() {
    this.state.gameStarted = true;
    this.state.equipmentPlaced = 0;
    this.state.hintUsed = false;
    
    const level = this.levels[this.state.currentLevel];
    this.state.timeLeft = level.time;
    
    this.updateTimerDisplay();
    this.elements.launchBtn.disabled = true;
    this.elements.feedbackMessage.textContent = '';
    this.elements.feedbackMessage.className = 'feedback-message';
    
    this.timer = setInterval(() => this.updateTimer(), 1000);
    
    this.elements.resetBtn.classList.remove('hidden');
    this.elements.hintBtn.classList.remove('hidden');
    this.elements.hintBtn.disabled = false;
    
    // Установка правильного текста кнопки
    if (this.state.currentLevel === 3) {
      this.elements.launchBtn.textContent = 'Запустить завод';
      this.elements.launchBtn.disabled = false; // Разблокируем кнопку для уровня с настройками
    } else {
      this.elements.launchBtn.textContent = 'Далее →';
    }
  }

  // Обновление таймера
  updateTimer() {
    this.state.timeLeft--;
    this.updateTimerDisplay();
    
    if (this.state.timeLeft <= 10) {
      this.elements.timerDisplay.classList.add('low-time');
    }
    
    if (this.state.timeLeft <= 0) {
      clearInterval(this.timer);
      this.endGame(false);
      this.playSound('error');
    }
  }

  // Форматирование времени
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  // Обновление отображения таймера
  updateTimerDisplay() {
    this.elements.timerDisplay.textContent = this.formatTime(this.state.timeLeft);
  }

  // Выбор оборудования
  selectEquipment(equipmentBtn) {
    this.playSound('click');
    this.state.selectedEquipment = equipmentBtn.dataset.equipment;
    
    document.querySelectorAll('.equipment-btn').forEach(btn => {
      btn.style.opacity = btn === equipmentBtn ? '1' : '0.5';
    });
    
    this.elements.feedbackMessage.textContent = `Выбрано: ${this.getEquipmentName(this.state.selectedEquipment)}`;
    this.elements.feedbackMessage.className = 'feedback-message';
  }

  // Получение читаемого названия оборудования
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

  // Сброс выбора оборудования
  deselectEquipment() {
    this.state.selectedEquipment = null;
    document.querySelectorAll('.equipment-btn').forEach(btn => {
      btn.style.opacity = '1';
    });
  }

  // Размещение оборудования в слоте
  placeEquipment(slot, equipmentId) {
    if (slot.dataset.filled === 'true') return;
    
    this.playSound('click');
    
    const equipmentImg = document.createElement('img');
    equipmentImg.src = `assets/images/${equipmentId}.png`;
    equipmentImg.className = 'equipment-placed';
    equipmentImg.alt = equipmentId;
    equipmentImg.onerror = () => {
      console.error(`Ошибка загрузки изображения: assets/images/${equipmentId}.png`);
      equipmentImg.src = 'assets/images/placeholder.png';
    };
    
    slot.innerHTML = '';
    const slotNumber = document.createElement('div');
    slotNumber.className = 'slot-number';
    slotNumber.textContent = slot.dataset.number;
    slot.appendChild(slotNumber);
    
    slot.appendChild(equipmentImg);
    slot.dataset.filled = 'true';
    slot.dataset.equipment = equipmentId;
    
    document.querySelector(`.equipment-btn[data-equipment="${equipmentId}"]`).style.display = 'none';
    
    this.state.equipmentPlaced++;
    
    if (this.state.equipmentPlaced === this.levels[this.state.currentLevel].slots?.length) {
      this.elements.launchBtn.disabled = false;
      this.showFeedback('Все оборудование размещено!', 'correct');
    }
  }

  // Проверка решения
  checkSolution() {
    if (this.state.currentLevel === 3) {
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
    
    // Сохраняем результат для текущего уровня
    this.state.levelResults[this.state.currentLevel].correct = correctCount;
    
    // Показываем результат
    if (correctCount === level.slots.length) {
      this.showFeedback('Правильно! Оборудование установлено верно!', 'correct');
    } else {
      this.showFeedback(`Правильно ${correctCount} из ${level.slots.length}`, 'incorrect');
    }
    
    // Переходим на следующий уровень
    setTimeout(() => this.nextLevel(), 1500);
  }

  // Проверка настроек температуры (уровень 3)
  checkSettingsSolution() {
    const level = this.levels[3];
    let correctCount = 0;
    
    level.settings.forEach(setting => {
      const input = document.getElementById(setting.id);
      const value = parseInt(input.value);
      const diff = Math.abs(value - setting.correct);
      
      if (diff <= 3) { // Допустимое отклонение 3 градуса
        correctCount++;
        input.classList.add('correct-setting');
        setTimeout(() => input.classList.remove('correct-setting'), 1000);
      } else {
        input.classList.add('incorrect-setting');
        setTimeout(() => input.classList.remove('incorrect-setting'), 1000);
      }
    });
    
    // Сохраняем результат для уровня 3
    this.state.levelResults[3].correct = correctCount;
    
    // Завершаем игру
    setTimeout(() => this.endGame(true), 1500);
  }

  // Подсветка слота
  highlightSlot(slot, type) {
    slot.classList.add(`highlight-${type}`);
    setTimeout(() => {
      slot.classList.remove(`highlight-${type}`);
    }, 1000);
  }

  // Конец игры
  endGame(isWin) {
    clearInterval(this.timer);
    this.state.gameStarted = false;
    
    const timeSpent = this.levels[this.state.currentLevel].time - this.state.timeLeft;
    this.elements.timeSpentDisplay.textContent = this.formatTime(timeSpent);
    
    // Расчет общего счета
    const totalScore = this.calculateTotalScore();
    this.elements.scoreDisplay.textContent = totalScore;
    
    // Формируем детали по уровням
    let detailsHTML = '<div class="level-results">';
    for (let level = 1; level <= 3; level++) {
      const result = this.state.levelResults[level];
      const errors = result.total - result.correct;
      
      detailsHTML += `
        <div class="level-result">
          <h3>Уровень ${level}: ${this.levels[level].name}</h3>
          <p>Правильно: ${result.correct} из ${result.total}</p>
          <p>Ошибки: ${errors} (${errors * 5} баллов)</p>
        </div>
      `;
    }
    detailsHTML += '</div>';
    this.elements.levelDetails.innerHTML = detailsHTML;
    
    if (isWin) {
      // Обновление прогресса
      this.updateProgress(totalScore);
      
      // Показ экрана победы
      this.elements.gameScreen.classList.add('hidden');
      this.elements.winScreen.classList.remove('hidden');
      this.playSound('success');
      this.createConfetti();
    } else {
      // Показ экрана поражения
      this.elements.gameScreen.classList.add('hidden');
      this.elements.loseScreen.classList.remove('hidden');
    }
  }

  // Расчет общего счета
  calculateTotalScore() {
    let score = 100; // Максимальный балл
    
    // Вычитаем 5 баллов за каждую ошибку
    for (let level = 1; level <= 3; level++) {
      const errors = this.state.levelResults[level].total - this.state.levelResults[level].correct;
      score -= errors * 5;
    }
    
    return Math.max(0, score); // Не может быть меньше 0
  }

  // Обновление прогресса
  updateProgress(score) {
    // Лучший счет
    if (!this.progress.bestScores[this.state.currentLevel] || 
        score > this.progress.bestScores[this.state.currentLevel]) {
      this.progress.bestScores[this.state.currentLevel] = score;
    }
    
    // Разблокировка следующего уровня
    const nextLevel = this.state.currentLevel + 1;
    if (nextLevel <= Object.keys(this.levels).length && 
        !this.progress.unlockedLevels.includes(nextLevel)) {
      this.progress.unlockedLevels.push(nextLevel);
    }
    
    this.saveProgress();
    this.renderLevelCards();
  }

  // Показать стартовый экран
  showStartScreen() {
    this.playSound('click');
    this.elements.levelSelectScreen.classList.add('hidden');
    this.elements.startScreen.classList.remove('hidden');
  }

  // Показать экран выбора уровня
  showLevelSelect() {
    this.playSound('click');
    this.elements.startScreen.classList.add('hidden');
    this.elements.levelSelectScreen.classList.remove('hidden');
    this.renderLevelCards();
  }

  // Рендер карточек уровней
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
          ${this.progress.bestScores[levelNum] ? `Лучший счет: ${this.progress.bestScores[levelNum]}` : ''}
        </div>
        <div class="lock-icon ${isUnlocked ? 'hidden' : ''}"></div>
      `;
      
      if (isUnlocked) {
        card.addEventListener('click', () => this.startLevel(levelNum));
      }
      
      this.elements.levelCardsContainer.appendChild(card);
    }
  }

  // Начать уровень
  startLevel(levelNum) {
    this.playSound('click');
    this.state.currentLevel = levelNum;
    const level = this.levels[levelNum];
    
    // Очистка игрового поля
    this.elements.playground.innerHTML = '';
    this.elements.equipmentPanel.innerHTML = '';
    this.elements.settingsContainer.innerHTML = '';
    
    // Установка информации об уровне
    this.elements.levelNameDisplay.textContent = `Уровень: ${level.name}`;
    this.elements.levelDescText.textContent = level.description;
    
    if (levelNum === 3) {
      // Создание интерфейса настроек температуры
      this.createSettingsInterface(level);
    } else {
      // Создание слотов для оборудования
      this.createEquipmentSlots(level);
      
      // Создание панели оборудования
      this.createEquipmentPanel(level);
    }
    
    // Переход на игровой экран
    this.elements.levelSelectScreen.classList.add('hidden');
    this.elements.gameScreen.classList.remove('hidden');
    
    // Запуск игры
    this.startGame();
  }

  // Создание интерфейса настроек температуры (уровень 3)
  createSettingsInterface(level) {
    const settingsHTML = level.settings.map(setting => `
      <div class="setting-item">
        <label for="${setting.id}">${setting.label}</label>
        <div class="setting-controls">
          <input type="range" id="${setting.id}" min="${setting.min}" max="${setting.max}" 
                 step="${setting.step}" value="0" class="temp-slider">
          <span class="temp-value">0°C</span>
        </div>
      </div>
    `).join('');
    
    this.elements.settingsContainer.innerHTML = settingsHTML;
    
    // Добавление обработчиков для ползунков
    level.settings.forEach(setting => {
      const slider = document.getElementById(setting.id);
      const valueDisplay = slider.nextElementSibling;
      
      slider.addEventListener('input', () => {
        valueDisplay.textContent = `${slider.value}°C`;
        this.elements.launchBtn.disabled = false; // Разблокируем кнопку при изменении температуры
      });
    });
  }

  // Создание слотов для оборудования
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

  // Создание панели оборудования
  createEquipmentPanel(level) {
    level.equipment.forEach(equipId => {
      const btn = document.createElement('div');
      btn.className = 'equipment-btn';
      btn.dataset.equipment = equipId;
      
      const img = document.createElement('img');
      img.src = `assets/images/${equipId}.png`;
      img.className = 'equipment';
      img.alt = equipId;
      img.onerror = () => {
        console.error(`Ошибка загрузки изображения: assets/images/${equipId}.png`);
        img.src = 'assets/images/placeholder.png';
      };
      
      btn.appendChild(img);
      this.elements.equipmentPanel.appendChild(btn);
    });
  }

  // Сброс оборудования
  resetEquipment() {
    this.playSound('click');
    
    if (this.state.currentLevel === 3) {
      // Сброс настроек температуры
      this.levels[3].settings.forEach(setting => {
        const slider = document.getElementById(setting.id);
        slider.value = 0;
        slider.nextElementSibling.textContent = '0°C';
      });
      this.elements.launchBtn.disabled = true;
      return;
    }
    
    const level = this.levels[this.state.currentLevel];
    
    // Очистка слотов
    document.querySelectorAll('.slot').forEach(slot => {
      slot.innerHTML = '';
      slot.dataset.filled = 'false';
      
      const slotNumber = document.createElement('div');
      slotNumber.className = 'slot-number';
      slotNumber.textContent = slot.dataset.number;
      slot.appendChild(slotNumber);
    });
    
    // Показ всего оборудования
    level.equipment.forEach(equipId => {
      const btn = document.querySelector(`.equipment-btn[data-equipment="${equipId}"]`);
      if (btn) btn.style.display = '';
    });
    
    this.state.equipmentPlaced = 0;
    this.elements.launchBtn.disabled = true;
    this.deselectEquipment();
  }

  // Показать подсказку
  showHint() {
    if (this.state.hintUsed) return;
    
    this.playSound('click');
    this.state.hintUsed = true;
    
    const hint = this.levels[this.state.currentLevel].hint;
    this.elements.hintText.textContent = hint;
    this.elements.hintModal.classList.remove('hidden');
    
    this.elements.hintBtn.disabled = true;
    this.elements.hintBtn.style.opacity = '0.6';
    
    if (this.state.currentLevel !== 3) {
      this.highlightCorrectSlots();
    }
  }

  // Подсветка правильных слотов
  highlightCorrectSlots() {
    const level = this.levels[this.state.currentLevel];
    
    level.slots.forEach(slotConfig => {
      const slot = document.getElementById(slotConfig.id);
      if (slot.dataset.filled === 'false') {
        slot.classList.add('hint-highlight');
        setTimeout(() => {
          slot.classList.remove('hint-highlight');
        }, 2000);
      }
    });
  }

  // Закрыть модальное окно подсказки
  closeHintModal() {
    this.playSound('click');
    this.elements.hintModal.classList.add('hidden');
  }

  // Перезапуск уровня
  restartLevel() {
    this.playSound('click');
    this.elements.winScreen.classList.add('hidden');
    this.elements.loseScreen.classList.add('hidden');
    this.elements.gameScreen.classList.remove('hidden');
    this.startLevel(this.state.currentLevel);
  }

  // Следующий уровень
  nextLevel() {
    this.playSound('click');
    this.elements.gameScreen.classList.add('hidden');
    
    const nextLevel = this.state.currentLevel + 1;
    if (nextLevel <= Object.keys(this.levels).length) {
      this.startLevel(nextLevel);
    } else {
      // Если это последний уровень, показываем результаты
      this.endGame(true);
    }
  }

  // Показать сообщение
  showFeedback(message, type) {
    this.elements.feedbackMessage.textContent = message;
    this.elements.feedbackMessage.className = `feedback-message ${type}`;
  }

  // Создание конфетти
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

  // Случайный цвет
  getRandomColor() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Воспроизведение звука
  playSound(type) {
    try {
      this.sounds[type].currentTime = 0;
      this.sounds[type].play();
    } catch (e) {
      console.log('Ошибка воспроизведения звука:', e);
    }
  }

  // Предзагрузка ресурсов
  preloadAssets() {
    // Предзагрузка изображений оборудования
    const equipmentImages = [
      'malt-crusher', 'congestion-device', 'steam-generator',
      'hot-water-tank', 'filtration-unit', 'wort-brewing-machine',
      'hydrocyclone-apparatus', 'heat-exchanger', 'chiller',
      'cylinder-conical-tank', 'placeholder'
    ];
    
    equipmentImages.forEach(equipId => {
      const img = new Image();
      img.src = `assets/images/${equipId}.png`;
      img.onerror = () => {
        console.error(`Ошибка предзагрузки: assets/images/${equipId}.png`);
      };
    });
  }
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const game = new BreweryGame();
});