document.addEventListener('DOMContentLoaded', () => {
    // Элементы игры
    const equipmentElements = document.querySelectorAll('.equipment');
    const slotElements = document.querySelectorAll('.slot');
    const successSound = document.getElementById('success-sound');
    const errorSound = document.getElementById('error-sound');
    
    // Переменные состояния
    let draggedItem = null;
    let touchStartX = 0;
    let touchStartY = 0;
    
    // Инициализация перетаскивания
    const initDragAndDrop = () => {
        // Для десктопов
        equipmentElements.forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
        });
        
        slotElements.forEach(slot => {
            slot.addEventListener('dragover', handleDragOver);
            slot.addEventListener('drop', handleDrop);
            slot.addEventListener('dragleave', handleDragLeave);
        });
        
        // Для мобильных устройств
        equipmentElements.forEach(item => {
            item.addEventListener('touchstart', handleTouchStart, { passive: false });
        });
        
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    };
    
    // Обработчики событий
    const handleDragStart = (e) => {
        draggedItem = e.target;
        e.dataTransfer.setData('text/plain', e.target.dataset.equipmentType);
        e.target.classList.add('dragging');
    };
    
    const handleTouchStart = (e) => {
        draggedItem = e.target;
        touchStartX = e.touches[0].clientX - draggedItem.getBoundingClientRect().left;
        touchStartY = e.touches[0].clientY - draggedItem.getBoundingClientRect().top;
        draggedItem.classList.add('dragging');
        updatePosition(e.touches[0]);
        e.preventDefault();
    };
    
    const handleTouchMove = (e) => {
        if (!draggedItem) return;
        updatePosition(e.touches[0]);
        highlightSlots(e.touches[0]);
        e.preventDefault();
    };
    
    const handleTouchEnd = (e) => {
        if (!draggedItem) return;
        
        const touch = e.changedTouches[0];
        const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetSlot = elementUnder?.closest('.slot');
        
        if (targetSlot) {
            checkPlacement(targetSlot, draggedItem);
        }
        
        resetDraggedItem();
        resetSlotsHighlight();
        e.preventDefault();
    };
    
    const handleDragOver = (e) => {
        e.preventDefault();
        e.target.classList.add('active');
    };
    
    const handleDrop = (e) => {
        e.preventDefault();
        const equipmentType = e.dataTransfer.getData('text/plain');
        const equipment = document.querySelector(`[data-equipment-type="${equipmentType}"]`);
        checkPlacement(e.target, equipment);
        e.target.classList.remove('active');
    };
    
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.target.classList.remove('active');
    };
    
    // Вспомогательные функции
    const updatePosition = (touch) => {
        draggedItem.style.position = 'fixed';
        draggedItem.style.zIndex = '1000';
        draggedItem.style.left = (touch.clientX - touchStartX) + 'px';
        draggedItem.style.top = (touch.clientY - touchStartY) + 'px';
    };
    
    const highlightSlots = (touch) => {
        slotElements.forEach(slot => {
            const rect = slot.getBoundingClientRect();
            if (
                touch.clientX >= rect.left &&
                touch.clientX <= rect.right &&
                touch.clientY >= rect.top &&
                touch.clientY <= rect.bottom
            ) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        });
    };
    
    const checkPlacement = (slot, equipment) => {
        const isCorrect = slot.dataset.slotType === equipment.dataset.equipmentType;
        
        if (isCorrect) {
            // Правильное размещение
            slot.innerHTML = '';
            const img = equipment.querySelector('img').cloneNode(true);
            slot.appendChild(img);
            successSound.play();
            
            // Проверка победы
            if (Array.from(slotElements).every(slot => slot.children.length > 1)) {
                document.querySelector('.hint').textContent = 'Победа! Все оборудование установлено!';
            }
        } else {
            // Неправильное размещение
            slot.classList.add('error');
            errorSound.play();
            setTimeout(() => slot.classList.remove('error'), 500);
        }
    };
    
    const resetDraggedItem = () => {
        if (!draggedItem) return;
        draggedItem.style.position = '';
        draggedItem.style.zIndex = '';
        draggedItem.style.left = '';
        draggedItem.style.top = '';
        draggedItem.classList.remove('dragging');
        draggedItem = null;
    };
    
    const resetSlotsHighlight = () => {
        slotElements.forEach(slot => slot.classList.remove('active'));
    };
    
    // Запуск игры
    initDragAndDrop();
});