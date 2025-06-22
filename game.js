// Конфигурация игры с адаптацией под мобильные устройства
const isMobile = window.innerWidth < 768;

const config = {
    type: Phaser.AUTO,
    width: isMobile ? Math.min(window.innerWidth, 900) : 780,
    height: isMobile ? Math.min(window.innerHeight * 0.85, 600) : 600,
    parent: 'game',
    backgroundColor: '#0a1929',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

// Глобальные переменные
let timerText, taskText, successText, errorText;
let timerEvent;
let timeLeft = 90;
let breweryParts = [];
let draggedItem = null;
let slot;
let equipmentItems = [];

function preload() {
    // Загрузка звуков
    this.load.audio('success', 'assets/sounds/success.mp3');
    this.load.audio('error', 'assets/sounds/error.mp3');
}

function create() {
    this.sound.pauseOnBlur = false;
    
    // Создаем схему пивоварни (улучшенную)
    createBreweryScheme(this);
    
    // === 1. ВЕРХНЯЯ ПАНЕЛЬ ===
    const headerBg = this.add.rectangle(
        config.width / 2, 
        30, 
        config.width, 
        70, 
        0x16213e
    ).setDepth(10).setAlpha(0.92);
    
    // Текст задания
    taskText = this.add.text(
        config.width / 2, 
        10,
        'УСТАНОВИТЕ БГВ НА СХЕМУ ПИВОВАРНИ\nПЕРЕТАЩИТЕ ПРАВИЛЬНОЕ ОБОРУДОВАНИЕ', 
        {
            fontFamily: 'Arial',
            fontSize: isMobile ? '16px' : '20px',
            fill: '#ffffff',
            align: 'center',
            fontWeight: 'bold',
            lineSpacing: 6,
            wordWrap: { width: config.width - 30 },
            padding: { x: 8, y: 4 }
        }
    ).setOrigin(0.5, 0).setDepth(11);
    
    // Таймер
    timerText = this.add.text(
        config.width / 2, 
        45, 
        `⏱ ${timeLeft} СЕК`, 
        {
            fontFamily: 'Arial',
            fontSize: isMobile ? '18px' : '22px',
            fill: '#f8f8f8',
            backgroundColor: '#e94560',
            padding: { x: 12, y: 4 },
            borderRadius: 4
        }
    ).setOrigin(0.5, 0).setDepth(11);
    
    timerEvent = this.time.addEvent({
        delay: 1000,
        callback: updateTimer,
        callbackScope: this,
        loop: true
    });

    // === 2. ИГРОВАЯ ЗОНА - СХЕМА ПИВОВАРНИ (улучшенная) ===
    // Слот для оборудования (более заметный)
    slot = this.add.rectangle(
        config.width * 0.65, 
        config.height * 0.45, 
        isMobile ? 100 : 120, 
        isMobile ? 100 : 120,
        0x4ecca3
    )
    .setDepth(5)
    .setAlpha(0.3)
    .setStrokeStyle(3, 0xffffff)
    .setData('correctType', 'bgv');
    
    // Анимация слота (пульсация)
    this.tweens.add({
        targets: slot,
        alpha: 0.5,
        duration: 1000,
        yoyo: true,
        repeat: -1
    });
    
    // Подпись слота
    this.add.text(
        config.width * 0.65, 
        config.height * 0.45 + (isMobile ? 60 : 70), 
        'МЕСТО ДЛЯ БГВ', 
        {
            fontFamily: 'Arial',
            fontSize: isMobile ? '14px' : '16px',
            fill: '#ffffff',
            fontWeight: 'bold',
            backgroundColor: '#4ecca3',
            padding: { x: 10, y: 5 },
            wordWrap: { width: 150 }
        }
    ).setOrigin(0.5).setDepth(11);

    // === 3. ПАНЕЛЬ ОБОРУДОВАНИЯ ===
    const panelBg = this.add.rectangle(
        config.width / 2, 
        config.height - 50, 
        config.width, 
        isMobile ? 100 : 120, 
        0x16213e
    ).setDepth(10).setAlpha(0.92);
    
    // Элементы оборудования (более заметные)
    const equipment = [
        { x: config.width * 0.25, type: 'tank', label: 'ЦКТ', color: '#3498db' },
        { x: config.width * 0.5, type: 'bgv', label: 'БГВ', color: '#4ecca3' },
        { x: config.width * 0.75, type: 'filter', label: 'Фильтр', color: '#9b59b6' }
    ];
    
    equipment.forEach(item => {
        const eqItem = createEquipmentItem(this, item.x, config.height - (isMobile ? 45 : 60), item.type, item.label, item.color);
        equipmentItems.push(eqItem);
    });

    // === ЛОГИКА ПЕРЕТАСКИВАНИЯ ===
    this.input.on('dragstart', (pointer, gameObject) => {
        draggedItem = gameObject;
        gameObject.setDepth(20);
        this.tweens.add({
            targets: gameObject,
            scale: 1.1,
            duration: 200
        });
        if (successText) successText.destroy();
        if (errorText) errorText.destroy();
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    this.input.on('dragend', () => {
        if (!draggedItem) return;
        
        this.tweens.add({
            targets: draggedItem,
            scale: 1.0,
            duration: 200
        });
        
        if (Phaser.Geom.Intersects.RectangleToRectangle(
            draggedItem.getBounds(),
            slot.getBounds()
        )) {
            if (draggedItem.getData('type') === slot.getData('correctType')) {
                handleSuccess.call(this);
            } else {
                handleError.call(this);
            }
        } else {
            // Возвращаем если не попал в слот
            this.tweens.add({
                targets: draggedItem,
                x: draggedItem.input.dragStartX,
                y: draggedItem.input.dragStartY,
                duration: 300,
                ease: 'Back.easeOut',
                onComplete: () => draggedItem.setDepth(5)
            });
        }
        draggedItem = null;
    });
}

function handleSuccess() {
    this.sound.play('success');
    draggedItem.x = slot.x;
    draggedItem.y = slot.y;
    draggedItem.setDepth(10);
    
    // Делаем элемент неактивным
    draggedItem.disableInteractive();
    
    // Подсветка успеха
    this.add.graphics()
        .lineStyle(4, 0x4ecca3)
        .strokeRect(slot.x - slot.width/2, slot.y - slot.height/2, slot.width, slot.height)
        .setDepth(12);
    
    successText = this.add.text(
        config.width / 2, 
        config.height * 0.7, 
        'ВЕРНО! БГВ УСПЕШНО УСТАНОВЛЕН\nНА СХЕМУ ПИВОВАРЕННОГО ЗАВОДА', 
        {
            fontSize: isMobile ? '16px' : '20px',
            fill: '#4ecca3',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0,0,0,0.7)',
            align: 'center',
            padding: { x: 15, y: 10 },
            lineSpacing: 6,
            wordWrap: { width: config.width - 40 }
        }
    ).setOrigin(0.5).setDepth(11);
    
    // Победа!
    this.time.delayedCall(3000, () => {
        this.add.text(
            config.width / 2, 
            config.height / 2, 
            'УРОВЕНЬ ПРОЙДЕН!', 
            {
                fontSize: isMobile ? '32px' : '42px', 
                fill: '#4ecca3',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                stroke: '#000',
                strokeThickness: 4,
                shadow: { offsetY: 3, color: '#000', blur: 8 }
            }
        ).setOrigin(0.5).setDepth(11);
        timerEvent.remove();
    }, null, this);
}

function handleError() {
    this.sound.play('error');
    errorText = this.add.text(
        config.width / 2, 
        config.height * 0.7, 
        'НЕВЕРНО! ЭТО ОБОРУДОВАНИЕ\nНЕ ПОДХОДИТ ДЛЯ УСТАНОВКИ', 
        {
            fontSize: isMobile ? '16px' : '20px',
            fill: '#e94560',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0,0,0,0.7)',
            align: 'center',
            padding: { x: 15, y: 10 },
            wordWrap: { width: config.width - 40 }
        }
    ).setOrigin(0.5).setDepth(11);
    
    // Анимация ошибки
    this.tweens.add({
        targets: draggedItem,
        x: { value: draggedItem.x + 10, duration: 100 },
        yoyo: true,
        repeat: 3
    });
    
    // Возвращаем на панель
    this.tweens.add({
        targets: draggedItem,
        x: draggedItem.input.dragStartX,
        y: draggedItem.input.dragStartY,
        duration: 500,
        ease: 'Back.easeOut',
        onComplete: () => draggedItem.setDepth(5)
    });
}

// Создание схемы пивоварни (улучшенной)
function createBreweryScheme(scene) {
    // Основные емкости (более детализированные)
    const tanks = [
        { x: config.width * 0.15, y: config.height * 0.3, type: 'fermentor', scale: isMobile ? 0.6 : 0.8 },
        { x: config.width * 0.3, y: config.height * 0.4, type: 'tank', scale: isMobile ? 0.5 : 0.7 },
        { x: config.width * 0.45, y: config.height * 0.35, type: 'tank', scale: isMobile ? 0.7 : 0.9 }
    ];
    
    // Трубы и арматура (более реалистичные)
    const pipes = [
        { x: config.width * 0.22, y: config.height * 0.32, rotation: 0, length: isMobile ? 50 : 70 },
        { x: config.width * 0.35, y: config.height * 0.42, rotation: 45, length: isMobile ? 70 : 90 },
        { x: config.width * 0.52, y: config.height * 0.38, rotation: 90, length: isMobile ? 40 : 60 },
        { x: config.width * 0.58, y: config.height * 0.45, rotation: 30, length: isMobile ? 60 : 80 },
        { x: config.width * 0.5, y: config.height * 0.25, rotation: 120, length: isMobile ? 50 : 70 }
    ];
    
    // Насосы и клапаны (более детализированные)
    const equipment = [
        { x: config.width * 0.25, y: config.height * 0.5, type: 'pump', scale: isMobile ? 0.9 : 1.1 },
        { x: config.width * 0.4, y: config.height * 0.55, type: 'valve', scale: isMobile ? 0.9 : 1.1 },
        { x: config.width * 0.55, y: config.height * 0.52, type: 'pump', scale: isMobile ? 0.9 : 1.1 }
    ];
    
    // Рендерим схему
    tanks.forEach(tank => {
        const container = scene.add.container(tank.x, tank.y);
        const graphics = scene.add.graphics();
        
        // Рисуем оборудование (более детализированное)
        switch(tank.type) {
            case 'tank':
                // ЦКТ (цилиндр с крышкой и деталями)
                graphics.fillStyle(0x3498db, 0.85);
                graphics.lineStyle(4, 0xd0e0e8);
                graphics.fillRoundedRect(-50, -35, 100, 70, 12);
                graphics.strokeRoundedRect(-50, -35, 100, 70, 12);
                
                // Крышка
                graphics.fillStyle(0x2c3e50);
                graphics.fillEllipse(0, -35, 45, 10);
                
                // Люки
                graphics.fillStyle(0x1a2c3d);
                graphics.fillCircle(-25, 0, 8);
                graphics.fillCircle(25, 0, 8);
                break;
                
            case 'fermentor':
                // Ферментер (высокий цилиндр с деталями)
                graphics.fillStyle(0x3498db, 0.85);
                graphics.lineStyle(4, 0xd0e0e8);
                graphics.fillRoundedRect(-35, -60, 70, 120, 18);
                graphics.strokeRoundedRect(-35, -60, 70, 120, 18);
                
                // Крышка
                graphics.fillStyle(0x2c3e50);
                graphics.fillEllipse(0, -60, 30, 12);
                
                // Лестница
                graphics.lineStyle(3, 0xd0e0e8);
                for (let i = -50; i <= 30; i += 10) {
                    graphics.lineBetween(-35, i, 35, i);
                }
                graphics.lineBetween(-35, -50, -35, 30);
                graphics.lineBetween(35, -50, 35, 30);
                break;
        }
        
        container.add(graphics);
        container.setScale(tank.scale);
        breweryParts.push(container);
    });
    
    pipes.forEach(pipe => {
        const graphics = scene.add.graphics();
        graphics.lineStyle(14, 0xd0e0e8);
        graphics.lineBetween(-pipe.length/2, 0, pipe.length/2, 0);
        graphics.setPosition(pipe.x, pipe.y);
        graphics.rotation = pipe.rotation * (Math.PI / 180);
        breweryParts.push(graphics);
        
        // Соединительные элементы
        const connector = scene.add.graphics();
        connector.fillStyle(0xa0b0c0);
        connector.fillCircle(pipe.x, pipe.y, 6);
        connector.setDepth(5);
        breweryParts.push(connector);
    });
    
    equipment.forEach(item => {
        const container = scene.add.container(item.x, item.y);
        const graphics = scene.add.graphics();
        
        switch(item.type) {
            case 'pump':
                // Насос (круг с треугольником и деталями)
                graphics.fillStyle(0x9b59b6, 0.85);
                graphics.lineStyle(4, 0xd0e0e8);
                graphics.fillCircle(0, 0, 25);
                graphics.strokeCircle(0, 0, 25);
                
                // Стрелка
                graphics.fillStyle(0xffffff);
                graphics.lineStyle(3, 0xffffff);
                graphics.beginPath();
                graphics.moveTo(-15, -15);
                graphics.lineTo(15, 0);
                graphics.lineTo(-15, 15);
                graphics.closePath();
                graphics.fillPath();
                
                // Крепления
                graphics.fillRect(-30, -5, 10, 10);
                graphics.fillRect(20, -5, 10, 10);
                break;
                
            case 'valve':
                // Клапан (квадрат с крестом и деталями)
                graphics.fillStyle(0xe74c3c, 0.85);
                graphics.lineStyle(4, 0xd0e0e8);
                graphics.fillRect(-20, -20, 40, 40);
                graphics.strokeRect(-20, -20, 40, 40);
                
                // Крест
                graphics.lineStyle(5, 0xffffff);
                graphics.lineBetween(0, -20, 0, 20);
                graphics.lineBetween(-20, 0, 20, 0);
                
                // Ручка
                graphics.fillStyle(0xffffff);
                graphics.fillCircle(0, 0, 8);
                break;
        }
        
        container.add(graphics);
        container.setScale(item.scale);
        breweryParts.push(container);
    });
    
    // Подложка для лучшей читаемости
    const bgOverlay = scene.add.graphics();
    bgOverlay.fillStyle(0x0a1929, 0.7);
    bgOverlay.fillRect(0, 0, config.width, config.height);
    bgOverlay.setDepth(0);
}

// Создание элемента оборудования для панели (более привлекательные)
function createEquipmentItem(scene, x, y, type, label, color) {
    const container = scene.add.container(x, y - 15);
    const graphics = scene.add.graphics();
    
    // Размер иконки (больше для лучшей видимости)
    const size = isMobile ? 50 : 70;
    
    // Рисуем иконку оборудования с тенью
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRoundedRect(-size/1.4 + 3, -size/1.8 + 3, size*1.2, size, 10);
    
    // Основная форма
    graphics.fillStyle(parseInt(color.replace('#', '0x')), 0.95);
    graphics.lineStyle(4, 0xffffff);
    
    // Рисуем оборудование
    switch(type) {
        case 'tank':
            // ЦКТ (ферментатор)
            graphics.fillRoundedRect(-size/1.4, -size/1.8, size*1.2, size, 10);
            graphics.strokeRoundedRect(-size/1.4, -size/1.8, size*1.2, size, 10);
            graphics.fillStyle(0x2c3e50);
            graphics.fillEllipse(0, -size/1.8, size/1.4, size/6);
            break;
            
        case 'bgv':
            // БГВ (бак с патрубками)
            graphics.fillCircle(0, 0, size/1.6);
            graphics.strokeCircle(0, 0, size/1.6);
            // Патрубки
            graphics.fillStyle(0x2c3e50);
            graphics.fillRect(-size/1.1, -size/8, size/3, size/3);
            graphics.fillRect(size/1.1 - size/3, -size/8, size/3, size/3);
            break;
            
        case 'filter':
            // Фильтр
            graphics.fillRoundedRect(-size/1.4, -size/1.8, size*1.2, size, 6);
            graphics.strokeRoundedRect(-size/1.4, -size/1.8, size*1.2, size, 6);
            // Фильтрующие элементы
            graphics.lineStyle(3, 0xffffff);
            for(let i = -1; i <= 1; i++) {
                graphics.lineBetween(-size/1.4, i*size/3, size/1.4, i*size/3);
            }
            break;
    }
    
    container.add(graphics);
    container.setSize(size * 2, size * 2);
    container.setData('type', type);
    container.setInteractive(new Phaser.Geom.Rectangle(-size, -size, size*2, size*2), Phaser.Geom.Rectangle.Contains);
    
    scene.input.setDraggable(container);
    
    // Запоминаем начальную позицию
    container.input = { dragStartX: x, dragStartY: y - 15 };
    
    // Стильная подпись
    const labelText = scene.add.text(x, y + (isMobile ? 20 : 25), label, {
        fontFamily: 'Arial',
        fontSize: isMobile ? '14px' : '18px',
        fill: '#ffffff',
        fontWeight: 'bold',
        align: 'center',
        backgroundColor: parseInt(color.replace('#', '0x')),
        padding: { x: 10, y: 5 },
        borderRadius: 6,
        wordWrap: { width: 140 }
    }).setOrigin(0.5).setDepth(11);
    
    // Эффект при наведении
    container.on('pointerover', () => {
        scene.tweens.add({
            targets: [container, labelText],
            scale: 1.05,
            duration: 200
        });
    });
    
    container.on('pointerout', () => {
        scene.tweens.add({
            targets: [container, labelText],
            scale: 1.0,
            duration: 200
        });
    });
    
    return container;
}

// Обновление таймера
function updateTimer() {
    timeLeft--;
    timerText.setText(`⏱ ${timeLeft} СЕК`);
    
    if (timeLeft <= 10) {
        timerText.setColor('#ffcc00');
    }
    
    if (timeLeft <= 0) {
        timerEvent.remove();
        const gameOverText = this.add.text(
            config.width / 2, 
            config.height / 2, 
            'ВРЕМЯ ВЫШЛО!', 
            {
                fontSize: isMobile ? '32px' : '42px', 
                fill: '#e94560',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                stroke: '#000',
                strokeThickness: 4,
                shadow: { offsetY: 3, color: '#000', blur: 8 }
            }
        ).setOrigin(0.5).setDepth(11);
        
        // Пульсация текста
        this.tweens.add({
            targets: gameOverText,
            scale: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
}

function update() {}