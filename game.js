const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config);

// Загрузка ресурсов
function preload() {
    // 1. Изображения
    this.load.image('background', 'assets/images/background.png');
    this.load.image('tank', 'assets/images/tank.png');
    this.load.image('pump', 'assets/images/pump.png');
    this.load.image('slot', 'assets/images/slot.png');
    
    // 2. Звуки (проверьте пути!)
    this.load.audio('success', 'assets/sounds/success.mp3');
    this.load.audio('error', 'assets/sounds/error.mp3');
}

// Создание игры
function create() {
    // 0. Важно для мобильных!
    this.sound.pauseOnBlur = false;

    // 1. Фон
    this.add.image(400, 300, 'background');

    // === ТЕСТОВАЯ КНОПКА (удалите после проверки) ===
    const testButton = this.add.text(50, 30, 'ТЕСТ ЗВУКОВ', {
        fontFamily: 'Arial',
        fontSize: '24px',
        fill: '#FFFF00',
        backgroundColor: '#333333',
        padding: { x: 10, y: 5 }
    })
    .setInteractive()
    .on('pointerdown', () => {
        this.sound.play('success');
        setTimeout(() => this.sound.play('error'), 1000);
    });

    // 2. Слот (только для танка)
    const slot = this.add.image(600, 300, 'slot')
        .setData('correctType', 'tank');

    // 3. Оборудование
    const tank = this.add.image(200, 300, 'tank')
        .setInteractive()
        .setScale(0.7);

    const pump = this.add.image(200, 150, 'pump')
        .setInteractive()
        .setScale(0.7);

    // 4. Включаем перетаскивание
    this.input.setDraggable(tank);
    this.input.setDraggable(pump);

    // 5. Логика перетаскивания (полностью сохранена)
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject) => {
        if (Phaser.Geom.Intersects.RectangleToRectangle(
            gameObject.getBounds(),
            slot.getBounds()
        )) {
            if (gameObject.texture.key === slot.getData('correctType')) {
                // Правильно: звук success + фиксация
                this.sound.play('success');
                gameObject.x = slot.x;
                gameObject.y = slot.y;
                this.add.text(300, 100, 'Успех!', { 
                    fontSize: '32px', 
                    fill: '#0f0',
                    fontFamily: 'Arial'
                });
            } else {
                // Ошибка: звук error + возврат
                this.sound.play('error');
                this.add.text(250, 100, 'Ошибка!', { 
                    fontSize: '32px', 
                    fill: '#f00',
                    fontFamily: 'Arial'
                });
                this.tweens.add({
                    targets: gameObject,
                    x: gameObject.input.dragStartX,
                    y: gameObject.input.dragStartY,
                    duration: 500
                });
            }
        }
    });
}