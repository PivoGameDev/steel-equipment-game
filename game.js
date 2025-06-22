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
    
    // === ПАНЕЛЬ ОБОРУДОВАНИЯ - ДОЛЖНА БЫТЬ ПЕРВОЙ ===
    const panelBg = this.add.rectangle(
        config.width / 2, 
        config.height - 60, 
        config.width, 
        130, 
        0x16213e
    ).setDepth(5).setAlpha(0.92);
    
    // Создаем элементы ДО схемы завода
    const equipment1 = createEquipmentItem(this, config.width * 0.25, config.height - 60, 'tank', 'ЦКТ', '#3498db');
    const equipment2 = createEquipmentItem(this, config.width * 0.5, config.height - 60, 'bgv', 'БГВ', '#4ecca3');
    const equipment3 = createEquipmentItem(this, config.width * 0.75, config.height - 60, 'filter', 'Фильтр', '#9b59b6');
    
    // === УПРОЩЕННАЯ СХЕМА ПИВОВАРНИ ===
    createBreweryScheme(this);
    
    // === 1. ВЕРХНЯЯ ПАНЕЛЬ ===
    const headerBg = this.add.rectangle(
        config.width / 2, 30, config.width, 70, 0x16213e
    ).setDepth(10).setAlpha(0.92);
    
    // Текст задания
    taskText = this.add.text(
        config.width / 2, 10,
        'ПЕРЕТАЩИТЕ БГВ НА ПУСТОЙ СЛОТ', 
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
        120, 
        120,
        0x4ecca3
    )
    .setDepth(15) // Высокий слой
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
        'ПУСТОЙ СЛОТ ДЛЯ БГВ', 
        {
            fontFamily: 'Arial',
            fontSize: isMobile ? '16px' : '18px',
            fill: '#ffffff',
            fontWeight: 'bold',
            backgroundColor: '#4ecca3',
            padding: { x: 10, y: 5 }
        }
    ).setOrigin(0.5).setDepth(16);

    // === ЛОГИКА ПЕРЕТАСКИВАНИЯ ===
    this.input.on('dragstart', (pointer, gameObject) => {
        draggedItem = gameObject;
        gameObject.setDepth(20); // Очень высокий слой
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
        
        // Проверяем пересечение с слотом
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
    draggedItem.setDepth(15);
    
    // Делаем элемент неактивным
    draggedItem.disableInteractive();
    
    // Подсветка успеха
    const successGraphics = this.add.graphics()
        .lineStyle(4, 0x4ecca3)
        .strokeRect(slot.x - 60, slot.y - 60, 120, 120)
        .setDepth(16);
    
    // Сообщение об успехе
    const successText = this.add.text(
        config.width / 2, 
        config.height * 0.7, 
        'УСПЕХ! БГВ УСТАНОВЛЕН', 
        {
            fontSize: isMobile ? '18px' : '22px',
            fill: '#4ecca3',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 15, y: 10 }
        }
    ).setOrigin(0.5).setDepth(16);
    
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
        ).setOrigin(0.5).setDepth(16);
        timerEvent.remove();
    }, null, this);
}

function handleError() {
    this.sound.play('error');
    
    // Сообщение об ошибке
    const errorText = this.add.text(
        config.width / 2, 
        config.height * 0.7, 
        'ОШИБКА! ЭТО НЕ БГВ', 
        {
            fontSize: isMobile ? '18px' : '22px',
            fill: '#e94560',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 15, y: 10 }
        }
    ).setOrigin(0.5).setDepth(16);
    
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

// Создание упрощенной схемы пивзавода
function createBreweryScheme(scene) {
    // Основные емкости
    scene.add.rectangle(150, 200, 100, 150, 0x3498db).setStrokeStyle(2, 0xffffff);
    scene.add.rectangle(300, 250, 120, 100, 0x3498db).setStrokeStyle(2, 0xffffff);
    scene.add.rectangle(450, 200, 110, 140, 0x3498db).setStrokeStyle(2, 0xffffff);
    
    // Трубы
    scene.add.rectangle(200, 180, 150, 20, 0xa0b0c0).setStrokeStyle(2, 0xffffff);
    scene.add.rectangle(350, 230, 150, 20, 0xa0b0c0).setStrokeStyle(2, 0xffffff);
    scene.add.rectangle(250, 130, 20, 100, 0xa0b0c0).setStrokeStyle(2, 0xffffff);
    
    // Клапаны и насосы
    scene.add.circle(280, 300, 25, 0xe74c3c).setStrokeStyle(2, 0xffffff);
    scene.add.line(280, 300, 0, -20, 0, 20, 0xffffff).setLineWidth(3);
    scene.add.line(280, 300, -20, 0, 20, 0, 0xffffff).setLineWidth(3);
    
    scene.add.circle(380, 280, 25, 0x9b59b6).setStrokeStyle(2, 0xffffff);
    scene.add.triangle(380, 280, 0, -15, 15, 0, 0, 15, 0xffffff);
    
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

// Создание элемента оборудования для панели (ГАРАНТИРОВАННО РАБОЧИЙ ВАРИАНТ)
function createEquipmentItem(scene, x, y, type, label, color) {
    const size = 60;
    const container = scene.add.container(x, y).setDepth(10); // Важно: высокий depth
    
    // Создаем графику
    const graphics = scene.add.graphics();
    graphics.fillStyle(parseInt(color.replace('#', '0x')));
    
    switch(type) {
        case 'tank':
            graphics.fillRoundedRect(-40, -30, 80, 60, 10);
            graphics.lineStyle(3, 0xffffff);
            graphics.strokeRoundedRect(-40, -30, 80, 60, 10);
            break;
            
        case 'bgv':
            graphics.fillCircle(0, 0, 30);
            graphics.lineStyle(3, 0xffffff);
            graphics.strokeCircle(0, 0, 30);
            break;
            
        case 'filter':
            graphics.fillRoundedRect(-40, -30, 80, 60, 5);
            graphics.lineStyle(3, 0xffffff);
            graphics.strokeRoundedRect(-40, -30, 80, 60, 5);
            break;
    }
    
    container.add(graphics);
    
    // Настраиваем интерактивность
    container.setSize(80, 60);
    container.setInteractive(new Phaser.Geom.Rectangle(-40, -30, 80, 60), Phaser.Geom.Rectangle.Contains);
    scene.input.setDraggable(container);
    container.setData('type', type);
    
    // Запоминаем начальную позицию
    container.input = { dragStartX: x, dragStartY: y };
    
    // Подпись
    scene.add.text(x, y + 50, label, {
        fontFamily: 'Arial',
        fontSize: isMobile ? '16px' : '18px',
        fill: '#ffffff',
        fontWeight: 'bold',
        backgroundColor: parseInt(color.replace('#', '0x')),
        padding: { x: 10, y: 5 },
        borderRadius: 5
    })
    .setOrigin(0.5)
    .setDepth(11);
    
    // Отладочная информация
    console.log(`Created equipment: ${type} at (${x}, ${y})`);
    
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
        ).setOrigin(0.5).setDepth(20);
    }
}

function update() {}