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
    // Загрузка ваших изображений
    this.load.image('tank', 'assets/images/tank.png');
    this.load.image('bgv', 'assets/images/bgv.png');
    
    // Загрузка звуков
    this.load.audio('success', 'assets/sounds/success.mp3');
    this.load.audio('error', 'assets/sounds/error.mp3');
}

function create() {
    this.sound.pauseOnBlur = false;
    
    // === 1. ВЕРХНЯЯ ПАНЕЛЬ ===
    const headerBg = this.add.rectangle(
        config.width / 2, 30, config.width, 70, 0x16213e
    ).setDepth(10).setAlpha(0.92);
    
    // Текст задания
    taskText = this.add.text(
        config.width / 2, 10,
        'ПЕРЕТАЩИТЕ ЦКТ НА ПУСТОЙ СЛОТ', 
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

    // === 2. ПАНЕЛЬ ОБОРУДОВАНИЯ ===
    const panelBg = this.add.rectangle(
        config.width / 2, config.height - 60, 
        config.width, 130, 0x16213e
    ).setDepth(5).setAlpha(0.92);
    
    // Создаем элементы оборудования с вашими изображениями
    createEquipmentItem(this, config.width * 0.3, config.height - 60, 'tank', 'ЦКТ');
    createEquipmentItem(this, config.width * 0.7, config.height - 60, 'bgv', 'БГВ');

    // === 3. СЛОТ ДЛЯ ОБОРУДОВАНИЯ ===
    slot = this.add.rectangle(
        config.width * 0.7, config.height * 0.5, 
        120, 120, 0x4ecca3
    )
    .setDepth(15)
    .setAlpha(0.3)
    .setStrokeStyle(3, 0xffffff)
    .setData('correctType', 'tank'); // Правильный элемент - tank (ЦКТ)
    
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
        config.width * 0.7, config.height * 0.5 + 70, 
        'СЛОТ ДЛЯ ЦКТ', 
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
        gameObject.setDepth(20); // Поднимаем над всеми элементами
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
    this.add.graphics()
        .lineStyle(4, 0x4ecca3)
        .strokeRect(slot.x - 60, slot.y - 60, 120, 120)
        .setDepth(16);
    
    // Сообщение об успехе
    const successText = this.add.text(
        config.width / 2, config.height * 0.7, 
        'УСПЕХ! ЦКТ УСТАНОВЛЕН', 
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
            config.width / 2, config.height / 2, 
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
        config.width / 2, config.height * 0.7, 
        'ОШИБКА! ЭТО НЕ ЦКТ', 
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

// Создание элемента оборудования с изображением
function createEquipmentItem(scene, x, y, type, label) {
    // Создаем спрайт с изображением
    const sprite = scene.add.sprite(0, 0, type)
        .setDisplaySize(80, 80)
        .setDepth(10);
    
    // Контейнер для элемента
    const container = scene.add.container(x, y, [sprite])
        .setSize(100, 100)
        .setInteractive(new Phaser.Geom.Rectangle(-50, -50, 100, 100), Phaser.Geom.Rectangle.Contains)
        .setData('type', type);
    
    scene.input.setDraggable(container);
    
    // Запоминаем начальную позицию
    container.input = { dragStartX: x, dragStartY: y };
    
    // Подпись
    scene.add.text(x, y + 60, label, {
        fontFamily: 'Arial',
        fontSize: isMobile ? '16px' : '18px',
        fill: '#ffffff',
        fontWeight: 'bold',
        backgroundColor: (type === 'tank') ? '#3498db' : '#4ecca3',
        padding: { x: 10, y: 5 },
        borderRadius: 5
    }).setOrigin(0.5).setDepth(11);
    
    // Отладочное сообщение
    console.log(`Создан элемент: ${type} по координатам (${x}, ${y})`);
    
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
            config.width / 2, config.height / 2, 
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