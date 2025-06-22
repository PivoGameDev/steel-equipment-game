const config = {
    type: Phaser.AUTO,
    width: window.innerWidth * 0.9, // 90% ширины экрана (бортики)
    height: window.innerHeight * 0.85, // 85% высоты экрана
    parent: 'game',
    backgroundColor: '#1a1a2e',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// Глобальные переменные
let timerText, taskText, successText, errorText;
let timerEvent;
let timeLeft = 60; // 60 секунд на уровень
let equipmentPanel;
let selectedObject = null;

function preload() {
    // Загрузка изображений
    this.load.image('background', 'assets/images/background.png');
    this.load.image('tank', 'assets/images/tank.png');
    this.load.image('fermentator', 'assets/images/fermentator.png'); // Переименовано!
    this.load.image('slot', 'assets/images/slot.png');
    
    // Загрузка звуков
    this.load.audio('success', 'assets/sounds/success.mp3');
    this.load.audio('error', 'assets/sounds/error.mp3');
}

function create() {
    this.sound.pauseOnBlur = false;

    // === 1. ВЕРХНЯЯ ПАНЕЛЬ: ЗАДАНИЕ И ТАЙМЕР ===
    // Рамка верхней панели
    this.add.rectangle(config.width / 2, 40, config.width, 80, 0x16213e).setDepth(0);
    
    // Текст задания
    taskText = this.add.text(
        config.width / 2, 
        25, 
        'ЗАМЕНИТЕ НАСОС НА ФЕРМЕНТАТОР', 
        {
            fontFamily: 'Arial',
            fontSize: '20px',
            fill: '#ffffff',
            align: 'center'
        }
    ).setOrigin(0.5, 0);
    
    // Таймер
    timerText = this.add.text(
        config.width / 2, 
        55, 
        `ВРЕМЯ: ${timeLeft} СЕК`, 
        {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#f8f8f8',
            backgroundColor: '#e94560',
            padding: { x: 15, y: 5 }
        }
    ).setOrigin(0.5, 0);
    
    // Запуск таймера
    timerEvent = this.time.addEvent({
        delay: 1000, // 1 секунда
        callback: updateTimer,
        callbackScope: this,
        loop: true
    });

    // === 2. ЦЕНТРАЛЬНАЯ ПАНЕЛЬ: ИГРОВАЯ ПЛОЩАДКА ===
    // Фон (игровая площадка)
    const gameArea = this.add.rectangle(
        config.width / 2, 
        config.height / 2 - 20, 
        config.width * 0.9, 
        config.height * 0.5, 
        0x0f3460
    ).setDepth(0);
    
    // Слот для оборудования
    const slot = this.add.image(
        config.width / 2, 
        config.height / 2 - 20, 
        'slot'
    ).setData('correctType', 'fermentator');
    
    // Текущее оборудование (насос, который нужно заменить)
    this.add.image(
        config.width / 2 - 150, 
        config.height / 2 - 20, 
        'fermentator' // Здесь должен быть насос, но у нас его нет, используем ферментатор
    ).setScale(0.6);

    // === 3. НИЖНЯЯ ПАНЕЛЬ: ВЫБОР ОБОРУДОВАНИЯ ===
    // Фон панели
    equipmentPanel = this.add.rectangle(
        config.width / 2, 
        config.height - 70, 
        config.width, 
        140, 
        0x16213e
    ).setDepth(0);
    
    // Оборудование для выбора
    const tank = createEquipmentItem(this, config.width * 0.3, config.height - 70, 'tank', 'Танк');
    const fermentator = createEquipmentItem(this, config.width * 0.5, config.height - 70, 'fermentator', 'Ферментатор');
    const pump = createEquipmentItem(this, config.width * 0.7, config.height - 70, 'fermentator', 'Насос'); // Заглушка
    
    // === ФУНКЦИИ ДЛЯ ПЕРЕТАСКИВАНИЯ ===
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        if (successText) successText.destroy();
        if (errorText) errorText.destroy();
        
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject) => {
        if (Phaser.Geom.Intersects.RectangleToRectangle(
            gameObject.getBounds(),
            slot.getBounds()
        )) {
            if (gameObject.texture.key === slot.getData('correctType')) {
                // Правильно
                this.sound.play('success');
                gameObject.x = slot.x;
                gameObject.y = slot.y;
                successText = this.add.text(
                    config.width / 2, 
                    config.height / 2 - 100, 
                    'УСПЕХ!', 
                    {
                        fontSize: '32px', 
                        fill: '#0f0',
                        fontFamily: 'Arial',
                        backgroundColor: '#333333',
                        padding: { x: 20, y: 10 }
                    }
                ).setOrigin(0.5);
                
                // Уровень пройден!
                this.time.delayedCall(2000, () => {
                    this.add.text(
                        config.width / 2, 
                        config.height / 2, 
                        'УРОВЕНЬ ПРОЙДЕН!', 
                        {
                            fontSize: '40px', 
                            fill: '#4ecca3',
                            fontFamily: 'Arial'
                        }
                    ).setOrigin(0.5);
                    timerEvent.remove();
                }, null, this);
            } else {
                // Неправильно
                this.sound.play('error');
                errorText = this.add.text(
                    config.width / 2, 
                    config.height / 2 - 100, 
                    'ОШИБКА!', 
                    {
                        fontSize: '32px', 
                        fill: '#f00',
                        fontFamily: 'Arial',
                        backgroundColor: '#333333',
                        padding: { x: 20, y: 10 }
                    }
                ).setOrigin(0.5);
                
                // Возврат на панель
                this.tweens.add({
                    targets: gameObject,
                    x: gameObject.input.dragStartX,
                    y: gameObject.input.dragStartY,
                    duration: 500
                });
            }
        } else {
            // Возврат если не попал в слот
            this.tweens.add({
                targets: gameObject,
                x: gameObject.input.dragStartX,
                y: gameObject.input.dragStartY,
                duration: 300
            });
        }
    });
}

// Создание элемента оборудования для панели
function createEquipmentItem(scene, x, y, texture, label) {
    const item = scene.add.image(x, y - 20, texture)
        .setInteractive()
        .setScale(0.5);
    
    scene.input.setDraggable(item);
    
    // Подпись оборудования
    scene.add.text(x, y + 20, label, {
        fontFamily: 'Arial',
        fontSize: '16px',
        fill: '#ffffff',
        align: 'center'
    }).setOrigin(0.5);
    
    return item;
}

// Обновление таймера
function updateTimer() {
    timeLeft--;
    timerText.setText(`ВРЕМЯ: ${timeLeft} СЕК`);
    
    if (timeLeft <= 0) {
        timerEvent.remove();
        this.add.text(
            config.width / 2, 
            config.height / 2, 
            'ВРЕМЯ ВЫШЛО!', 
            {
                fontSize: '40px', 
                fill: '#e94560',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5);
    }
}

function update() {
    // Логика обновления кадра (пока пустая)
}