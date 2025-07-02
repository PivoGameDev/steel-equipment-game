// Конфигурация игры
const config = {
    totalTime: 120,
    slots: {
        // Координаты и размеры слотов (x%, y%, width, height)
        1: { x: 15, y: 20, width: 200, height: 200 },
        3: { x: 40, y: 20, width: 200, height: 200 },
        6: { x: 15, y: 50, width: 200, height: 200 },
        8: { x: 40, y: 50, width: 200, height: 200 },
        13: { x: 65, y: 35, width: 200, height: 200 }
    },
    equipment: [
        { id: 1, name: "fermenter", image: "assets/images/equipment1.png", correctSlot: 1, hint: "Ферментер - для брожения сусла" },
        { id: 2, name: "bright_tank", image: "assets/images/equipment2.png", correctSlot: 3, hint: "Брайт-танк - для дображивания и хранения пива" },
        { id: 3, name: "heat_exchanger", image: "assets/images/equipment3.png", correctSlot: 6, hint: "Теплообменник - для охлаждения сусла" },
        { id: 4, name: "filter", image: "assets/images/equipment4.png", correctSlot: 8, hint: "Фильтр - для очистки пива" }
    ],
    sounds: {
        success: "assets/sounds/success.mp3",
        error: "assets/sounds/error.mp3"
    }
};

// Элементы интерфейса
const elements = {
    timer: document.getElementById('timer'),
    hintArea: document.getElementById('hint-area'),
    resultMessage: document.getElementById('result-message'),
    gameField: document.getElementById('game-field'),
    equipmentContainer: document.getElementById('equipment-container'),
    defaultMessage: document.getElementById('default-message')
};

// Состояние игры
const state = {
    timeLeft: config.totalTime,
    gameActive: false,
    draggedItem: null,
    timerInterval: null,
    audio: {
        success: new Audio(config.sounds.success),
        error: new Audio(config.sounds.error)
    }
};

// Инициализация игры при загрузке страницы
window.addEventListener('DOMContentLoaded', initGame);

function initGame() {
    // Установка фона
    elements.gameField.style.backgroundImage = "url('assets/images/background.jpg')";
    
    // Создание слотов
    createSlots();
    
    // Создание оборудования
    createEquipment();
    
    // Запуск таймера
    startTimer();
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    state.gameActive = true;
}

function createSlots() {
    for (const [id, slotConfig] of Object.entries(config.slots)) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.dataset.slotId = id;
        
        // Позиционирование в процентах для адаптивности
        slot.style.left = `${slotConfig.x}%`;
        slot.style.top = `${slotConfig.y}%`;
        slot.style.width = `${slotConfig.width}px`;
        slot.style.height = `${slotConfig.height}px`;
        slot.style.transform = 'translate(-50%, -50%)';
        
        elements.gameField.appendChild(slot);
    }
}

function createEquipment() {
    elements.equipmentContainer.innerHTML = '';
    
    config.equipment.forEach(item => {
        const equipment = document.createElement('div');
        equipment.className = 'equipment';
        equipment.dataset.equipmentId = item.id;
        equipment.dataset.correctSlot = item.correctSlot;
        equipment.dataset.hint = item.hint;
        equipment.style.backgroundImage = `url('${item.image}')`;
        
        // Для десктопов
        equipment.draggable = true;
        
        elements.equipmentContainer.appendChild(equipment);
    });
}

