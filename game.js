document.addEventListener('DOMContentLoaded', () => {
    // Определение типа устройства
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
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
    const equipmentBtns = document.querySelectorAll('.equipment-btn');
    
    // Игровые переменные
    let timeLeft = 120;
    let timer;
    let gameStarted = false;
    let equipmentPlaced = 0;
    let startTime;
    let selectedEquipment = null;

    // Инициализация игры
    function initGame() {
        timeLeft = 120;
        equipmentPlaced = 0;
        gameStarted = true;
        startTime = Date.now();
        selectedEquipment = null;
        
        timerDisplay.textContent = formatTime(timeLeft);
        timerDisplay.classList.remove('low-time');
        feedbackMessage.textContent = '';
        feedbackMessage.className = 'feedback-message';
        launchBtn.disabled = true;
        
        slots.forEach(slot => {
            slot.innerHTML = '';
            slot.dataset.filled = 'false';
        });
        
        equipmentBtns.forEach(btn => {
            btn.style.display = 'flex';
            btn.style.opacity = '1';
        });
        
        clearInterval(timer);
        timer = setInterval(updateTimer, 1000);
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

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

    function endGame(isWin) {
        clearInterval(timer);
        gameStarted = false;
        gameScreen.classList.add('hidden');
        
        if (isWin) {
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            timeSpentDisplay.textContent = formatTime(timeSpent);
            winScreen.classList.remove('hidden');
            createConfetti();
        } else {
            loseScreen.classList.remove('hidden');
        }
    }

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

    function placeEquipment(slot, equipmentId) {
        if (slot.dataset.filled === 'true') return;
        
        const equipmentImg = document.createElement('img');
        equipmentImg.src = `assets/images/${equipmentId}.png`;
        equipmentImg.className = 'equipment-placed';
        
        slot.innerHTML = '';
        slot.appendChild(equipmentImg);
        slot.dataset.filled = 'true';
        slot.dataset.equipment = equipmentId;
        
        document.querySelector(`.equipment-btn[data-equipment="${equipmentId}"]`).style.display = 'none';
        
        equipmentPlaced++;
        if (equipmentPlaced === 2) {
            launchBtn.disabled = false;
            feedbackMessage.textContent = 'Все оборудование размещено!';
            feedbackMessage.classList.add('correct');
        }
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

    // Система для мобильных (тапы)
    if (isMobile) {
        equipmentBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.style.display === 'none') return;
                
                selectedEquipment = btn.dataset.equipment;
                equipmentBtns.forEach(b => {
                    b.style.opacity = b === btn ? '1' : '0.5';
                });
                
                feedbackMessage.textContent = `Выбрано: ${btn.querySelector('p').textContent}`;
                feedbackMessage.className = 'feedback-message';
            });
        });

        slots.forEach(slot => {
            slot.addEventListener('click', () => {
                if (!selectedEquipment || slot.dataset.filled === 'true') return;
                placeEquipment(slot, selectedEquipment);
                
                selectedEquipment = null;
                equipmentBtns.forEach(b => {
                    b.style.opacity = '1';
                });
            });
        });
    } 
    // Система для ПК (drag-and-drop)
    else {
        equipmentBtns.forEach(btn => {
            btn.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.equipment);
            });
        });

        slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                const equipmentId = e.dataTransfer.getData('text/plain');
                placeEquipment(slot, equipmentId);
            });
        });
    }

    // Кнопка запуска завода
    launchBtn.addEventListener('click', () => {
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