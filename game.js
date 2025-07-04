document.addEventListener('DOMContentLoaded', () => {
    // Конфигурация уровней с описаниями
    const levels = {
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
            description: "На заводе оврал! Рома не перезванивает по поводу КП а заказчиком нужно сейчас подключить завод. Переставьте оборудование в нужной последовательности. На сырном заводе"
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
            description: "На предприятии молока ЧП, охранник поддтерся ночью свежими эскизами подключения. помогите стажеру разобраться и правильно подключить завод"
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
            description: "Все пошло по пизде. нужно переподключить"
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
            description: "Я ебал как тут все поставить... сказал главный инжинер квасного завода увидев это"
        }
    };

    // Названия оборудования
    const equipNames = {
        fermenter: "Ферментер",
        "heat-exchanger": "Теплообменник",
        centrifuge: "Центрифуга",
        boiler: "Котёл",
        cooler: "Охладитель"
    };

    // Элементы интерфейса
    const startScreen = document.getElementById('start-screen');
    const levelSelectScreen = document.getElementById('level-select-screen');
    const gameScreen = document.getElementById('game-screen');
    const winScreen = document.getElementById('win-screen');
    const loseScreen = document.getElementById('lose-screen');
    const startBtn = document.getElementById('start-btn');
    const backToMenuBtn = document.getElementById('back-to-menu');
    const levelCards = document.querySelectorAll('.level-card');
    const launchBtn = document.getElementById('launch-btn');
    const hintBtn = document.getElementById('hint-btn');
    const restartBtns = document.querySelectorAll('.restart-btn');
    const nextLevelBtn = document.querySelector('.next-level-btn');
    const timerDisplay = document.querySelector('.timer');
    const feedbackMessage = document.querySelector('.feedback-message');
    const timeSpentDisplay = document.getElementById('time-spent');
    const starsEarnedDisplay = document.getElementById('stars-earned');
    const levelNameDisplay = document.querySelector('.level-name');
    const levelDescText = document.getElementById('level-desc-text');
    const successSound = document.getElementById('success-sound');
    const errorSound = document.getElementById('error-sound');
    const sandboxBtn = document.getElementById('sandboxBtn');
    const playground = document.getElementById('playground');
    const equipmentPanel = document.getElementById('equipmentPanel');

    // Игровые переменные
    let currentLevel = 1;
    let timeLeft = 0;
    let timer;
    let gameStarted = false;
    let equipmentPlaced = 0;
    let startTime;
    let selectedEquipment = null;
    let sandboxMode = false;
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    // Прогресс игры
    const gameProgress = {
        unlockedLevels: [1],
        bestTimes: {},
        bestStars: {}
    };

    // Загрузка сохранений
    function loadProgress() {
        const saved = localStorage.getItem('breweryGameProgress');
        if (saved) {
            const parsed = JSON.parse(saved);
            gameProgress.unlockedLevels = parsed.unlockedLevels || [1];
            gameProgress.bestTimes = parsed.bestTimes || {};
            gameProgress.bestStars = parsed.bestStars || {};
        }
    }

    // Сохранение прогресса
    function saveProgress() {
        localStorage.setItem('breweryGameProgress', JSON.stringify(gameProgress));
    }

    // Инициализация игры
    function initGame(levelTime) {
        timeLeft = levelTime;
        equipmentPlaced = 0;
        gameStarted = true;
        startTime = Date.now();
        selectedEquipment = null;
        
        timerDisplay.textContent = formatTime(timeLeft);
        timerDisplay.classList.remove('low-time');
        feedbackMessage.textContent = '';
        feedbackMessage.className = 'feedback-message';
        launchBtn.disabled = true;
        hintBtn.disabled = false;
        
        clearInterval(timer);
        timer = setInterval(updateTimer, 1000);
        
        // Предзагрузка звуков для мобильных
        if (isMobile) {
            successSound.load();
            errorSound.load();
        }
    }

    // Форматирование времени
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    // Обновление таймера
    function updateTimer() {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);
        
        if (timeLeft <= 10) {
            timerDisplay.classList.add('low-time');
        }
        
        if (timeLeft <= 0) {
            endGame(false);
        }
    }

    // Конец игры
    function endGame(isWin) {
        clearInterval(timer);
        gameStarted = false;
        gameScreen.classList.add('hidden');
        
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        timeSpentDisplay.textContent = formatTime(timeSpent);
        
        if (isWin) {
            // Расчет звезд
            const stars = calculateStars(timeSpent);
            starsEarnedDisplay.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
            
            // Обновление прогресса
            if (!gameProgress.bestTimes[currentLevel] || timeSpent < gameProgress.bestTimes[currentLevel]) {
                gameProgress.bestTimes[currentLevel] = timeSpent;
            }
            
            if (!gameProgress.bestStars[currentLevel] || stars > gameProgress.bestStars[currentLevel]) {
                gameProgress.bestStars[currentLevel] = stars;
            }
            
            // Разблокировка следующего уровня
            if (currentLevel < 4 && !gameProgress.unlockedLevels.includes(currentLevel + 1)) {
                gameProgress.unlockedLevels.push(currentLevel + 1);
            }
            
            saveProgress();
            updateLevelSelectScreen();
            
            winScreen.classList.remove('hidden');
            successSound.play();
            createConfetti();
        } else {
            loseScreen.classList.remove('hidden');
            errorSound.play();
        }
    }

    // Расчет звезд
    function calculateStars(timeSpent) {
        const level = levels[currentLevel];
        if (timeSpent <= level.threshold3) return 3;
        if (timeSpent <= level.threshold2) return 2;
        return 1;
    }

    // Создание конфетти
    function createConfetti() {
        const confettiContainer = document.querySelector('.confetti');
        confettiContainer.innerHTML = '';
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
            
            confettiContainer.appendChild(confetti);
        }
        
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes fall {
                to {
                    transform: translateY(calc(100vh + 10px)) rotate(${Math.random() * 360}deg);
                }
            }
        `;
        document.head.appendChild(style);
    }

    function getRandomColor() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Размещение оборудования
    function placeEquipment(slot, equipmentId) {
        if (slot.dataset.filled === 'true') return;
        
        const equipmentImg = document.createElement('img');
        equipmentImg.src = `assets/images/${equipmentId}.png`;
        equipmentImg.className = 'equipment-placed';
        equipmentImg.alt = equipNames[equipmentId];
        
        slot.innerHTML = '';
        
        // Добавляем номер слота
        const slotNumber = document.createElement('div');
        slotNumber.className = 'slot-number';
        slotNumber.textContent = slot.dataset.number;
        slot.appendChild(slotNumber);
        
        slot.appendChild(equipmentImg);
        slot.dataset.filled = 'true';
        slot.dataset.equipment = equipmentId;
        
        document.querySelector(`.equipment-btn[data-equipment="${equipmentId}"]`).style.display = 'none';
        
        // Анимация для правильного оборудования
        if (slot.dataset.correct === equipmentId) {
            equipmentImg.classList.add('equipment-correct');
            setTimeout(() => {
                equipmentImg.classList.remove('equipment-correct');
            }, 500);
        }
        
        equipmentPlaced++;
        if (equipmentPlaced === levels[currentLevel].equipment.length) {
            launchBtn.disabled = false;
            feedbackMessage.textContent = 'Все оборудование размещено!';
            feedbackMessage.classList.add('correct');
        }
    }

    // Расчет размера слотов на основе количества
    function calculateSlotSize(elementCount) {
        const baseSize = 22; // vw
        const minSize = 70; // px
        const scaleFactor = 0.9;
        
        // Применяем формулу масштабирования
        let calculatedSize = baseSize * Math.pow(scaleFactor, Math.max(0, elementCount - 3));
        
        // Ограничиваем минимальный размер
        return `clamp(${minSize}px, ${calculatedSize}vw, ${baseSize}vw)`;
    }

    // Инициализация уровня
    function initLevel(levelId) {
        currentLevel = levelId;
        const level = levels[levelId];
        const slotCount = level.slots.length;
        
        // Очистка игрового поля
        playground.innerHTML = '';
        equipmentPanel.innerHTML = '';
        
        // Установка названия уровня
        levelNameDisplay.textContent = `Уровень: ${level.name}`;
        
        // Установка описания уровня
        levelDescText.textContent = level.description;
        
        // Расчет размера слотов
        const slotSize = calculateSlotSize(slotCount);
        
        // Создание слотов
        level.slots.forEach(slotConfig => {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.id = slotConfig.id;
            slot.dataset.correct = slotConfig.correct;
            slot.dataset.number = slotConfig.number;
            slot.style.width = slotSize;
            slot.style.height = slotSize;
            
            // Добавляем номер слота
            const slotNumber = document.createElement('div');
            slotNumber.className = 'slot-number';
            slotNumber.textContent = slotConfig.number;
            slot.appendChild(slotNumber);
            
            playground.appendChild(slot);
        });
        
        // Расчет размера оборудования (85% от размера слота)
        const equipmentSize = `calc(${slotSize} * 0.85)`;
        
        // Создание оборудования
        level.equipment.forEach(equipId => {
            const btn = document.createElement('div');
            btn.className = 'equipment-btn';
            btn.dataset.equipment = equipId;
            
            const img = document.createElement('img');
            img.src = `assets/images/${equipId}.png`;
            img.className = 'equipment';
            img.id = equipId;
            img.alt = equipNames[equipId];
            img.style.width = equipmentSize;
            img.style.height = equipmentSize;
            
            const label = document.createElement('p');
            label.textContent = equipNames[equipId];
            
            btn.appendChild(img);
            btn.appendChild(label);
            equipmentPanel.appendChild(btn);
        });
        
        // Запуск игры
        initGame(level.time);
    }

    // Обновление экрана выбора уровня
    function updateLevelSelectScreen() {
        levelCards.forEach(card => {
            const level = parseInt(card.dataset.level);
            const lockIcon = card.querySelector('.lock-icon');
            const starsContainer = card.querySelector('.stars-container');
            
            // Очищаем контейнер звезд
            starsContainer.innerHTML = '';
            
            if (gameProgress.unlockedLevels.includes(level)) {
                lockIcon.classList.add('hidden');
                
                // Добавляем звезды
                const starCount = gameProgress.bestStars[level] || 0;
                for (let i = 0; i < 3; i++) {
                    const star = document.createElement('span');
                    star.className = 'star';
                    if (i < starCount) {
                        star.classList.add('filled');
                    }
                    star.textContent = '★';
                    starsContainer.appendChild(star);
                }
            } else {
                lockIcon.classList.remove('hidden');
            }
        });
    }

    // Функция подсказки
    function showHint() {
        if (!gameStarted || timeLeft <= 10) return;
        
        const level = levels[currentLevel];
        let slotToHighlight = null;
        
        // Ищем первый неправильно заполненный или пустой слот
        for (const slotConfig of level.slots) {
            const slot = document.getElementById(slotConfig.id);
            if (slot.dataset.filled !== 'true' || slot.dataset.equipment !== slotConfig.correct) {
                slotToHighlight = slot;
                break;
            }
        }
        
        if (slotToHighlight) {
            // Подсвечиваем слот
            slotToHighlight.classList.add('highlight-correct');
            setTimeout(() => {
                slotToHighlight.classList.remove('highlight-correct');
            }, 1000);
            
            // Вычитаем время
            timeLeft = Math.max(0, timeLeft - 10);
            timerDisplay.textContent = formatTime(timeLeft);
            
            feedbackMessage.textContent = 'Подсказка использована! -10 секунд';
            feedbackMessage.classList.add('correct');
        }
    }

    // Режим песочницы
    function initSandboxMode() {
        sandboxMode = true;
        levelSelectScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // Создаем пользовательский уровень
        const sandboxLevel = {
            name: "Песочница",
            time: 9999,
            slots: [
                { id: "slot1", correct: "fermenter", number: 1 },
                { id: "slot2", correct: "heat-exchanger", number: 2 },
                { id: "slot3", correct: "centrifuge", number: 3 },
                { id: "slot4", correct: "boiler", number: 4 },
                { id: "slot5", correct: "cooler", number: 5 }
            ],
            equipment: ["fermenter", "heat-exchanger", "centrifuge", "boiler", "cooler"],
            threshold3: 0,
            threshold2: 0,
            description: "Экспериментируйте и тестируйте различные комбинации оборудования"
        };
        
        // Инициализируем песочницу
        currentLevel = 0;
        const slotCount = sandboxLevel.slots.length;
        
        // Очистка игрового поля
        playground.innerHTML = '';
        equipmentPanel.innerHTML = '';
        
        // Установка названия уровня
        levelNameDisplay.textContent = `Режим: ${sandboxLevel.name}`;
        
        // Установка описания уровня
        levelDescText.textContent = sandboxLevel.description;
        
        // Расчет размера слотов
        const slotSize = calculateSlotSize(slotCount);
        
        // Создание слотов
        sandboxLevel.slots.forEach(slotConfig => {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.id = slotConfig.id;
            slot.dataset.correct = slotConfig.correct;
            slot.dataset.number = slotConfig.number;
            slot.style.width = slotSize;
            slot.style.height = slotSize;
            
            // Добавляем номер слота
            const slotNumber = document.createElement('div');
            slotNumber.className = 'slot-number';
            slotNumber.textContent = slotConfig.number;
            slot.appendChild(slotNumber);
            
            playground.appendChild(slot);
        });
        
        // Расчет размера оборудования (85% от размера слота)
        const equipmentSize = `calc(${slotSize} * 0.85)`;
        
        // Создание оборудования
        sandboxLevel.equipment.forEach(equipId => {
            const btn = document.createElement('div');
            btn.className = 'equipment-btn';
            btn.dataset.equipment = equipId;
            
            const img = document.createElement('img');
            img.src = `assets/images/${equipId}.png`;
            img.className = 'equipment';
            img.id = equipId;
            img.alt = equipNames[equipId];
            img.style.width = equipmentSize;
            img.style.height = equipmentSize;
            
            const label = document.createElement('p');
            label.textContent = equipNames[equipId];
            
            btn.appendChild(img);
            btn.appendChild(label);
            equipmentPanel.appendChild(btn);
        });
        
        // Запуск игры без таймера
        timeLeft = 9999;
        equipmentPlaced = 0;
        gameStarted = true;
        startTime = Date.now();
        selectedEquipment = null;
        
        timerDisplay.textContent = "∞";
        feedbackMessage.textContent = '';
        feedbackMessage.className = 'feedback-message';
        launchBtn.disabled = false;
        hintBtn.disabled = true;
        
        clearInterval(timer);
    }

    // Обработчики событий
    startBtn.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        levelSelectScreen.classList.remove('hidden');
        loadProgress();
        updateLevelSelectScreen();
    });

    backToMenuBtn.addEventListener('click', () => {
        levelSelectScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    });

    levelCards.forEach(card => {
        card.addEventListener('click', () => {
            const level = parseInt(card.dataset.level);
            if (gameProgress.unlockedLevels.includes(level)) {
                levelSelectScreen.classList.add('hidden');
                gameScreen.classList.remove('hidden');
                initLevel(level);
            }
        });
    });

    sandboxBtn.addEventListener('click', initSandboxMode);
    hintBtn.addEventListener('click', showHint);

    // Управление оборудованием
    document.addEventListener(isMobile ? 'touchstart' : 'mousedown', (e) => {
        const equipmentBtn = e.target.closest('.equipment-btn');
        if (equipmentBtn && equipmentBtn.style.display !== 'none') {
            selectedEquipment = equipmentBtn.dataset.equipment;
            document.querySelectorAll('.equipment-btn').forEach(btn => {
                btn.style.opacity = btn === equipmentBtn ? '1' : '0.5';
            });
            
            const equipmentName = equipmentBtn.querySelector('p').textContent;
            feedbackMessage.textContent = `Выбрано: ${equipmentName}`;
            feedbackMessage.className = 'feedback-message';
        }
    });

    document.addEventListener(isMobile ? 'touchend' : 'click', (e) => {
        const slot = e.target.closest('.slot');
        if (slot && selectedEquipment && slot.dataset.filled !== 'true') {
            placeEquipment(slot, selectedEquipment);
            
            selectedEquipment = null;
            document.querySelectorAll('.equipment-btn').forEach(btn => {
                btn.style.opacity = '1';
            });
        }
    });

    // Кнопка запуска завода
    launchBtn.addEventListener('click', () => {
        const level = levels[currentLevel];
        let allCorrect = true;
        
        level.slots.forEach(slotConfig => {
            const slot = document.getElementById(slotConfig.id);
            if (slot.dataset.equipment !== slotConfig.correct) {
                allCorrect = false;
            }
        });
        
        if (allCorrect) {
            feedbackMessage.textContent = 'Правильно! Завод запущен!';
            feedbackMessage.classList.add('correct');
            setTimeout(() => endGame(true), 1500);
        } else {
            feedbackMessage.textContent = 'Неверно! Завод не может работать!';
            feedbackMessage.classList.add('incorrect');
            setTimeout(() => endGame(false), 1500);
        }
    });

    // Кнопки рестарта
    restartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            winScreen.classList.add('hidden');
            loseScreen.classList.add('hidden');
            if (sandboxMode) {
                initSandboxMode();
            } else {
                gameScreen.classList.remove('hidden');
                initLevel(currentLevel);
            }
        });
    });

    // Кнопка следующего уровня
    nextLevelBtn.addEventListener('click', () => {
        sandboxMode = false;
        if (currentLevel < 4) {
            winScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            initLevel(currentLevel + 1);
        } else {
            winScreen.classList.add('hidden');
            levelSelectScreen.classList.remove('hidden');
        }
    });

    // Предотвращение стандартного поведения для мобильных
    document.addEventListener('touchmove', (e) => {
        if (e.target.classList.contains('equipment-btn')) {
            e.preventDefault();
        }
    }, { passive: false });
});