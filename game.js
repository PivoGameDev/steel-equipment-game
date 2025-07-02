document.addEventListener('DOMContentLoaded', function() {
    // Состояние игры
    let draggedItem = null;
    let touchOffset = { x: 0, y: 0 };
    let activeSlot = null;

    // Инициализация
    function init() {
        setupEventListeners();
        highlightSlots();
    }

    // Подсветка слотов
    function highlightSlots() {
        document.querySelectorAll('.slot').forEach(slot => {
            slot.classList.add('highlight');
        });
    }

    // Настройка обработчиков
    function setupEventListeners() {
        // Для оборудования
        document.querySelectorAll('.equipment').forEach(item => {
            item.addEventListener('touchstart', handleTouchStart, { passive: false });
        });

        // Для слотов
        document.querySelectorAll('.slot').forEach(slot => {
            slot.addEventListener('touchmove', handleTouchMove, { passive: false });
            slot.addEventListener('touchend', handleTouchEnd);
        });
    }

    // Обработчики событий
    function handleTouchStart(e) {
        const touch = e.touches[0];
        draggedItem = e.target;
        touchOffset = {
            x: touch.clientX - draggedItem.getBoundingClientRect().left,
            y: touch.clientY - draggedItem.getBoundingClientRect().top
        };
        
        draggedItem.style.position = 'fixed';
        draggedItem.style.zIndex = '1000';
        updatePosition(touch.clientX, touch.clientY);
        e.preventDefault();
    }

    function handleTouchMove(e) {
        if (!draggedItem) return;
        
        const touch = e.touches[0];
        updatePosition(touch.clientX, touch.clientY);
        
        // Проверяем, над каким слотом находимся
        activeSlot = null;
        document.querySelectorAll('.slot').forEach(slot => {
            const rect = slot.getBoundingClientRect();
            if (
                touch.clientX >= rect.left && 
                touch.clientX <= rect.right &&
                touch.clientY >= rect.top && 
                touch.clientY <= rect.bottom
            ) {
                activeSlot = slot;
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        });
        
        e.preventDefault();
    }

    function handleTouchEnd(e) {
        if (!draggedItem) return;
        
        if (activeSlot) {
            checkPlacement(activeSlot, draggedItem);
        }
        
        resetPosition();
        document.querySelectorAll('.slot').forEach(slot => {
            slot.classList.remove('active');
        });
    }

    // Обновление позиции
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
        activeSlot = null;
    }

    // Проверка размещения
    function checkPlacement(slot, equipment) {
        const isCorrect = slot.dataset.slot === equipment.dataset.type;
        
        if (isCorrect) {
            // Правильное размещение
            slot.innerHTML = '';
            const img = equipment.querySelector('img').cloneNode();
            slot.appendChild(img);
            equipment.style.display = 'none';
            document.getElementById('success-sound').play();
            
            // Проверка победы
            if (Array.from(document.querySelectorAll('.equipment')).every(e => e.style.display === 'none')) {
                endGame(true);
            }
        } else {
            // Неправильное размещение
            document.getElementById('error-sound').play();
            slot.classList.add('error');
            setTimeout(() => slot.classList.remove('error'), 500);
        }
    }

    // Завершение игры
    function endGame(isWin) {
        document.getElementById('hint').textContent = isWin ? 
            'Победа! Все оборудование установлено!' : 
            'Время вышло!';
    }

    // Запуск игры
    init();
});