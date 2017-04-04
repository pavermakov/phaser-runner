import Phaser from 'phaser';

export default class extends Phaser.State {
  preload() {
    // индикатор загрузки ассетов
    this.bar = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'bar');
    this.bar.anchor.setTo(0.5);

    // подгрузи ассеты для всей игры здесь
    this.load.image('logo', 'assets/images/logo.png');
    this.load.image('background', 'assets/images/road.png');
    this.load.image('player', 'assets/images/player.png');
    this.load.image('wall', 'assets/images/wall.png');
    this.load.image('pause', 'assets/images/pause.png');

    this.load.spritesheet('soundControl', 'assets/images/soundControl.png', 70, 70);

    this.load.setPreloadSprite(this.bar);
    
    this.load.onLoadComplete.add(() => {
      this.game.state.start('Menu');
    }, this);
  }
}
