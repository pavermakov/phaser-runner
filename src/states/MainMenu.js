import Phaser from 'phaser'

export default class extends Phaser.State {
  create() {
    this.logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
    this.logo.scale.setTo(0.5);
    this.logo.anchor.setTo(0.5);
    
    this.game.input.onDown.add(this._applyTransition, this);
  }

  _applyTransition() {
    this.game.add.tween(this.game.world).to({ alpha: 0 }, 300, Phaser.Easing.Linear.None, true).onComplete.add(this._startGame, this);
  }

  _startGame() {
    this.game.state.start('Game');
  }
}
