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
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
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

function preload() {
    // Загрузка звуков
    this.load.audio('success', 'assets/sounds/success.mp3');
    this.load.audio('error', 'assets/sounds/error.mp3');
}

function create() {
    this.sound.pauseOnBlur = false;
    
    // Создаем схему пивоварни
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
        'ПИВОВАРНЕ ТРЕБУЕТСЯ ОБОРУДОВАНИЕ!\nВЫБЕРИТЕ: БГВ ДЛЯ ФИЛЬТРАЦИИ ИЛИ ЦКТ ДЛЯ БРОЖЕНИЯ?', 
        {
            fontFamily: 'Arial',
            fontSize: isMobile ? '14px' : '18px',
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

    // === 2. ИГРОВАЯ ЗОНА - СХЕМА ПИВОВАРНИ ===
    // Слот для оборудования
    slot = this.add.rectangle(
        config.width * 0.65, 
        config.height * 0.45, 
        isMobile ? 100 : 120, 
        isMobile ? 100 : 120,
        0x4ecca3
    ).setDepth(5).setAlpha(0.25).setStrokeStyle(3, 0x4ecca3).setData('correctType', 'bgv');
    
    // Подпись слота
    this.add.text(
        config.width * 0.65, 
        config.height * 0.45 + (isMobile ? 60 : 70), 
        'МЕСТО ДЛЯ БГВ', 
        {
            fontFamily: 'Arial',
            fontSize: isMobile ? '12px' : '16px',
            fill: '#4ecca3',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 8, y: 3 },
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
    
    // Элементы оборудования
    const equipment = [
        { x: config.width * 0.25, type: 'tank', label: 'ЦКТ (Ферментатор)', color: '#3498db' },
        { x: config.width * 0.5, type: 'bgv', label: 'БГВ (Фильтрация)', color: '#4ecca3' },
        { x: config.width * 0.75, type: 'filter', label: 'Фильтр', color: '#9b59b6' }
    ];
    
    equipment.forEach(item => {
        createEquipmentItem(this, item.x, config.height - (isMobile ? 45 : 60), item.type, item.label, item.color);
    });

    // === ЛОГИКА ПЕРЕТАСКИВАНИЯ ===
    this.input.on('dragstart', (pointer, gameObject) => {
        draggedItem = gameObject;
        gameObject.setDepth(20);
        if (successText) successText.destroy();
        if (errorText) errorText.destroy();
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    this.input.on('dragend', () => {
        if (!draggedItem) return;
        
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
    
    successText = this.add.text(
        config.width / 2, 
        config.height * 0.7, 
        'ВЕРНО! БГВ ДЛЯ ФИЛЬТРАЦИИ ПИВА\nИСПОЛЬЗУЕТСЯ НА ЗАВЕРШАЮЩЕМ ЭТАПЕ', 
        {
            fontSize: isMobile ? '14px' : '18px',
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
                fontSize: isMobile ? '28px' : '38px', 
                fill: '#4ecca3',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                shadow: { offsetY: 2, color: '#000', blur: 4 }
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
        'НЕВЕРНО! ЭТО ОБОРУДОВАНИЕ НЕ ПОДХОДИТ\nДЛЯ ДАННОГО ТЕХНОЛОГИЧЕСКОГО ЭТАПА', 
        {
            fontSize: isMobile ? '14px' : '18px',
            fill: '#e94560',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0,0,0,0.7)',
            align: 'center',
            padding: { x: 15, y: 10 },
            wordWrap: { width: config.width - 40 }
        }
    ).setOrigin(0.5).setDepth(11);
    
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

// Создание схемы пивоварни
function createBreweryScheme(scene) {
    // Основные емкости
    const tanks = [
        { x: config.width * 0.15, y: config.height * 0.3, type: 'fermentor', scale: isMobile ? 0.5 : 0.7 },
        { x: config.width * 0.3, y: config.height * 0.4, type: 'tank', scale: isMobile ? 0.4 : 0.6 },
        { x: config.width * 0.45, y: config.height * 0.35, type: 'tank', scale: isMobile ? 0.6 : 0.8 }
    ];
    
    // Трубы и арматура
    const pipes = [
        { x: config.width * 0.22, y: config.height * 0.32, rotation: 0, length: isMobile ? 40 : 60 },
        { x: config.width * 0.35, y: config.height * 0.42, rotation: 45, length: isMobile ? 60 : 80 },
        { x: config.width * 0.52, y: config.height * 0.38, rotation: 90, length: isMobile ? 30 : 50 },
        { x: config.width * 0.58, y: config.height * 0.45, rotation: 30, length: isMobile ? 50 : 70 }
    ];
    
    // Насосы и клапаны
    const equipment = [
        { x: config.width * 0.25, y: config.height * 0.5, type: 'pump', scale: isMobile ? 0.8 : 1 },
        { x: config.width * 0.4, y: config.height * 0.55, type: 'valve', scale: isMobile ? 0.8 : 1 },
        { x: config.width * 0.55, y: config.height * 0.52, type: 'pump', scale: isMobile ? 0.8 : 1 }
    ];
    
    // Рендерим схему
    tanks.forEach(tank => {
        const container = scene.add.container(tank.x, tank.y);
        const graphics = scene.add.graphics();
        
        // Рисуем оборудование
        switch(tank.type) {
            case 'tank':
                // ЦКТ (цилиндр с крышкой)
                graphics.fillStyle(0x3498db, 0.8);
                graphics.lineStyle(3, 0xd0e0e8);
                graphics.fillRoundedRect(-40, -30, 80, 60, 10);
                graphics.strokeRoundedRect(-40, -30, 80, 60, 10);
                graphics.fillStyle(0x2c3e50);
                graphics.fillEllipse(0, -30, 40, 8);
                break;
                
            case 'fermentor':
                // Ферментер (высокий цилиндр)
                graphics.fillStyle(0x3498db, 0.8);
                graphics.lineStyle(3, 0xd0e0e8);
                graphics.fillRoundedRect(-30, -50, 60, 100, 15);
                graphics.strokeRoundedRect(-30, -50, 60, 100, 15);
                graphics.fillStyle(0x2c3e50);
                graphics.fillEllipse(0, -50, 30, 10);
                break;
        }
        
        container.add(graphics);
        container.setScale(tank.scale);
        breweryParts.push(container);
    });
    
    pipes.forEach(pipe => {
        const graphics = scene.add.graphics();
        graphics.lineStyle(12, 0xd0e0e8);
        graphics.lineBetween(-pipe.length/2, 0, pipe.length/2, 0);
        graphics.setPosition(pipe.x, pipe.y);
        graphics.rotation = pipe.rotation * (Math.PI / 180);
        breweryParts.push(graphics);
    });
    
    equipment.forEach(item => {
        const container = scene.add.container(item.x, item.y);
        const graphics = scene.add.graphics();
        
        switch(item.type) {
            case 'pump':
                // Насос (круг с треугольником)
                graphics.fillStyle(0x9b59b6, 0.8);
                graphics.lineStyle(3, 0xd0e0e8);
                graphics.fillCircle(0, 0, 20);
                graphics.strokeCircle(0, 0, 20);
                graphics.lineStyle(4, 0xd0e0e8);
                graphics.beginPath();
                graphics.moveTo(-15, -15);
                graphics.lineTo(15, 0);
                graphics.lineTo(-15, 15);
                graphics.closePath();
                graphics.strokePath();
                break;
                
            case 'valve':
                // Клапан (квадрат с крестом)
                graphics.fillStyle(0xe74c3c, 0.8);
                graphics.lineStyle(3, 0xd0e0e8);
                graphics.fillRect(-15, -15, 30, 30);
                graphics.strokeRect(-15, -15, 30, 30);
                graphics.lineStyle(4, 0xd0e0e8);
                graphics.lineBetween(0, -15, 0, 15);
                graphics.lineBetween(-15, 0, 15, 0);
                break;
        }
        
        container.add(graphics);
        container.setScale(item.scale);
        breweryParts.push(container);
    });
    
    // Подложка для лучшей читаемости
    scene.add.rectangle(
        config.width / 2, 
        config.height / 2, 
        config.width, 
        config.height, 
        0x0a1929
    ).setAlpha(0.6).setDepth(0);
}

// Создание элемента оборудования для панели
function createEquipmentItem(scene, x, y, type, label, color) {
    const container = scene.add.container(x, y - 15);
    const graphics = scene.add.graphics();
    
    // Размер иконки (меньше для мобильных)
    const size = isMobile ? 40 : 60;
    
    // Рисуем иконку оборудования
    switch(type) {
        case 'tank':
            // ЦКТ (ферментатор)
            graphics.fillStyle(parseInt(color.replace('#', '0x')), 0.9);
            graphics.lineStyle(3, 0xd0e0e8);
            graphics.fillRoundedRect(-size/1.5, -size/2, size*1.2, size, 10);
            graphics.strokeRoundedRect(-size/1.5, -size/2, size*1.2, size, 10);
            graphics.fillStyle(0x2c3e50);
            graphics.fillEllipse(0, -size/2, size/1.5, size/6);
            break;
            
        case 'bgv':
            // БГВ (бак с патрубками)
            graphics.fillStyle(parseInt(color.replace('#', '0x')), 0.9);
            graphics.lineStyle(3, 0xd0e0e8);
            graphics.fillCircle(0, 0, size/1.8);
            graphics.strokeCircle(0, 0, size/1.8);
            // Патрубки
            graphics.fillStyle(0x2c3e50);
            graphics.fillRect(-size/1.2, -size/8, size/4, size/4);
            graphics.fillRect(size/1.2 - size/4, -size/8, size/4, size/4);
            break;
            
        case 'filter':
            // Фильтр
            graphics.fillStyle(parseInt(color.replace('#', '0x')), 0.9);
            graphics.lineStyle(3, 0xd0e0e8);
            graphics.fillRoundedRect(-size/1.5, -size/2, size*1.2, size, 5);
            graphics.strokeRoundedRect(-size/1.5, -size/2, size*1.2, size, 5);
            // Фильтрующие элементы
            graphics.lineStyle(2, 0xd0e0e8);
            for(let i = -1; i <= 1; i++) {
                graphics.lineBetween(-size/1.5, i*size/3, size/1.5, i*size/3);
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
    
    // Стильная подпись (меньше для мобильных)
    scene.add.text(x, y + (isMobile ? 15 : 20), label, {
        fontFamily: 'Arial',
        fontSize: isMobile ? '12px' : '16px',
        fill: color,
        fontWeight: 'bold',
        align: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 6, y: 3 },
        borderRadius: 4,
        wordWrap: { width: 120 }
    }).setOrigin(0.5).setDepth(11);
    
    return container;
}

// Обновление таймера
function updateTimer() {
    timeLeft--;
    timerText.setText(`⏱ ${timeLeft} СЕК`);
    
    if (timeLeft <= 0) {
        timerEvent.remove();
        this.add.text(
            config.width / 2, 
            config.height / 2, 
            'ВРЕМЯ ВЫШЛО!', 
            {
                fontSize: isMobile ? '28px' : '38px', 
                fill: '#e94560',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                shadow: { offsetY: 2, color: '#000', blur: 4 }
            }
        ).setOrigin(0.5).setDepth(11);
    }
}

function update() {}