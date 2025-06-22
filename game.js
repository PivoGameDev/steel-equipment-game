const isMobile = window.innerWidth < 768;

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#0a1929',
    scene: {
        preload: preload,
        create: create
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

function preload() {
    // Загрузка ваших изображений
    this.load.image('tank', 'assets/images/tank.png');
    this.load.image('bgv', 'assets/images/bgv.png');
}

function create() {
    // Отключим все сложные элементы - только самое необходимое
    console.log("Создание элементов перетаскивания...");
    
    // Создаем элементы оборудования
    createDraggableItem(this, 200, 500, 'tank', 'ЦКТ');
    createDraggableItem(this, 600, 500, 'bgv', 'БГВ');
    
    // Создаем слот
    const slot = this.add.rectangle(600, 300, 120, 120, 0x4ecca3, 0.3)
        .setStrokeStyle(3, 0xffffff);
    
    this.add.text(600, 370, 'СЛОТ ДЛЯ ЦКТ', {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: '#ffffff',
        backgroundColor: '#4ecca3',
        padding: 10
    }).setOrigin(0.5);
    
    // Логика перетаскивания
    this.input.on('dragend', (pointer, gameObject) => {
        if (Phaser.Geom.Intersects.RectangleToRectangle(
            gameObject.getBounds(),
            slot.getBounds()
        )) {
            if (gameObject.getData('type') === 'tank') {
                alert('УСПЕХ! Правильно установлен ЦКТ');
            } else {
                alert('ОШИБКА! Это БГВ, а не ЦКТ');
                // Возвращаем на место
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        } else {
            // Возвращаем на место
            gameObject.x = gameObject.input.dragStartX;
            gameObject.y = gameObject.input.dragStartY;
        }
    });
}

function createDraggableItem(scene, x, y, type, label) {
    // Создаем спрайт
    const sprite = scene.add.sprite(x, y, type)
        .setDisplaySize(100, 100)
        .setInteractive();
    
    // Устанавливаем данные
    sprite.setData('type', type);
    
    // Делаем перетаскиваемым
    scene.input.setDraggable(sprite);
    
    // Запоминаем начальную позицию
    sprite.input.dragStartX = x;
    sprite.input.dragStartY = y;
    
    // Подпись
    scene.add.text(x, y + 70, label, {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: '#ffffff',
        backgroundColor: (type === 'tank') ? '#3498db' : '#4ecca3',
        padding: 10
    }).setOrigin(0.5);
    
    // Отладочное сообщение
    console.log(`Создан элемент: ${type} на позиции (${x}, ${y})`);
    
    return sprite;
}