document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const winScreen = document.getElementById('win-screen');
    const loseScreen = document.getElementById('lose-screen');
    const startBtn = document.getElementById('start-btn');
    const launchBtn = document.getElementById('launch-btn');
    const restartBtns = document.querySelectorAll('.restart-btn');
    const timerDisplay = document.querySelector('.timer');
    const feedbackMessage = document.querySelector('.feedback-message');
    const timeSpentDisplay = document.getElementById('time-spent');
    
    // Игровые элементы
    const slots = document.querySelectorAll('.slot');
    const equipmentElements = document.querySelectorAll('.equipment');
    
    // Аудио
    const successSound = new Audio('assets/sounds/success.mp3');
    const errorSound = new Audio('assets/sounds/error.mp3');
    
    // Игровые переменные
    let timeLeft = 120; // 2 минуты в секундах
    let timer;
    let gameStarted = false;
    let equipmentPlaced = 0;
    let startTime;
    
    // Инициализация игры
    function initGame() {
        // Сброс состояния
        timeLeft = 120;
        equipmentPlaced = 0;
        gameStarted = true;
        startTime = Date.now();
        
        // Сброс интерфейса
        timerDisplay.textContent = formatTime(timeLeft);
        timerDisplay.classList.remove('low-time');
        feedbackMessage.textContent = '';
        feedbackMessage.className = 'feedback-message';
        launchBtn.disabled = true;
        
        // Очистка слотов
        slots.forEach(slot => {
            slot.innerHTML = '';
            slot.dataset.filled = 'false';
        });
        
        // Возврат оборудования на панель
        equipmentElements.forEach(equipment => {
            equipment.style.display = 'block';
        });
        
        // Запуск таймера
        clearInterval(timer);
        timer = setInterval(updateTimer, 1000);
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
        
        if (isWin) {
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            timeSpentDisplay.textContent = formatTime(timeSpent);
            winScreen.classList.remove('hidden');
            successSound.play();
            createConfetti();
        } else {
            loseScreen.classList.remove('hidden');
            errorSound.play();
        }
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
        
        // Добавляем CSS анимацию
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
    
    // Обработчики событий
    startBtn.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        initGame();
    });
    
    restartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            winScreen.classList.add('hidden');
            loseScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            initGame();
        });
    });
    
    // Перетаскивание оборудования
    equipmentElements.forEach(equipment => {
        equipment.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id);
            e.target.classList.add('dragging');
        });
        
        equipment.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });
    });
    
    slots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            if (slot.dataset.filled === 'true') return;
            
            const equipmentId = e.dataTransfer.getData('text/plain');
            const equipment = document.getElementById(equipmentId);
            
            // Создаем копию для слота
            const equipmentCopy = equipment.cloneNode();
            equipmentCopy.style.display = 'block';
            equipmentCopy.style.width = '200px';
            equipmentCopy.style.height = '200px';
            equipmentCopy.style.cursor = 'default';
            slot.appendChild(equipmentCopy);
            
            // Помечаем слот как заполненный
            slot.dataset.filled = 'true';
            slot.dataset.equipment = equipmentId;
            
            // Проверяем, правильно ли размещено оборудование
            const isCorrect = equipmentId === slot.dataset.correct;
            
            // Визуальный feedback
            if (isCorrect) {
                slot.classList.add('highlight-correct');
            } else {
                slot.classList.add('highlight-incorrect');
            }
            
            // Убираем оригинальное оборудование с панели
            equipment.style.display = 'none';
            
            // Увеличиваем счетчик размещенного оборудования
            equipmentPlaced++;
            
            // Проверяем, все ли оборудование размещено
            if (equipmentPlaced === 2) {
                launchBtn.disabled = false;
            }
        });
    });
    
    // Кнопка запуска завода
    launchBtn.addEventListener('click', () => {
        // Проверяем правильность размещения
        const slot1Correct = document.getElementById('slot1').dataset.equipment === 'fermenter';
        const slot2Correct = document.getElementById('slot2').dataset.equipment === 'heat-exchanger';
        
        if (slot1Correct && slot2Correct) {
            feedbackMessage.textContent = 'Правильно! Завод запущен!';
            feedbackMessage.classList.add('correct');
            setTimeout(() => endGame(true), 1500);
        } else {
            feedbackMessage.textContent = 'Неверно! Завод не может работать!';
            feedbackMessage.classList.add('incorrect');
            setTimeout(() => endGame(false), 1500);
        }
    });
});