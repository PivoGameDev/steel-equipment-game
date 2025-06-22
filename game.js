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
let timerText, taskText;
let timerEvent;
let timeLeft = 90;
let draggedItem = null;
let slot;

function preload() {
    this.load.audio('success', 'assets/sounds/success.mp3');
    this.load.audio('error', 'assets/sounds/error.mp3');
}

function create() {
    this.sound.pauseOnBlur = false;
    
    // === УПРОЩЕННАЯ СХЕМА ПИВОВАРНИ ===
    createBreweryScheme(this);
    
    // === 1. ВЕРХНЯЯ ПАНЕЛЬ ===
    const headerBg = this.add.rectangle(
        config.width / 2, 30, config.width, 70, 0x16213e
    ).setDepth(10).setAlpha(0.92);
    
    // Текст задания
    taskText = this.add.text(
        config.width / 2, 10,
        'УСТАНОВИТЕ БГВ НА СХЕМУ ПИВОВАРНИ', 
        {
            fontFamily: 'Arial',
            fontSize: isMobile ? '18px' : '22px',
            fill: '#ffffff',
            align: 'center',
            fontWeight: 'bold',
            wordWrap: { width: config.width - 40 }
        }
    ).setOrigin(0.5, 0).setDepth(11);
    
    // Таймер
    timerText = this.add.text(
        config.width / 2, 45, 
        `⏱ ${timeLeft} СЕК`, 
        {
            fontFamily: 'Arial',
            fontSize: isMobile ? '20px' : '24px',
            fill: '#f8f8f8',
            backgroundColor: '#e94560',
            padding: { x: 15, y: 5 },
            borderRadius: 5
        }
    ).setOrigin(0.5, 0).setDepth(11);
    
    timerEvent = this.time.addEvent({
        delay: 1000,
        callback: updateTimer,
        callbackScope: this,
        loop: true
    });

    // === 2. СЛОТ ДЛЯ ОБОРУДОВАНИЯ ===
    slot = this.add.rectangle(
        config.width * 0.7, 
        config.height * 0.5, 
        isMobile ? 100 : 120, 
        isMobile ? 100 : 120,
        0x4ecca3
    )
    .setDepth(20)
    .setAlpha(0.3)
    .setStrokeStyle(3, 0xffffff)
    .setData('correctType', 'bgv');
    
    // Анимация слота
    this.tweens.add({
        targets: slot,
        alpha: 0.5,
        duration: 1000,
        yoyo: true,
        repeat: -1
    });
    
    // Подпись слота
    this.add.text(
        config.width * 0.7, 
        config.height * 0.5 + 70, 
        'МЕСТО ДЛЯ БГВ', 
        {
            fontFamily: 'Arial',
            fontSize: isMobile ? '16px' : '18px',
            fill: '#ffffff',
            fontWeight: 'bold',
            backgroundColor: '#4ecca3',
            padding: { x: 10, y: 5 }
        }
    ).setOrigin(0.5).setDepth(21);

    // === 3. ПАНЕЛЬ ОБОРУДОВАНИЯ ===
    const panelBg = this.add.rectangle(
        config.width / 2, 
        config.height - 60, 
        config.width, 
        isMobile ? 110 : 130, 
        0x16213e
    ).setDepth(10).setAlpha(0.92);
    
    // Элементы оборудования (ЦКТ, БГВ, Фильтр)
    createEquipmentItem(this, config.width * 0.25, config.height - 60, 'tank', 'ЦКТ', '#3498db');
    createEquipmentItem(this, config.width * 0.5, config.height - 60, 'bgv', 'БГВ', '#4ecca3');
    createEquipmentItem(this, config.width * 0.75, config.height - 60, 'filter', 'Фильтр', '#9b59b6');

    // === ЛОГИКА ПЕРЕТАСКИВАНИЯ ===
    this.input.on('dragstart', (pointer, gameObject) => {
        draggedItem = gameObject;
        gameObject.setDepth(30); // Очень высокий слой
        this.tweens.add({
            targets: gameObject,
            scale: 1.1,
            duration: 200
        });
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
            // Возвращаем на панель
            this.tweens.add({
                targets: draggedItem,
                x: draggedItem.input.dragStartX,
                y: draggedItem.input.dragStartY,
                duration: 300,
                ease: 'Back.easeOut'
            });
        }
    });
}

