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
    this.load.image('background', 'assets/images/background.png');
    this.load.image('tank', 'assets/images/tank.png');
    this.load.image('pump', 'assets/images/pump.png');
    this.load.image('slot', 'assets/images/slot.png');
    this.load.audio('success', 'assets/sounds/success.mp3');
    this.load.audio('error', 'assets/sounds/error.mp3');
}

function create() {
    this.sound.pauseOnBlur = false;
    this.add.image(400, 300, 'background');

    // 1. Текст правил (восстановленный)
    const ruleText = this.add.text(50, 30, 
        'ПЕРЕТАЩИТЕ ТАНК НА СХЕМУ\n(насос - неправильный объект)', 
        {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 15, y: 10 },
            align: 'center'
        }
    );

    // 2. Создаем переменные для текстовых сообщений
    let successText = null;
    let errorText = null;

    // 3. Слот и объекты
    const slot = this.add.image(600, 300, 'slot').setData('correctType', 'tank');
    const tank = this.add.image(200, 300, 'tank').setInteractive().setScale(0.7);
    const pump = this.add.image(200, 150, 'pump').setInteractive().setScale(0.7);

    this.input.setDraggable(tank);
    this.input.setDraggable(pump);

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
        
        // Удаляем старые сообщения при новом перетаскивании
        if (successText) successText.destroy();
        if (errorText) errorText.destroy();
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
                successText = this.add.text(300, 100, 'УСПЕХ!', { 
                    fontSize: '32px', 
                    fill: '#0f0',
                    fontFamily: 'Arial',
                    backgroundColor: '#333333'
                });
            } else {
                // Неправильно
                this.sound.play('error');
                errorText = this.add.text(300, 100, 'ОШИБКА!', { 
                    fontSize: '32px', 
                    fill: '#f00',
                    fontFamily: 'Arial',
                    backgroundColor: '#333333'
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