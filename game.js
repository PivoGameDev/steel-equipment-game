// Конфигурация игры
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

// Загрузка изображений
function preload() {
    this.load.image('background', 'assets/images/background.png');
    this.load.image('tank', 'assets/images/tank.png');    // Оборудование
    this.load.image('slot', 'assets/images/slot.png');    // Слот для размещения
}

// Создание уровня
function create() {
    // 1. Добавляем фон
    this.add.image(400, 300, 'background');

    // 2. Создаем слот для оборудования (куда нужно перетащить танк)
    const slot = this.add.image(500, 300, 'slot')
        .setData('type', 'tank');  // Помечаем, что слот для танка

    // 3. Создаем перетаскиваемый танк
    const tank = this.add.image(200, 300, 'tank')
        .setInteractive()
        .setScale(0.7);

    // 4. Включаем перетаскивание
    this.input.setDraggable(tank);

    // 5. Обработка перетаскивания
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    // 6. Проверка, попал ли танк в слот
    this.input.on('dragend', (pointer, gameObject) => {
        if (Phaser.Geom.Intersects.RectangleToRectangle(
            gameObject.getBounds(),
            slot.getBounds()
        )) {
            // Танк в слоте — фиксируем его
            gameObject.x = slot.x;
            gameObject.y = slot.y;
            this.add.text(300, 100, 'Успех!', { 
                fontSize: '40px', 
                fill: '#0f0',
                fontFamily: 'Arial'
            });
        }
    });
}