document.addEventListener('DOMContentLoaded', function() {
    // Элементы игры
    const elements = {
        timer: document.getElementById('timer'),
        hint: document.getElementById('hint'),
        resultMessage: document.getElementById('result-message'),
        equipment: document.querySelectorAll('.equipment'),
        slots: document.querySelectorAll('.slot'),
        successSound: document.getElementById('success-sound'),
        errorSound: document.getElementById('error-sound')
    };

    // Состояние игры
    const state = {
        timeLeft: 120,
        draggedItem: null,
        timerInterval: null,
        hintTimeout: null
    };

    // Инициализация игры
    function initGame() {
        setupEventListeners();
        startTimer();
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
        // Для оборудования
        elements.equipment.forEach(el => {
            // Десктоп
            el.addEventListener('dragstart', handleDragStart);
            
            // Мобильные
            el.addEventListener('touchstart', handleTouchStart, { passive: false });
            el.addEventListener('touchend', handleTouchEnd);
        });

        // Для слотов
        elements.slots.forEach(slot => {
            // Десктоп
            slot.addEventListener('dragover', handleDragOver);
            slot.addEventListener('drop', handleDrop);
            
            // Мобильные
            slot.addEventListener('touchend', handleTouchDrop);
        });
    }

    // Обработка начала перетаскивания
    function handleDragStart(e) {
        state.draggedItem = e.target;
        showHint(e.target.dataset.hint);
        e.dataTransfer.setData('text/plain', e.target.id);
    }

    function handleTouchStart(e) {
        state.draggedItem = e.target;
        showHint(e.target.dataset.hint);
        e.preventDefault(); // Предотвращаем скролл
    }

    // Показ подсказки
    function showHint(text) {
        clearTimeout(state.hintTimeout);
        elements.hint.textContent = text;
        
        // Для мобильных - подсказка остается пока держим палец
        if (!('ontouchstart' in window)) {
            state.hintTimeout = setTimeout(() => {
                elements.hint.textContent = "Перетащите оборудование в нужный слот";
            }, 2000);
        }
    }

    // Обработка завершения перетаскивания
    function handleTouchEnd() {
        if (!state.draggedItem) return;
        elements.hint.textContent = "Перетащите оборудование в нужный слот";
    }

    // Разрешение сброса
    function handleDragOver(e) {
        e.preventDefault();
    }

    // Сброс оборудования
    function handleDrop(e) {
        e.preventDefault();
        if (!state.draggedItem) return;
        
        const slot = e.currentTarget;
        checkPlacement(slot, state.draggedItem);
        state.draggedItem = null;
    }

    function handleTouchDrop(e) {
        e.preventDefault();
        if (!state.draggedItem) return;
        
        const slot = e.currentTarget;
        checkPlacement(slot, state.draggedItem);
        state.draggedItem = null;
    }

    // Проверка правильности установки
    function checkPlacement(slot, equipment) {
        const isCorrect = slot.id === equipment.dataset.target;
        
        if (isCorrect) {
            // Правильная установка
            placeEquipment(slot, equipment);
            playSound('success');
            showResult('Правильно!', true);
            elements.hint.textContent = equipment.dataset.hint;
        } else {
            // Неправильная установка
            playSound('error');
            showResult('Неверно!', false);
        }
    }

    // Размещение оборудования
    function placeEquipment(slot, equipment) {
        slot.innerHTML = '';
        const img = equipment.querySelector('img').cloneNode();
        slot.appendChild(img);
        slot.classList.add('correct');
        equipment.style.visibility = 'hidden';
        
        checkWin();
    }

    // Проверка победы
    function checkWin() {
        const allCorrect = Array.from(elements.slots).every(slot => 
            slot.classList.contains('correct'));
        
        if (allCorrect) {
            endGame(true);
        }
    }

    // Воспроизведение звука
    function playSound(type) {
        const sound = elements[`${type}Sound`];
        sound.currentTime = 0;
        sound.play();
    }

    // Показ результата
    function showResult(message, isSuccess) {
        elements.resultMessage.textContent = message;
        elements.resultMessage.className = isSuccess ? 'correct show' : 'error show';
        
        setTimeout(() => {
            elements.resultMessage.className = '';
        }, 3000);
    }

    // Завершение игры
    function endGame(isWin) {
        clearInterval(state.timerInterval);
        showResult(isWin ? 'Победа! Все оборудование установлено!' : 'Время вышло!', isWin);
    }

    // Запуск игры
    initGame();
});