function startTimer() {
    elements.timer.textContent = state.timeLeft;
    
    state.timerInterval = setInterval(() => {
        state.timeLeft--;
        elements.timer.textContent = state.timeLeft;
        
        if (state.timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function setupEventListeners() {
    // Для десктопов
    document.querySelectorAll('.equipment').forEach(el => {
        el.addEventListener('dragstart', handleDragStart);
    });

    document.querySelectorAll('.slot').forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
    });

    // Для мобильных устройств
    document.querySelectorAll('.equipment').forEach(el => {
        el.addEventListener('touchstart', handleTouchStart, { passive: false });
        el.addEventListener('touchmove', handleTouchMove, { passive: false });
        el.addEventListener('touchend', handleTouchEnd);
    });

    document.querySelectorAll('.slot').forEach(slot => {
        slot.addEventListener('touchend', handleTouchDrop);
    });
}

// Обработчики для десктопов
function handleDragStart(e) {
    if (!state.gameActive) return;
    state.draggedItem = e.target;
    e.target.classList.add('dragging');
    
    // Показываем подсказку
    showHint(e.target.dataset.hint);
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    if (!state.gameActive || !state.draggedItem) return;
    
    const slot = e.currentTarget;
    checkEquipmentPlacement(slot, state.draggedItem);
    state.draggedItem.classList.remove('dragging');
    state.draggedItem = null;
}

// Обработчики для мобильных
function handleTouchStart(e) {
    if (!state.gameActive) return;
    state.draggedItem = e.target;
    e.target.classList.add('dragging');
    e.preventDefault();
    
    // Показываем подсказку
    showHint(e.target.dataset.hint);
}

function handleTouchMove(e) {
    if (!state.draggedItem) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    state.draggedItem.style.position = 'absolute';
    state.draggedItem.style.left = `${touch.clientX - state.draggedItem.offsetWidth / 2}px`;
    state.draggedItem.style.top = `${touch.clientY - state.draggedItem.offsetHeight / 2}px`;
    state.draggedItem.style.zIndex = '1000';
}

function handleTouchEnd(e) {
    if (!state.draggedItem) return;
    
    // Если не перенесли на слот, возвращаем на место
    if (state.draggedItem.parentElement === elements.equipmentContainer) {
        resetEquipmentPosition(state.draggedItem);
    }
    
    state.draggedItem.classList.remove('dragging');
    state.draggedItem = null;
    e.preventDefault();
}

function handleTouchDrop(e) {
    if (!state.gameActive || !state.draggedItem) return;
    
    const slot = e.currentTarget;
    checkEquipmentPlacement(slot, state.draggedItem);
    state.draggedItem.classList.remove('dragging');
    state.draggedItem = null;
    e.preventDefault();
}

function resetEquipmentPosition(equipment) {
    equipment.style.position = '';
    equipment.style.left = '';
    equipment.style.top = '';
    equipment.style.zIndex = '';
}

function checkEquipmentPlacement(slot, equipment) {
    const slotId = parseInt(slot.dataset.slotId);
    const correctSlotId = parseInt(equipment.dataset.correctSlot);
    
    if (slotId === correctSlotId) {
        // Правильное размещение
        state.audio.success.play();
        showResult('Правильно!', true);
        
        // Помещаем оборудование в слот
        slot.innerHTML = '';
        const equipmentClone = equipment.cloneNode(true);
        equipmentClone.style.width = '100%';
        equipmentClone.style.height = '100%';
        equipmentClone.draggable = false;
        slot.appendChild(equipmentClone);
        
        // Делаем оригинальное оборудование невидимым
        equipment.style.opacity = '0';
        resetEquipmentPosition(equipment);
        
        // Проверяем завершение игры
        if (document.querySelectorAll('.equipment[style*="opacity: 0"]').length === config.equipment.length) {
            endGame(true);
        }
    } else {
        // Неправильное размещение
        state.audio.error.play();
        showResult('Неверно!', false);
        resetEquipmentPosition(equipment);
    }
}

function showResult(message, isSuccess) {
    elements.resultMessage.textContent = message;
    elements.resultMessage.className = isSuccess ? 'correct' : 'error';
    elements.resultMessage.classList.add('show');
    
    setTimeout(() => {
        elements.resultMessage.classList.remove('show');
    }, 3000);
}

function showHint(hintText) {
    elements.hintArea.textContent = hintText;
    elements.hintArea.style.display = 'block';
    
    setTimeout(() => {
        elements.hintArea.style.display = 'none';
    }, 3000);
}

function endGame(isWin) {
    state.gameActive = false;
    clearInterval(state.timerInterval);
    
    if (isWin) {
        showResult('Победа! Все оборудование установлено правильно!', true);
    } else {
        showResult('Время вышло! Попробуйте еще раз.', false);
    }
    
    // Блокируем оборудование
    document.querySelectorAll('.equipment').forEach(el => {
        el.draggable = false;
        el.style.pointerEvents = 'none';
    });
}