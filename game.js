// Соответствие оборудования и слотов
const correctPairs = {
    "equipment1.png": 1,
    "equipment2.png": 2,
    "equipment3.png": 3,
    "equipment4.png": 4,
    "equipment5.png": 5,
    "equipment6.png": 6,
    "equipment7.png": 7,
    "equipment8.png": 8,
    "equipment9.png": 9,
    "equipment10.png": 10,
    "equipment11.png": 11,
    "equipment12.png": 12,
    "equipment13.png": 13,
    "equipment14.png": 14,
    "equipment15.png": 15,
    "equipment16.png": 16,
    "equipment17.png": 17,
    "equipment18.png": 18
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

// Переменные для touch-событий
let touchStartX, touchStartY;
let draggedElement = null;

// Инициализация игры
function initGame() {
    // Настройка перетаскивания для десктопа
    equipmentElements.forEach(equipment => {
        equipment.addEventListener('dragstart', dragStart);
    });

    slots.forEach(slot => {
        slot.addEventListener('dragover', dragOver);
        slot.addEventListener('drop', drop);
    });

    // Настройка touch-событий для мобильных
    equipmentElements.forEach(equipment => {
        equipment.addEventListener('touchstart', handleTouchStart);
        equipment.addEventListener('touchmove', handleTouchMove);
        equipment.addEventListener('touchend', handleTouchEnd);
    });

    slots.forEach(slot => {
        slot.addEventListener('touchend', handleTouchDrop);
        slot.addEventListener('touchmove', preventTouchScroll);
    });

    // Запуск таймера
    startTimer();
}

// Обработчики для десктопа
let draggedEquipment = null;

function dragStart(e) {
    draggedEquipment = e.target;
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    if (!gameActive || !draggedEquipment) return;
    
    const slot = e.currentTarget;
    const slotId = parseInt(slot.dataset.slotId);
    const correctSlotId = parseInt(draggedEquipment.dataset.correctSlot);
    
    checkEquipmentPlacement(slot, slotId, correctSlotId, draggedEquipment);
    draggedEquipment = null;
}

// Обработчики для touch-событий
function handleTouchStart(e) {
    if (!gameActive) return;
    
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    draggedElement = e.currentTarget;
    
    // Позиционируем элемент
    draggedElement.style.position = 'absolute';
    draggedElement.style.zIndex = '1000';
    moveElement(draggedElement, touch.clientX, touch.clientY);
    draggedElement.classList.add('dragging');
    
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!draggedElement) return;
    
    const touch = e.touches[0];
    moveElement(draggedElement, touch.clientX, touch.clientY);
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (!draggedElement) return;
    
    // Возвращаем в исходное положение, если не было переноса на слот
    setTimeout(() => {
        if (draggedElement.parentElement.id === 'equipment-container') {
            resetElementPosition(draggedElement);
        }
        draggedElement.classList.remove('dragging');
        draggedElement = null;
    }, 100);
    
    e.preventDefault();
}

function handleTouchDrop(e) {
    if (!draggedElement || !gameActive) return;
    
    const slot = e.currentTarget;
    const slotId = parseInt(slot.dataset.slotId);
    const correctSlotId = parseInt(draggedElement.dataset.correctSlot);
    
    // Проверяем расстояние для определения "попадания" в слот
    const rect = slot.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Координаты элемента
    const elemX = parseInt(draggedElement.style.left) + draggedElement.offsetWidth / 2;
    const elemY = parseInt(draggedElement.style.top) + draggedElement.offsetHeight / 2;
    
    // Проверяем расстояние до центра слота
    const dx = Math.abs(elemX - centerX);
    const dy = Math.abs(elemY - centerY);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 100) { // Пороговое значение
        checkEquipmentPlacement(slot, slotId, correctSlotId, draggedElement);
    } else {
        resetElementPosition(draggedElement);
    }
    
    draggedElement.classList.remove('dragging');
    draggedElement = null;
    e.preventDefault();
}

function preventTouchScroll(e) {
    if (draggedElement) {
        e.preventDefault();
    }
}

function moveElement(element, x, y) {
    element.style.left = (x - element.offsetWidth / 2) + 'px';
    element.style.top = (y - element.offsetHeight / 2) + 'px';
}

function resetElementPosition(element) {
    element.style.position = '';
    element.style.zIndex = '';
    element.style.left = '';
    element.style.top = '';
}

// Общая функция проверки размещения
function checkEquipmentPlacement(slot, slotId, correctSlotId, equipment) {
    if (slotId === correctSlotId) {
        // Правильное размещение
        successSound.play();
        showResultMessage('Правильно!', 'correct');
        
        // Размещаем оборудование в слоте
        slot.innerHTML = '';
        const equipmentClone = equipment.cloneNode();
        equipmentClone.style.width = '100%';
        equipmentClone.style.height = '100%';
        equipmentClone.draggable = false;
        slot.appendChild(equipmentClone);
        
        // Делаем оригинальное оборудование неактивным
        equipment.style.visibility = 'hidden';
        resetElementPosition(equipment);
        
        // Проверяем завершение игры
        correctCount++;
        if (correctCount === totalEquipment) {
            endGame(true);
        }
    } else {
        // Неправильное размещение
        errorSound.play();
        showResultMessage('Неверно!', 'error');
        resetElementPosition(equipment);
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