function handleSuccess() {
    this.sound.play('success');
    draggedItem.x = slot.x;
    draggedItem.y = slot.y;
    draggedItem.setDepth(25);
    
    // Делаем элемент неактивным
    draggedItem.disableInteractive();
    
    // Подсветка успеха
    const successGraphics = this.add.graphics()
        .lineStyle(4, 0x4ecca3)
        .strokeRect(slot.x - slot.width/2, slot.y - slot.height/2, slot.width, slot.height)
        .setDepth(26);
    
    // Сообщение об успехе
    const successText = this.add.text(
        config.width / 2, 
        config.height * 0.7, 
        'ВЕРНО! БГВ УСПЕШНО УСТАНОВЛЕН', 
        {
            fontSize: isMobile ? '18px' : '22px',
            fill: '#4ecca3',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 15, y: 10 }
        }
    ).setOrigin(0.5).setDepth(26);
    
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
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(26);
        timerEvent.remove();
    }, null, this);
}

function handleError() {
    this.sound.play('error');
    
    // Сообщение об ошибке
    const errorText = this.add.text(
        config.width / 2, 
        config.height * 0.7, 
        'НЕВЕРНО! ЭТО НЕ БГВ', 
        {
            fontSize: isMobile ? '18px' : '22px',
            fill: '#e94560',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 15, y: 10 }
        }
    ).setOrigin(0.5).setDepth(21);
    
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
        ease: 'Back.easeOut'
    });
    
    // Удаляем сообщение через 2 секунды
    this.time.delayedCall(2000, () => {
        errorText.destroy();
    });
}

// Создание упрощенной схемы пивоварни
function createBreweryScheme(scene) {
    // Основные емкости
    const tanks = [
        { x: config.width * 0.2, y: config.height * 0.3, width: 80, height: 120, color: 0x3498db, radius: 10 },
        { x: config.width * 0.35, y: config.height * 0.4, width: 100, height: 80, color: 0x3498db, radius: 10 },
        { x: config.width * 0.5, y: config.height * 0.35, width: 90, height: 100, color: 0x3498db, radius: 10 }
    ];
    
    // Трубы (горизонтальные и вертикальные)
    const pipes = [
        // Горизонтальные
        { x: config.width * 0.25, y: config.height * 0.3, width: 100, height: 15, rotation: 0, color: 0xa0b0c0 },
        { x: config.width * 0.4, y: config.height * 0.4, width: 100, height: 15, rotation: 0, color: 0xa0b0c0 },
        { x: config.width * 0.55, y: config.height * 0.35, width: 80, height: 15, rotation: 0, color: 0xa0b0c0 },
        
        // Вертикальные
        { x: config.width * 0.3, y: config.height * 0.25, width: 15, height: 100, rotation: 0, color: 0xa0b0c0 },
        { x: config.width * 0.45, y: config.height * 0.35, width: 15, height: 80, rotation: 0, color: 0xa0b0c0 },
        
        // Соединительные элементы
        { x: config.width * 0.25, y: config.height * 0.3, width: 30, height: 30, color: 0x888888, isCircle: true },
        { x: config.width * 0.4, y: config.height * 0.4, width: 30, height: 30, color: 0x888888, isCircle: true }
    ];
    
    // Клапаны и насосы
    const equipment = [
        { x: config.width * 0.3, y: config.height * 0.45, width: 40, height: 40, color: 0xe74c3c, isCircle: true },
        { x: config.width * 0.45, y: config.height * 0.5, width: 40, height: 40, color: 0x9b59b6, isCircle: true }
    ];
    
    // Рендерим схему
    tanks.forEach(tank => {
        scene.add.rectangle(
            tank.x, tank.y, 
            tank.width, tank.height, 
            tank.color
        )
        .setDepth(5)
        .setStrokeStyle(2, 0xd0e0e8);
    });
    
    pipes.forEach(pipe => {
        if (pipe.isCircle) {
            scene.add.circle(pipe.x, pipe.y, pipe.width/2, pipe.color)
                .setDepth(6)
                .setStrokeStyle(2, 0xffffff);
        } else {
            scene.add.rectangle(pipe.x, pipe.y, pipe.width, pipe.height, pipe.color)
                .setDepth(6)
                .setStrokeStyle(2, 0xffffff);
        }
    });
    
    equipment.forEach(item => {
        if (item.isCircle) {
            const circle = scene.add.circle(item.x, item.y, item.width/2, item.color)
                .setDepth(7)
                .setStrokeStyle(2, 0xffffff);
                
            // Добавляем значок внутри
            if (item.color === 0xe74c3c) { // Клапан
                scene.add.line(item.x, item.y, 0, -item.width/3, 0, item.width/3, 0xffffff)
                    .setLineWidth(3)
                    .setDepth(8);
                scene.add.line(item.x, item.y, -item.width/3, 0, item.width/3, 0, 0xffffff)
                    .setLineWidth(3)
                    .setDepth(8);
            } else { // Насос
                scene.add.triangle(item.x, item.y, 0, -15, 15, 0, 0, 15, 0xffffff)
                    .setDepth(8);
            }
        }
    });
    
    // Подложка для схемы
    scene.add.rectangle(
        config.width * 0.4, 
        config.height * 0.4, 
        config.width * 0.7, 
        config.height * 0.6, 
        0x0a2940
    )
    .setDepth(4)
    .setStrokeStyle(2, 0x1c5a8e);
}

