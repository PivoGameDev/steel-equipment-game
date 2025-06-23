// Соответствие оборудования и слотов
const correctPairs = {
    "equipment1.png": 3,
    "equipment2.png": 12,
    // Добавьте соответствия для остального оборудования
};

// Элементы интерфейса
const timerElement = document.getElementById('timer');
const defaultMessage = document.getElementById('default-message');
const resultMessage = document.getElementById('result-message');
const slots = document.querySelectorAll('.slot');
const equipmentElements = document.querySelectorAll('.equipment');

// Звуковые эффекты
const successSound = new Audio('assets/sounds/success.mp3');
const errorSound = new Audio('assets/sounds/error.mp3');

// Переменные игры
let timeLeft = 120;
let gameActive = true;
let timerInterval;
let correctCount = 0;
const totalEquipment = 18;

// Инициализация игры
function initGame() {
    // Настройка перетаскивания
    equipmentElements.forEach(equipment => {
        equipment.addEventListener('dragstart', dragStart);
    });

    slots.forEach(slot => {
        slot.addEventListener('dragover', dragOver);
        slot.addEventListener('drop', drop);
    });

    // Запуск таймера
    startTimer();
}

// Обработчики перетаскивания
let draggedEquipment = null;

function dragStart(e) {
    draggedEquipment = e.target;
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    if (!gameActive) return;
    
    const slot = e.currentTarget;
    const slotId = parseInt(slot.dataset.slotId);
    const correctSlotId = parseInt(draggedEquipment.dataset.correctSlot);
    
    if (slotId === correctSlotId) {
        // Правильное размещение
        successSound.play();
        showResultMessage('Правильно!', 'correct');
        
        // Размещаем оборудование в слоте
        slot.innerHTML = '';
        const equipmentClone = draggedEquipment.cloneNode();
        equipmentClone.style.width = '100%';
        equipmentClone.style.height = '100%';
        equipmentClone.draggable = false;
        slot.appendChild(equipmentClone);
        
        // Делаем оборудование неактивным
        draggedEquipment.style.visibility = 'hidden';
        
        // Проверяем завершение игры
        correctCount++;
        if (correctCount === totalEquipment) {
            endGame(true);
        }
    } else {
        // Неправильное размещение
        errorSound.play();
        showResultMessage('Неверно!', 'error');
    }
}

// Показать временное сообщение
function showResultMessage(text, className) {
    resultMessage.textContent = text;
    resultMessage.className = className;
    resultMessage.classList.remove('hidden');
    
    setTimeout(() => {
        resultMessage.classList.add('hidden');
    }, 3000);
}

// Таймер
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

// Завершение игры
function endGame(isWin) {
    gameActive = false;
    clearInterval(timerInterval);
    
    if (isWin) {
        showResultMessage('Победа! Все оборудование установлено', 'correct');
    } else {
        showResultMessage('Время вышло! Игра окончена', 'error');
    }
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', initGame);