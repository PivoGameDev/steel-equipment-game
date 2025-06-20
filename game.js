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

function preload() {
    // 1. Загрузка изображений (оставьте ваши текущие пути)
    this.load.image('background', 'assets/images/background.png');
    this.load.image('tank', 'assets/images/tank.png');
    this.load.image('pump', 'assets/images/pump.png');
    this.load.image('slot', 'assets/images/slot.png');
    
    // 2. Загрузка звуков (добавьте эти строки)
    this.load.audio('success', [
        'assets/sounds/success.mp3',  // Основной формат
        'assets/sounds/success.ogg'   // Резервный формат
    ]);
    this.load.audio('error', [
        'assets/sounds/error.mp3',
        'assets/sounds/error.ogg'
    ]);
    
    // Для случаев, если есть только MP3:
    // this.load.audio('success', 'assets/sounds/success.mp3');
    // this.load.audio('error', 'assets/sounds/error.mp3');
}

function create() {
    // 1. Добавляем текст задания
    const taskText = this.add.text(50, 30, 
        'Перетащите ТАНК на схему', 
        { 
            fontFamily: 'Arial', 
            fontSize: '24px', 
            fill: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        }
    );

    // 2. Создаем слот (только для танка)
    const slot = this.add.image(600, 300, 'slot')
        .setData('correctType', 'tank');  // Помечаем правильный тип

    // 3. Создаем оборудование
    const tank = this.add.image(200, 300, 'tank')  // Правильное
        .setInteractive()
        .setScale(0.7)
        .setData('isCorrect', true);  // Помечаем как верный объект

    const pump = this.add.image(200, 150, 'pump')  // Неправильное
        .setInteractive()
        .setScale(0.7)
        .setData('isCorrect', false);

    // 4. Включаем перетаскивание
    this.input.setDraggable(tank);
    this.input.setDraggable(pump);

    // 5. Обработка перетаскивания
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    // 6. Проверка при отпускании
    this.input.on('dragend', (pointer, gameObject) => {
        // Проверяем пересечение со слотом И правильный тип
        if (Phaser.Geom.Intersects.RectangleToRectangle(
            gameObject.getBounds(),
            slot.getBounds()
        )) {
            if (gameObject.texture.key === slot.getData('correctType')) {
                // Правильно!
                gameObject.x = slot.x;
                gameObject.y = slot.y;
                this.add.text(300, 100, 'Успех! Танк установлен!', { 
                    fontSize: '32px', 
                    fill: '#0f0',
                    fontFamily: 'Arial'
                });
            } else {
                // Неправильно
                this.add.text(250, 100, 'Ошибка! Это не танк!', { 
                    fontSize: '32px', 
                    fill: '#f00',
                    fontFamily: 'Arial'
                });
                // Возвращаем объект на место
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        }
    });
}