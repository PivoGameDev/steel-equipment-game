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
            description: "На заводе аврал! Рома не перезванивает по поводу КП, а заказчик требует срочно подключить оборудование. Переставьте оборудование в правильной последовательности."
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
            description: "На предприятии ЧП - охранник перепутал схемы подключения. Помогите стажеру правильно подключить оборудование завода."
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
            description: "Все пошло не по плану! Нужно срочно переподключить оборудование в правильном порядке."
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
            description: "Я не понимаю как это подключить! - сказал главный инженер. Помогите правильно собрать сложную систему."
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

    // Игровые переменные
    let currentLevel = 1;
    let timeLeft = 0;
    let timer;
    let gameStarted = false;
    let equipmentPlaced = 0;
    let startTime;
    let selectedEquipment = null;
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
            try {
                const parsed = JSON.parse(saved);
                gameProgress.unlockedLevels = parsed.unlockedLevels || [1];
                gameProgress.bestTimes = parsed.bestTimes || {};
                gameProgress.bestStars = parsed.bestStars || {};
            } catch (e) {
                console.error('Error loading progress:', e);
            }
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
        
        clearInterval(timer);
        timer = setInterval(updateTimer, 1000);
        
        // Предзагрузка звуков
        successSound.load().catch(e => console.log('Sound preload error:', e));
        errorSound.load().catch(e => console.log('Sound preload error:', e));
        
        // Предзагрузка изображений
        preloadEquipmentImages();
    }

    // Предзагрузка изображений оборудования
    function preloadEquipmentImages() {
        const level = levels[currentLevel];
        level.equipment.forEach(equipId => {
            const img = new Image();
            img.src = `assets/images/${equipId}.png`;
        });
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
            try {
                successSound.play();
            } catch (e) {
                console.log('Sound play error:', e);
            }
            createConfetti();
        } else {
            loseScreen.classList.remove('hidden');
            try {
                errorSound.play();
            } catch (e) {
                console.log('Sound play error:', e);
            }
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
        
        equipmentPlaced++;
        if (equipmentPlaced === levels[currentLevel].equipment.length) {
            launchBtn.disabled = false;
            feedbackMessage.textContent = 'Все оборудование размещено!';
            feedbackMessage.classList.add('correct');
        }
    }

    // Инициализация уровня
    function initLevel(levelId) {
        currentLevel = levelId;
        const level = levels[levelId];
        
        // Очистка игрового поля
        document.querySelector('.playground').innerHTML = '';
        document.querySelector('.equipment-panel').innerHTML = '';
        
        // Установка названия уровня
        levelNameDisplay.textContent = `Уровень: ${level.name}`;
        
        // Установка описания уровня
        levelDescText.textContent = level.description;
        
        // Создание слотов
        level.slots.forEach(slotConfig => {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.id = slotConfig.id;
            slot.dataset.correct = slotConfig.correct;
            slot.dataset.number = slotConfig.number;
            slot.dataset.filled = 'false';
            
            // Добавляем номер слота
            const slotNumber = document.createElement('div');
            slotNumber.className = 'slot-number';
            slotNumber.textContent = slotConfig.number;
            slot.appendChild(slotNumber);
            
            document.querySelector('.playground').appendChild(slot);
        });
        
        // Создание оборудования
        level.equipment.forEach(equipId => {
            const btn = document.createElement('div');
            btn.className = 'equipment-btn';
            btn.dataset.equipment = equipId;
            
            const img = document.createElement('img');
            img.src = `assets/images/${equipId}.png`;
            img.className = 'equipment';
            img.alt = equipNames[equipId];
            
            const label = document.createElement('p');
            label.textContent = equipNames[equipId];
            
            btn.appendChild(img);
            btn.appendChild(label);
            document.querySelector('.equipment-panel').appendChild(btn);
        });
        
        // Запуск игры
        initGame(level.time);
    }

    // Обновление экрана выбора уровня
    function updateLevelSelectScreen() {
        levelCards.forEach(card => {
            const level = parseInt(card.dataset.level);
            const lockIcon = card.querySelector('.lock-icon');
            
            if (gameProgress.unlockedLevels.includes(level)) {
                lockIcon.classList.add('hidden');
            } else {
                lockIcon.classList.remove('hidden');
            }
        });
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

    // Управление оборудованием
    function handleEquipmentSelection(equipmentBtn) {
        if (equipmentBtn.style.display !== 'none') {
            selectedEquipment = equipmentBtn.dataset.equipment;
            document.querySelectorAll('.equipment-btn').forEach(btn => {
                btn.style.opacity = btn === equipmentBtn ? '1' : '0.5';
            });
            
            const equipmentName = equipmentBtn.querySelector('p').textContent;
            feedbackMessage.textContent = `Выбрано: ${equipmentName}`;
            feedbackMessage.className = 'feedback-message';
        }
    }

    function handleSlotPlacement(slot) {
        if (slot && selectedEquipment && slot.dataset.filled === 'false') {
            placeEquipment(slot, selectedEquipment);
            
            selectedEquipment = null;
            document.querySelectorAll('.equipment-btn').forEach(btn => {
                btn.style.opacity = '1';
            });
        }
    }

    // Обработка событий для мобильных и десктопов
    if (isMobile) {
        // Для мобильных устройств
        document.addEventListener('touchstart', (e) => {
            const equipmentBtn = e.target.closest('.equipment-btn');
            if (equipmentBtn) {
                e.preventDefault();
                handleEquipmentSelection(equipmentBtn);
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            const slot = e.target.closest('.slot');
            handleSlotPlacement(slot);
        });
    } else {
        // Для десктопов
        document.addEventListener('mousedown', (e) => {
            const equipmentBtn = e.target.closest('.equipment-btn');
            if (equipmentBtn) {
                handleEquipmentSelection(equipmentBtn);
            }
        });

        document.addEventListener('click', (e) => {
            const slot = e.target.closest('.slot');
            handleSlotPlacement(slot);
        });
    }

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
            gameScreen.classList.remove('hidden');
            initLevel(currentLevel);
        });
    });

    // Кнопка следующего уровня
    nextLevelBtn.addEventListener('click', () => {
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
    
    // Предзагрузка ресурсов при загрузке страницы
    window.addEventListener('load', () => {
        const sounds = [successSound, errorSound];
        sounds.forEach(sound => {
            sound.load().catch(e => console.log('Initial sound preload error:', e));
        });
    });
});