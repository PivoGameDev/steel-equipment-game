// Элементы игры
const elements = {
    timer: document.getElementById('timer'),
    hint: document.getElementById('hint'),
    equipment: document.querySelectorAll('.equipment'),
    slots: document.querySelectorAll('.slot')
};

// Состояние игры
const state = {
    timeLeft: 120,
    draggedItem: null,
    timerInterval: null
};

// Инициализация игры
function initGame() {
    startTimer();
    setupEventListeners();
}

// Таймер
function startTimer() {
    state.timerInterval = setInterval(() => {
        state.timeLeft--;
        elements.timer.textContent = state.timeLeft;
        
        if (state.timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

// Обработчики событий
function setupEventListeners() {
    // Для десктопа
    elements.equipment.forEach(el => {
        el.addEventListener('dragstart', handleDragStart);
    });

    elements.slots.forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
    });

    // Для мобильных
    elements.equipment.forEach(el => {
        el.addEventListener('touchstart', handleTouchStart);
        el.addEventListener('touchend', handleTouchEnd);
    });

    elements.slots.forEach(slot => {
        slot.addEventListener('touchend', handleTouchDrop);
    });
}

// Обработчики для десктопа
function handleDragStart(e) {
    state.draggedItem = e.target;
    elements.hint.textContent = e.target.dataset.hint;
    setTimeout(() => e.target.classList.add('dragging'), 0);
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    if (!state.draggedItem) return;
    
    const slot = e.currentTarget;
    if (slot.id === state.draggedItem.dataset.target) {
        placeEquipment(slot, state.draggedItem);
    }
    
    state.draggedItem.classList.remove('dragging');
    state.draggedItem = null;
}

// Обработчики для мобильных
function handleTouchStart(e) {
    state.draggedItem = e.target;
    elements.hint.textContent = e.target.dataset.hint;
    e.target.classList.add('dragging');
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (state.draggedItem) {
        state.draggedItem.classList.remove('dragging');
        state.draggedItem = null;
    }
}

function handleTouchDrop(e) {
    if (!state.draggedItem) return;
    
    const slot = e.currentTarget;
    if (slot.id === state.draggedItem.dataset.target) {
        placeEquipment(slot, state.draggedItem);
    }
    
    state.draggedItem.classList.remove('dragging');
    state.draggedItem = null;
    e.preventDefault();
}

// Размещение оборудования
function placeEquipment(slot, equipment) {
    slot.innerHTML = '';
    slot.classList.add('correct');
    
    const equipmentClone = equipment.cloneNode();
    equipmentClone.style.width = '100%';
    equipmentClone.style.height = '100%';
    equipmentClone.draggable = false;
    slot.appendChild(equipmentClone);
    
    equipment.style.display = 'none';
    elements.hint.textContent = 'Правильно! ' + equipment.dataset.hint;
    
    checkWin();
}

// Проверка победы
function checkWin() {
    const allCorrect = Array.from(elements.slots).every(slot => slot.classList.contains('correct'));
    if (allCorrect) {
        endGame(true);
    }
}

// Завершение игры
function endGame(isWin) {
    clearInterval(state.timerInterval);
    elements.hint.textContent = isWin ? 'Поздравляем! Вы выиграли!' : 'Время вышло! Попробуйте снова.';
}

// Запуск игры
window.addEventListener('DOMContentLoaded', initGame);