// Создание элемента оборудования для панели
function createEquipmentItem(scene, x, y, type, label, color) {
    const size = isMobile ? 50 : 70;
    
    // Создаем основной элемент
    const graphics = scene.add.graphics();
    graphics.fillStyle(parseInt(color.replace('#', '0x')));
    
    switch(type) {
        case 'tank':
            graphics.fillRoundedRect(-size/1.5, -size/2, size*1.5, size, 10);
            graphics.lineStyle(3, 0xffffff);
            graphics.strokeRoundedRect(-size/1.5, -size/2, size*1.5, size, 10);
            break;
            
        case 'bgv':
            graphics.fillCircle(0, 0, size/1.5);
            graphics.lineStyle(3, 0xffffff);
            graphics.strokeCircle(0, 0, size/1.5);
            break;
            
        case 'filter':
            graphics.fillRoundedRect(-size/1.5, -size/2, size*1.5, size, 5);
            graphics.lineStyle(3, 0xffffff);
            graphics.strokeRoundedRect(-size/1.5, -size/2, size*1.5, size, 5);
            break;
    }
    
    const container = scene.add.container(x, y, [graphics]);
    container.setSize(size * 2, size * 2);
    container.setData('type', type);
    container.setInteractive(new Phaser.Geom.Rectangle(-size, -size, size*2, size*2), Phaser.Geom.Rectangle.Contains);
    
    scene.input.setDraggable(container);
    
    // Запоминаем начальную позицию
    container.input = { dragStartX: x, dragStartY: y };
    container.setDepth(20); // Высокий слой
    
    // Подпись
    scene.add.text(x, y + size + 10, label, {
        fontFamily: 'Arial',
        fontSize: isMobile ? '16px' : '18px',
        fill: '#ffffff',
        fontWeight: 'bold',
        backgroundColor: parseInt(color.replace('#', '0x')),
        padding: { x: 10, y: 5 },
        borderRadius: 5
    })
    .setOrigin(0.5)
    .setDepth(21);
    
    return container;
}

// Обновление таймера
function updateTimer() {
    timeLeft--;
    timerText.setText(`⏱ ${timeLeft} СЕК`);
    
    if (timeLeft <= 10) {
        timerText.setColor('#ffcc00');
        timerText.setBackgroundColor('#ff3300');
    }
    
    if (timeLeft <= 0) {
        timerEvent.remove();
        this.add.text(
            config.width / 2, 
            config.height / 2, 
            'ВРЕМЯ ВЫШЛО!', 
            {
                fontSize: isMobile ? '32px' : '42px', 
                fill: '#e94560',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                stroke: '#000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(22);
    }
}

function update() {}