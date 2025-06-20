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
}

function create() {
    this.add.image(400, 300, 'background');
}