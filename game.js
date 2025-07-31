// Основной класс игры
class BreweryGame {
  constructor() {
    // Конфигурация уровней
    this.levels = {
      1: {
        name: "Новичок",
        time: 120,
        slots: [
          { id: "slot1", correct: "fermenter", number: 1 },
          { id: "slot2", correct: "heat-exchanger", number: 2 }
        ],
        equipment: ["fermenter", "heat-exchanger"],
        threshold3: 30,
        threshold2: 60,
        description: "На заводе аврал! Рома не перезванивает по поводу КП, а заказчик требует срочно подключить оборудование. Переставьте оборудование в правильной последовательности. На первом этапе установите ферментер, а затем теплообменник.",
        hint: "Начните с ферментера - это основа процесса брожения."
      },
      2: {
        name: "Специалист",
        time: 90,
        slots: [
          { id: "slot1", correct: "fermenter", number: 1 },
          { id: "slot2", correct: "heat-exchanger", number: 2 },
          { id: "slot3", correct: "centrifuge", number: 3 }
        ],
        equipment: ["fermenter", "heat-exchanger", "centrifuge"],
        threshold3: 25,
        threshold2: 50,
        description: "На предприятии ЧП - охранник перепутал схемы подключения. Помогите стажеру правильно подключить оборудование завода. Сначала установите ферментер, затем теплообменник, и в конце центрифугу для оптимальной работы системы.",
        hint: "Теплообменник всегда следует после ферментера."
      },
      3: {
        name: "Эксперт",
        time: 60,
        slots: [
          { id: "slot1", correct: "boiler", number: 1 },
          { id: "slot2", correct: "centrifuge", number: 2 },
          { id: "slot3", correct: "fermenter", number: 3 },
          { id: "slot4", correct: "heat-exchanger", number: 4 }
        ],
        equipment: ["fermenter", "heat-exchanger", "centrifuge", "boiler"],
        threshold3: 20,
        threshold2: 40,
        description: "Все пошло не по плану! Нужно срочно переподключить оборудование в правильном порядке. Начните с котла, затем установите центрифугу, после этого ферментер и завершите теплообменником. Такая последовательность обеспечит бесперебойную работу.",
        hint: "Котёл должен быть первым, так как он нагревает сусло перед ферментацией."
      },
      4: {
        name: "Мастер",
        time: 45,
        slots: [
          { id: "slot1", correct: "boiler", number: 1 },
          { id: "slot2", correct: "heat-exchanger", number: 2 },
          { id: "slot3", correct: "fermenter", number: 3 },
          { id: "slot4", correct: "centrifuge", number: 4 },
          { id: "slot5", correct: "cooler", number: 5 }
        ],
        equipment: ["fermenter", "heat-exchanger", "centrifuge", "boiler", "cooler"],
        threshold3: 30,
        threshold2: 45,
        description: "Я не понимаю как это подключить! - сказал главный инженер. Помогите правильно собрать сложную систему. Начните с котла, затем теплообменник, ферментер, центрифугу и завершите охладителем. Эта последовательность критически важна для безопасности и эффективности производства.",
        hint: "Охладитель всегда должен быть последним в цепочке оборудования."
      }
    };

    // Состояние игры
    this.state = {
      currentLevel: 1,
      timeLeft: 0,
      gameStarted: false,
      equipmentPlaced: 0,
      hintUsed: false,
      draggedItem: null
    };

    // Прогресс игрока
    this.progress = {
      unlockedLevels: [1],
      bestTimes: {},
      bestStars: {}
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
      starsEarnedDisplay: document.getElementById('stars-earned'),
      levelNameDisplay: document.querySelector('.level-name'),
      levelDescText: document.getElementById('level-desc-text'),
      playground: document.querySelector('.playground'),
      equipmentPanel: document.querySelector('.equipment-panel'),
      hintModal: document.getElementById('hint-modal'),
      hintText: document.getElementById('hint-text'),
      closeModal: document.querySelector('.close-modal')
    };

    this.sounds = {
      success: document.getElementById('success-sound'),
      error: document.getElementById('error-sound'),
      click: document.getElementById('click-sound')
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
    // Обработка касаний оборудования
    document.addEventListener('touchstart', (e) => {
      const equipmentBtn = e.target.closest('.equipment-btn');
      if (equipmentBtn && equipmentBtn.style.display !== 'none') {
        e.preventDefault();
        this.selectEquipment(equipmentBtn);
        this.state.draggedItem = equipmentBtn;
      }
    }, { passive: false });

    // Обработка перемещения оборудования
    document.addEventListener('touchmove', (e) => {
      if (this.state.draggedItem) {
        e.preventDefault();
      }
    }, { passive: false });

    // Обработка размещения оборудования
    document.addEventListener('touchend', (e) => {
      if (this.state.draggedItem) {
        const slot = document.elementFromPoint(
          e.changedTouches[0].clientX,
          e.changedTouches[0].clientY
        ).closest('.slot');
        
        if (slot) {
          this.placeEquipment(slot, this.state.draggedItem.dataset.equipment);
        }
        
        this.state.draggedItem = null;
        this.deselectEquipment();
      }
    });
  }

  // Инициализация обработчиков для десктопов
  initDesktopHandlers() {
    // Выбор оборудования
    document.addEventListener('mousedown', (e) => {
      const equipmentBtn = e.target.closest('.equipment-btn');
      if (equipmentBtn && equipmentBtn.style.display !== 'none') {
        this.selectEquipment(equipmentBtn);
        this.state.draggedItem = equipmentBtn;
      }
    });

    // Размещение оборудования
    document.addEventListener('mouseup', (e) => {
      if (this.state.draggedItem) {
        const slot = e.target.closest('.slot');
        if (slot) {
          this.placeEquipment(slot, this.state.draggedItem.dataset.equipment);
        }
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
        this.progress.bestTimes = parsed.bestTimes || {};
        this.progress.bestStars = parsed.bestStars || {};
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
    
    // Запуск таймера
    this.timer = setInterval(() => this.updateTimer(), 1000);
    
    // Показ/скрытие кнопок
    this.elements.resetBtn.classList.remove('hidden');
    this.elements.hintBtn.classList[this.state.currentLevel >= 3 ? 'remove' : 'add']('hidden');
    this.elements.hintBtn.disabled = false;
  }

  // Обновление таймера
  updateTimer() {
    this.state.timeLeft--;
    this.updateTimerDisplay();
    
    if (this.state.timeLeft <= 10) {
      this.elements.timerDisplay.classList.add('low-time');
    }
    
    if (this.state.timeLeft <= 0) {
      this.endGame(false);
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
    
    // Визуальное выделение выбранного оборудования
    document.querySelectorAll('.equipment-btn').forEach(btn => {
      btn.style.opacity = btn === equipmentBtn ? '1' : '0.5';
    });
    
    this.elements.feedbackMessage.textContent = `Выбрано: ${this.state.selectedEquipment.toUpperCase()}`;
    this.elements.feedbackMessage.className = 'feedback-message';
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
    
    // Создание изображения оборудования
    const equipmentImg = document.createElement('img');
    equipmentImg.src = `assets/images/${equipmentId}.png`;
    equipmentImg.className = 'equipment-placed';
    equipmentImg.alt = equipmentId;
    
    // Очистка слота и добавление номера
    slot.innerHTML = '';
    const slotNumber = document.createElement('div');
    slotNumber.className = 'slot-number';
    slotNumber.textContent = slot.dataset.number;
    slot.appendChild(slotNumber);
    
    // Добавление оборудования
    slot.appendChild(equipmentImg);
    slot.dataset.filled = 'true';
    slot.dataset.equipment = equipmentId;
    
    // Скрытие использованного оборудования
    document.querySelector(`.equipment-btn[data-equipment="${equipmentId}"]`).style.display = 'none';
    
    // Обновление счетчика
    this.state.equipmentPlaced++;
    
    // Проверка на заполнение всех слотов
    if (this.state.equipmentPlaced === this.levels[this.state.currentLevel].equipment.length) {
      this.elements.launchBtn.disabled = false;
      this.showFeedback('Все оборудование размещено!', 'correct');
    }
  }

  // Проверка решения
  checkSolution() {
    const level = this.levels[this.state.currentLevel];
    let allCorrect = true;
    
    // Проверка каждого слота
    level.slots.forEach(slotConfig => {
      const slot = document.getElementById(slotConfig.id);
      if (slot.dataset.equipment !== slotConfig.correct) {
        allCorrect = false;
        this.highlightSlot(slot, 'incorrect');
      } else {
        this.highlightSlot(slot, 'correct');
      }
    });
    
    if (allCorrect) {
      this.showFeedback('Правильно! Завод запущен!', 'correct');
      setTimeout(() => this.endGame(true), 1500);
    } else {
      this.showFeedback('Неверно! Завод не может работать!', 'incorrect');
      setTimeout(() => this.endGame(false), 1500);
    }
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
    
    if (isWin) {
      // Расчет звезд
      const stars = this.calculateStars(timeSpent);
      this.elements.starsEarnedDisplay.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
      
      // Обновление прогресса
      this.updateProgress(timeSpent, stars);
      
      // Показ экрана победы
      this.elements.gameScreen.classList.add('hidden');
      this.elements.winScreen.classList.remove('hidden');
      this.playSound('success');
      this.createConfetti();
    } else {
      // Показ экрана поражения
      this.elements.gameScreen.classList.add('hidden');
      this.elements.loseScreen.classList.remove('hidden');
      this.playSound('error');
    }
  }

  // Расчет количества звезд
  calculateStars(timeSpent) {
    const level = this.levels[this.state.currentLevel];
    if (timeSpent <= level.threshold3) return 3;
    if (timeSpent <= level.threshold2) return 2;
    return 1;
  }

  // Обновление прогресса
  updateProgress(timeSpent, stars) {
    // Лучшее время
    if (!this.progress.bestTimes[this.state.currentLevel] || 
        timeSpent < this.progress.bestTimes[this.state.currentLevel]) {
      this.progress.bestTimes[this.state.currentLevel] = timeSpent;
    }
    
    // Лучший результат по звездам
    if (!this.progress.bestStars[this.state.currentLevel] || 
        stars > this.progress.bestStars[this.state.currentLevel]) {
      this.progress.bestStars[this.state.currentLevel] = stars;
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
        <p>${level.equipment.length} оборудования</p>
        <p>${level.time} секунд</p>
        <div class="level-stars">
          ${this.progress.bestStars[levelNum] ? 
            '★'.repeat(this.progress.bestStars[levelNum]) + 
            '☆'.repeat(3 - this.progress.bestStars[levelNum]) : ''}
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
    
    // Установка информации об уровне
    this.elements.levelNameDisplay.textContent = `Уровень: ${level.name}`;
    this.elements.levelDescText.textContent = level.description;
    
    // Создание слотов
    level.slots.forEach(slotConfig => {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.id = slotConfig.id;
      slot.dataset.correct = slotConfig.correct;
      slot.dataset.number = slotConfig.number;
      slot.dataset.filled = 'false';
      
      // Номер слота
      const slotNumber = document.createElement('div');
      slotNumber.className = 'slot-number';
      slotNumber.textContent = slotConfig.number;
      slot.appendChild(slotNumber);
      
      this.elements.playground.appendChild(slot);
    });
    
    // Создание оборудования
    level.equipment.forEach(equipId => {
      const btn = document.createElement('div');
      btn.className = 'equipment-btn';
      btn.dataset.equipment = equipId;
      
      const img = document.createElement('img');
      img.src = `assets/images/${equipId}.png`;
      img.className = 'equipment';
      img.alt = equipId;
      
      btn.appendChild(img);
      this.elements.equipmentPanel.appendChild(btn);
    });
    
    // Переход на игровой экран
    this.elements.levelSelectScreen.classList.add('hidden');
    this.elements.gameScreen.classList.remove('hidden');
    
    // Запуск игры
    this.startGame();
  }

  // Сброс оборудования
  resetEquipment() {
    this.playSound('click');
    const level = this.levels[this.state.currentLevel];
    
    // Очистка слотов
    document.querySelectorAll('.slot').forEach(slot => {
      slot.innerHTML = '';
      slot.dataset.filled = 'false';
      
      // Восстановление номера слота
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
    
    // Отключение кнопки подсказки
    this.elements.hintBtn.disabled = true;
    this.elements.hintBtn.style.opacity = '0.6';
    
    // Подсветка правильных слотов
    this.highlightCorrectSlots();
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
    this.elements.winScreen.classList.add('hidden');
    
    const nextLevel = this.state.currentLevel + 1;
    if (nextLevel <= Object.keys(this.levels).length) {
      this.startLevel(nextLevel);
    } else {
      this.showLevelSelect();
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
    // Предзагрузка звуков
    Object.values(this.sounds).forEach(sound => {
      sound.load().catch(e => console.log('Ошибка загрузки звука:', e));
    });
    
    // Предзагрузка логотипа
    const logo = new Image();
    logo.src = 'assets/images/logo.png';
    
    // Предзагрузка изображений оборудования
    for (const level of Object.values(this.levels)) {
      level.equipment.forEach(equipId => {
        const img = new Image();
        img.src = `assets/images/${equipId}.png`;
      });
    }
  }
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const game = new BreweryGame();
});