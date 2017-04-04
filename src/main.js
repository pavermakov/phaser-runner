import Phaser from 'phaser';
import BootState from './states/Boot';
import PreloadState from './states/Preload';
import MainMenuState from './states/MainMenu';
import GameState from './states/Game';

class Game extends Phaser.Game {

  constructor() {
    const gameWidth = window.innerWidth * window.devicePixelRatio;
    const gameHeight = window.innerHeight * window.devicePixelRatio;
    const docElement = document.documentElement;

    const width = docElement.clientWidth > gameWidth ? gameWidth : docElement.clientWidth;
    const height = docElement.clientHeight > gameHeight ? gameHeight : docElement.clientHeight;

    super(width, height, Phaser.CANVAS, 'content', null);

    this.state.add('Boot', BootState, false);
    this.state.add('Preload', PreloadState, false);
    this.state.add('Menu', MainMenuState, false);
    this.state.add('Game', GameState, false);

    this.state.start('Boot');
  }
}

window.game = new Game();
