document.addEventListener('DOMContentLoaded', function() {
    // Элементы игры
    const elements = {
        timer: document.getElementById('timer'),
        hint: document.getElementById('hint'),
        equipment: document.querySelectorAll('.equipment'),
        slots: document.querySelectorAll('.slot'),
        sounds: {
            success: document.getElementById('success-sound'),
            error: document.getElementById('error-sound')
        }
    };

    // Состояние игры
    let draggedItem = null;
    let timeLeft = 120;
    let touchOffset = { x: 0, y: 0 };

    // Инициализация
    function init() {
        setupEventListeners();
        startTimer();
        highlightSlots();
    }

    // Подсветка слотов
    function highlightSlots() {
        elements.slots.forEach(slot => {
            slot.classList.add('highlight');
        });
    }

    // Настройка обработчиков
    function setupEventListeners() {
        // Для оборудования (десктоп)
        elements.equipment.forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
        });

        // Для слотов (десктоп)
        elements.slots.forEach(slot => {
            slot.addEventListener('dragover', handleDragOver);
            slot.addEventListener('drop', handleDrop);
        });

        // Для мобильных устройств
        setupTouchEvents();
    }

    // Настройка touch-событий
    function setupTouchEvents() {
        elements.equipment.forEach(item => {
            item.addEventListener('touchstart', handleTouchStart, { passive: false });
        });

        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    }

    // Обработчики событий
    function handleDragStart(e) {
        draggedItem = e.target;
        e.dataTransfer.setData('text/plain', e.target.id);
        showHint(`Переместите ${getEquipmentName(e.target)}`);
    }

    function handleTouchStart(e) {
        const touch = e.touches[0];
        draggedItem = e.target;
        touchOffset.x = touch.clientX - draggedItem.getBoundingClientRect().left;
        touchOffset.y = touch.clientY - draggedItem.getBoundingClientRect().top;
        
        draggedItem.style.position = 'fixed';
        draggedItem.style.zIndex = '1000';
        updatePosition(touch.clientX, touch.clientY);
        
        showHint(`Переместите ${getEquipmentName(e.target)}`);
        e.preventDefault();
    }

    function handleTouchMove(e) {
        if (!draggedItem) return;
        const touch = e.touches[0];
        updatePosition(touch.clientX, touch.clientY);
        e.preventDefault();
    }

    function handleTouchEnd(e) {
        if (!draggedItem) return;
        
        const touch = e.changedTouches[0];
        const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
        const slot = elementAtPoint?.closest('.slot');
        
        if (slot) {
            checkPlacement(slot, draggedItem);
        }
        
        resetPosition();
        e.preventDefault();
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDrop(e) {
        e.preventDefault();
        if (!draggedItem) return;
        
        const equipmentId = e.dataTransfer.getData('text/plain');
        const equipment = document.getElementById(equipmentId);
        checkPlacement(e.currentTarget, equipment);
    }

    // Обновление позиции при перетаскивании
    function updatePosition(x, y) {
        draggedItem.style.left = (x - touchOffset.x) + 'px';
        draggedItem.style.top = (y - touchOffset.y) + 'px';
    }

    // Сброс позиции
    function resetPosition() {
        if (!draggedItem) return;
        
        draggedItem.style.position = '';
        draggedItem.style.zIndex = '';
        draggedItem.style.left = '';
        draggedItem.style.top = '';
        draggedItem = null;
    }

    // Проверка размещения
    function checkPlacement(slot, equipment) {
        const isCorrect = slot.dataset.slot === equipment.dataset.type;
        
        if (isCorrect) {
            // Правильное размещение
            slot.innerHTML = '';
            const img = equipment.querySelector('img').cloneNode();
            slot.appendChild(img);
            equipment.style.visibility = 'hidden';
            elements.sounds.success.play();
            showHint('Правильно! ' + getEquipmentName(equipment));
            
            // Проверка победы
            if (Array.from(elements.equipment).every(e => e.style.visibility === 'hidden')) {
                endGame(true);
            }
        } else {
            // Неправильное размещение
            elements.sounds.error.play();
            showHint('Неверно! Попробуйте ещё раз');
        }
    }

    // Показать подсказку
    function showHint(text) {
        elements.hint.textContent = text;
    }

    // Получить название оборудования
    function getEquipmentName(element) {
        return element.id === 'fermenter' ? 'ферментер' : 'теплообменник';
    }

    // Таймер
    function startTimer() {
        const timer = setInterval(() => {
            timeLeft--;
            elements.timer.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                endGame(false);
            }
        }, 1000);
    }

    // Завершение игры
    function endGame(isWin) {
        showHint(isWin ? 'Победа! Все оборудование установлено!' : 'Время вышло!');
    }

    // Запуск игры
    init();
});