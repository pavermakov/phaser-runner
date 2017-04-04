import Phaser from 'phaser';

export default class extends Phaser.State {
  init() {
    this.stage.backgroundColor = 'black';
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.physics.setBoundsToWorld();
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    // игра не остановится когда canvas потеряет фокус
    this.stage.disableVisibilityChange = false;
  }

  preload() {
    // подгрузи ассеты для загрузочного экрана здесь
    this.load.image('bar', 'assets/images/preloader-bar.png');
  }

  create() {
    this.state.start('Preload');
  }
}
