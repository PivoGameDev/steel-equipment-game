// Конфигурация игры
const config = {
    totalTime: 120,
    slots: {
        1: { x: 15, y: 20, width: 200, height: 200 },
        3: { x: 40, y: 20, width: 200, height: 200 },
        6: { x: 15, y: 50, width: 200, height: 200 },
        8: { x: 40, y: 50, width: 200, height: 200 },
        13: { x: 65, y: 35, width: 200, height: 200 }
    },
    equipment: [
        { 
            id: 1, 
            name: "fermenter", 
            image: "assets/images/equipment1.png", 
            correctSlot: 1, 
            shortHint: "Ферментер",
            fullHint: "Ферментер - для брожения сусла" 
        },
        { 
            id: 2, 
            name: "bright_tank", 
            image: "assets/images/equipment2.png", 
            correctSlot: 3, 
            shortHint: "Брайт-танк",
            fullHint: "Брайт-танк - для дображивания и хранения пива" 
        },
        { 
            id: 3, 
            name: "heat_exchanger", 
            image: "assets/images/equipment3.png", 
            correctSlot: 6, 
            shortHint: "Теплообменник",
            fullHint: "Теплообменник - для охлаждения сусла" 
        },
        { 
            id: 4, 
            name: "filter", 
            image: "assets/images/equipment4.png", 
            correctSlot: 8, 
            shortHint: "Фильтр",
            fullHint: "Фильтр - для очистки пива" 
        }
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

// Инициализация игры
window.addEventListener('DOMContentLoaded', initGame);

function initGame() {
    elements.gameField.style.backgroundImage = "url('assets/images/background.jpg')";
    createSlots();
    createEquipment();
    startTimer();
    setupEventListeners();
    state.gameActive = true;
}

function createSlots() {
    for (const [id, slotConfig] of Object.entries(config.slots)) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.dataset.slotId = id;
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
        equipment.dataset.shortHint = item.shortHint;
        equipment.dataset.fullHint = item.fullHint;
        equipment.style.backgroundImage = `url('${item.image}')`;
        equipment.draggable = true;
        elements.equipmentContainer.appendChild(equipment);
    });
}

function startTimer() {
    elements.timer.textContent = state.timeLeft;
    state.timerInterval = setInterval(() => {
        state.timeLeft--;
        elements.timer.textContent = state.timeLeft;
        if (state.timeLeft <= 0) endGame(false);
    }, 1000);
}

function setupEventListeners() {
    document.querySelectorAll('.equipment').forEach(el => {
        el.addEventListener('dragstart', handleDragStart);
        el.addEventListener('touchstart', handleTouchStart, { passive: false });
    });

    document.querySelectorAll('.slot').forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
        slot.addEventListener('touchend', handleTouchDrop);
    });
}

// Обработчики событий
function handleDragStart(e) {
    if (!state.gameActive) return;
    state.draggedItem = e.target;
    e.target.classList.add('dragging');
    showHint(e.target, false);
    e.dataTransfer.setData('text/plain', e.target.dataset.equipmentId);
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

function handleTouchStart(e) {
    if (!state.gameActive) return;
    state.draggedItem = e.target;
    e.target.classList.add('dragging');
    showHint(e.target, false);
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

function checkEquipmentPlacement(slot, equipment) {
    const slotId = parseInt(slot.dataset.slotId);
    const correctSlotId = parseInt(equipment.dataset.correctSlot);
    
    if (slotId === correctSlotId) {
        state.audio.success.play();
        showResult('Правильно!', true);
        showHint(equipment, true);
        
        slot.innerHTML = '';
        const equipmentClone = equipment.cloneNode(true);
        equipmentClone.style.width = '100%';
        equipmentClone.style.height = '100%';
        equipmentClone.draggable = false;
        slot.appendChild(equipmentClone);
        
        equipment.style.opacity = '0';
        equipment.style.position = '';
        equipment.style.left = '';
        equipment.style.top = '';
        
        if (document.querySelectorAll('.equipment[style*="opacity: 0"]').length === config.equipment.length) {
            endGame(true);
        }
    } else {
        state.audio.error.play();
        showResult('Неверно!', false);
        equipment.style.position = '';
        equipment.style.left = '';
        equipment.style.top = '';
    }
}

function showHint(equipmentElement, isFullHint) {
    const hintText = isFullHint 
        ? equipmentElement.dataset.fullHint 
        : equipmentElement.dataset.shortHint;
    
    elements.hintArea.textContent = hintText;
    elements.hintArea.style.display = 'block';
    
    if (!isFullHint) {
        setTimeout(() => {
            if (elements.hintArea.textContent === hintText) {
                elements.hintArea.style.display = 'none';
            }
        }, 2000);
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

function endGame(isWin) {
    state.gameActive = false;
    clearInterval(state.timerInterval);
    showResult(isWin ? 'Победа! Все оборудование установлено!' : 'Время вышло!', isWin);
    document.querySelectorAll('.equipment').forEach(el => {
        el.draggable = false;
        el.style.pointerEvents = 'none';
    });
}