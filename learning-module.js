class LearningGame {
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
                        id: "wort-boiling-time",
                        correct: 90, 
                        min: 60, 
                        max: 120, 
                        step: 5, 
                        label: "Время варки сусла (мин)" 
                    }
                ],
                description: "Добро пожаловать в пивоварню! Начнем с основ - расчета сырья и температурного режима.",
                hint: "Расход солода: 170-200 кг на 1000 литров. Время варки подберите опытным путем"
            },
            2: {
                name: "Основы заторного процесса", 
                time: 180,
                settings: [
                    { id: "hot-water-temp", correct: 80, min: 0, max: 100, step: 1, label: "Температура в баке горячей воды (°C)" },
                    { id: "wort-brewing-time", correct: 7, min: 1, max: 24, step: 1, label: "Время от затирания до перекачки в ЦКТ" }
                ],
                description: "Добро пожаловать в варочный цех! Прежде чем начать варку, нужно правильно подготовить затор.",
                hint: "Температура горячей воды = температуре промывных вод в фильтрационном аппарате."
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
                description: "Отличная работа с настройками! Теперь собери технологическую цепочку варочного цеха.",
                hint: "Правильный порядок: Дробилка солода → Парогенератор → ..."
            },
            4: {
                name: "Настройки брожения",
                time: 180,
                settings: [
                    { id: "tank-temp", correct: -2, min: -10, max: 10, step: 1, label: "Температура в ЦКТ (°C)" },
                    { id: "maturation-time", correct: 21, min: 5, max: 60, step: 1, label: "Время созревания (дни)" }
                ],
                description: "Сусло готово! Теперь самый деликатный этап - брожение.",
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
                description: "Пиво почти готово! Осталось собрать линию охлаждения и дображивания.",
                hint: "Правильный порядок: .. → Чиллер → .."
            }
        };

        this.state = {
            currentLevel: 1,
            timeLeft: 0,
            gameStarted: false,
            equipmentPlaced: 0,
            hintUsed: false
        };

        this.initElements();
        this.initEventListeners();
        this.renderLevelCards();
    }

    initElements() {
        this.elements = {
            startScreen: document.getElementById('start-screen'),
            levelSelectScreen: document.getElementById('level-select-screen'),
            gameScreen: document.getElementById('game-screen'),
            winScreen: document.getElementById('win-screen'),
            loseScreen: document.getElementById('lose-screen'),
            startLearningBtn: document.getElementById('start-learning-btn'),
            backToMenuBtn: document.getElementById('back-to-menu'),
            levelCardsContainer: document.querySelector('.level-cards'),
            launchBtn: document.getElementById('launch-btn'),
            hintBtn: document.getElementById('hint-btn'),
            timerDisplay: document.querySelector('.timer'),
            feedbackMessage: document.querySelector('.feedback-message'),
            timeSpentDisplay: document.getElementById('time-spent'),
            scoreDisplay: document.getElementById('score-earned'),
            levelNameDisplay: document.querySelector('.level-name'),
            levelDescText: document.getElementById('level-desc-text'),
            playground: document.querySelector('.playground'),
            equipmentPanel: document.querySelector('.equipment-panel'),
            settingsContainer: document.querySelector('.settings-container'),
            breweryBackground: document.querySelector('.brewery-background'),
            playgroundContainer: document.querySelector('.playground-container'),
            equipmentPanelContainer: document.querySelector('.equipment-panel-container')
        };
    }

    initEventListeners() {
        this.elements.launchBtn.addEventListener('click', () => this.checkSolution());
        this.elements.hintBtn.addEventListener('click', () => this.showHint());
        
        document.querySelectorAll('.restart-btn').forEach(btn => {
            btn.addEventListener('click', () => this.restartLevel());
        });
    }

    renderLevelCards() {
        const container = this.elements.levelCardsContainer;
        if (!container) return;

        container.innerHTML = '';

        for (let levelNum = 1; levelNum <= 5; levelNum++) {
            const level = this.levels[levelNum];
            const progress = JSON.parse(localStorage.getItem('breweryGameProgress') || '{}');
            const isUnlocked = progress.unlockedLevels ? progress.unlockedLevels.includes(levelNum) : levelNum === 1;

            const card = document.createElement('div');
            card.className = 'level-card';
            card.dataset.level = levelNum;
            card.innerHTML = `
                <h3>${level.name}</h3>
                <p>${level.slots ? level.slots.length + ' оборудования' : 'Настройки'}</p>
                <p>⏱️ ${level.time} сек</p>
                <div class="level-score">
                    ${progress.bestScores && progress.bestScores[levelNum] ? '🏆 ' + progress.bestScores[levelNum] : ''}
                </div>
                <div class="lock-icon ${isUnlocked ? 'hidden' : ''}"></div>
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => this.startLevel(levelNum));
            } else {
                card.style.opacity = '0.6';
            }

            container.appendChild(card);
        }
    }

    startLevel(levelNum) {
        this.state.currentLevel = levelNum;
        const level = this.levels[levelNum];
        
        // Переходим к игровому экрану
        this.elements.levelSelectScreen.classList.add('hidden');
        this.elements.gameScreen.classList.remove('hidden');
        
        // Настраиваем уровень
        this.elements.levelNameDisplay.textContent = `Уровень: ${level.name}`;
        this.elements.levelDescText.textContent = level.description;
        
        // Очищаем контейнеры
        this.elements.playground.innerHTML = '';
        this.elements.equipmentPanel.innerHTML = '';
        this.elements.settingsContainer.innerHTML = '';
        
        // Показываем нужные элементы
        this.elements.playgroundContainer.classList.add('hidden');
        this.elements.equipmentPanelContainer.classList.add('hidden');
        this.elements.settingsContainer.classList.add('hidden');
        this.elements.breweryBackground.classList.add('hidden');

        if (level.settings) {
            // Уровень с настройками
            this.createSettingsInterface(level);
            this.elements.settingsContainer.classList.remove('hidden');
            this.elements.breweryBackground.classList.remove('hidden');
        } else if (level.slots) {
            // Уровень с оборудованием
            this.createEquipmentSlots(level);
            this.createEquipmentPanel(level);
            this.elements.playgroundContainer.classList.remove('hidden');
            this.elements.equipmentPanelContainer.classList.remove('hidden');
        }

        // Запускаем игру
        this.startGame();
    }

    createSettingsInterface(level) {
        const settingsHTML = level.settings.map(setting => {
            let unit = '°C';
            if (setting.id === "malt-consumption") unit = 'кг';
            if (setting.id === "wort-boiling-time") unit = 'мин';
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
            if (setting.id === "wort-boiling-time") unit = 'мин';
            if (setting.id === "wort-brewing-time") unit = 'ч';
            if (setting.id === "maturation-time") unit = 'дн';
            
            slider.addEventListener('input', () => {
                valueDisplay.textContent = `${slider.value}${unit}`;
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
            img.src = `assets/images/${equipId}.png`;

            btn.appendChild(img);
            this.elements.equipmentPanel.appendChild(btn);
        });

        // Добавляем обработчики для выбора оборудования
        this.elements.equipmentPanel.addEventListener('click', (e) => {
            const btn = e.target.closest('.equipment-btn');
            if (!btn) return;
            this.selectEquipment(btn);
        });

        this.elements.playground.addEventListener('click', (e) => {
            const slot = e.target.closest('.slot');
            if (!slot) return;
            this.placeEquipment(slot);
        });
    }

    selectEquipment(equipmentBtn) {
        document.querySelectorAll('.equipment-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        equipmentBtn.classList.add('selected');
        this.state.selectedEquipment = equipmentBtn.dataset.equipment;
    }

    placeEquipment(slot) {
        if (!this.state.selectedEquipment || slot.dataset.filled === 'true') return;
        
        const equipmentId = this.state.selectedEquipment;
        slot.dataset.filled = 'true';
        slot.dataset.equipment = equipmentId;
        
        const img = document.createElement('img');
        img.className = 'equipment-placed';
        img.src = `assets/images/${equipmentId}.png`;
        img.alt = equipmentId;
        
        slot.innerHTML = '';
        slot.appendChild(img);
        
        // Скрываем использованное оборудование
        const usedBtn = document.querySelector(`.equipment-btn[data-equipment="${equipmentId}"]`);
        if (usedBtn) usedBtn.style.display = 'none';
        
        this.state.selectedEquipment = null;
        document.querySelectorAll('.equipment-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        this.checkAllEquipmentPlaced();
    }

    checkAllEquipmentPlaced() {
        const level = this.levels[this.state.currentLevel];
        const allFilled = level.slots.every(slot => {
            return document.getElementById(slot.id).dataset.filled === 'true';
        });
        
        this.elements.launchBtn.disabled = !allFilled;
    }

    startGame() {
        this.state.gameStarted = true;
        this.state.timeLeft = this.levels[this.state.currentLevel].time;
        this.state.hintUsed = false;
        
        this.updateTimerDisplay();
        this.elements.launchBtn.disabled = true;
        this.elements.hintBtn.classList.remove('hidden');
        
        this.timer = setInterval(() => {
            this.state.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.state.timeLeft <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const mins = Math.floor(this.state.timeLeft / 60).toString().padStart(2, '0');
        const secs = (this.state.timeLeft % 60).toString().padStart(2, '0');
        this.elements.timerDisplay.textContent = `${mins}:${secs}`;
    }

    checkSolution() {
        const level = this.levels[this.state.currentLevel];
        
        if (level.settings) {
            this.checkSettingsSolution(level);
        } else {
            this.checkEquipmentSolution(level);
        }
    }

    checkSettingsSolution(level) {
        let correctCount = 0;
        
        level.settings.forEach(setting => {
            const input = document.getElementById(setting.id);
            const value = parseInt(input.value);
            const diff = Math.abs(value - setting.correct);
            
            let allowedDeviation = 3;
            if (setting.id === "malt-consumption") allowedDeviation = 15;
            if (setting.id === "wort-boiling-time") allowedDeviation = 5;
            if (setting.id === "wort-brewing-time") allowedDeviation = 1;
            if (setting.id === "maturation-time") allowedDeviation = 2;
            
            if (diff <= allowedDeviation) {
                correctCount++;
                input.classList.add('correct-setting');
            } else {
                input.classList.add('incorrect-setting');
            }
            
            setTimeout(() => {
                input.classList.remove('correct-setting', 'incorrect-setting');
            }, 1000);
        });
        
        if (correctCount === level.settings.length) {
            this.showFeedback('Все настройки верны!', 'correct');
            setTimeout(() => this.nextLevel(), 1500);
        } else {
            this.showFeedback(`Правильно ${correctCount} из ${level.settings.length}`, 'incorrect');
        }
    }

    checkEquipmentSolution(level) {
        let correctCount = 0;
        
        level.slots.forEach(slotConfig => {
            const slot = document.getElementById(slotConfig.id);
            if (slot.dataset.equipment === slotConfig.correct) {
                correctCount++;
                slot.classList.add('highlight-correct');
            } else {
                slot.classList.add('highlight-incorrect');
            }
            
            setTimeout(() => {
                slot.classList.remove('highlight-correct', 'highlight-incorrect');
            }, 1000);
        });
        
        if (correctCount === level.slots.length) {
            this.showFeedback('Вся сборка верна!', 'correct');
            setTimeout(() => this.nextLevel(), 1500);
        } else {
            this.showFeedback(`Правильно ${correctCount} из ${level.slots.length}`, 'incorrect');
        }
    }

    showFeedback(message, type) {
        this.elements.feedbackMessage.textContent = message;
        this.elements.feedbackMessage.className = `feedback-message ${type}`;
    }

    showHint() {
        if (this.state.hintUsed) return;
        this.state.hintUsed = true;
        
        const level = this.levels[this.state.currentLevel];
        alert(level.hint);
        this.elements.hintBtn.disabled = true;
    }

    nextLevel() {
        clearInterval(this.timer);
        
        // Сохраняем прогресс
        const progress = JSON.parse(localStorage.getItem('breweryGameProgress') || '{}');
        if (!progress.unlockedLevels) progress.unlockedLevels = [1];
        
        const nextLevel = this.state.currentLevel + 1;
        if (nextLevel <= 5 && !progress.unlockedLevels.includes(nextLevel)) {
            progress.unlockedLevels.push(nextLevel);
            localStorage.setItem('breweryGameProgress', JSON.stringify(progress));
        }
        
        if (nextLevel <= 5) {
            this.startLevel(nextLevel);
        } else {
            this.endGame(true);
        }
    }

    endGame(isWin) {
        clearInterval(this.timer);
        
        this.elements.gameScreen.classList.add('hidden');
        
        if (isWin) {
            this.elements.winScreen.classList.remove('hidden');
            this.elements.timeSpentDisplay.textContent = this.formatTime(
                this.levels[this.state.currentLevel].time - this.state.timeLeft
            );
            this.elements.scoreDisplay.textContent = this.calculateScore();
        } else {
            this.elements.loseScreen.classList.remove('hidden');
        }
    }

    calculateScore() {
        return 100 + (this.state.currentLevel * 20);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    restartLevel() {
        this.elements.winScreen.classList.add('hidden');
        this.elements.loseScreen.classList.add('hidden');
        this.elements.gameScreen.classList.remove('hidden');
        this.startLevel(this.state.currentLevel);
    }
}