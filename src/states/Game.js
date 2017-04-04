/* globals __DEV__ */
import Phaser from 'phaser';

export default class extends Phaser.State {
  init() {
    this.gameData = {
      gameVelocity: 350,
      wallSpawnPoints: [
        { x: this.game.world.width * 0.25 - 25, y: -20 },
        { x: this.game.world.centerX, y: -20 },
        { x: this.game.world.width * 0.75 + 25, y: -20 },
      ],
      playerSpawnPoints: [
        { x: this.game.world.width * 0.25 - 25, y: this.game.world.height - 25 },
        { x: this.game.world.centerX, y: this.game.world.height - 25 },
        { x: this.game.world.width * 0.75 + 25, y: this.game.world.height - 25 },
      ],
      currentPlayerPoint: 1,
      isInputDown: false,
      isGamePaused: false,
      score: 0,
      textStyle: {
        font: '20px Arial',
        fill: '#fff',
        boundsAlignH: 'middle'
      },
      totalAttempts: localStorage.getItem('totalAttempts'),
      lastPlayed: localStorage.getItem('lastPlayed'),
    };

    const now = new Date();
    const dayNow = now.getDate();
    const monthNow = now.getMonth();

    if (!this.gameData.lastPlayed) {
      localStorage.setItem('lastPlayed', JSON.stringify({ dayParsed: dayNow, monthParsed: monthNow }));
    } else {
      const { dayParsed, monthParsed } = JSON.parse(this.gameData.lastPlayed);
      if (dayNow !== dayParsed || monthNow !== monthParsed) {
        localStorage.setItem('totalAttempts', 0);
      }
    }

    if (!this.gameData.totalAttempts) {
      this.gameData.totalAttempts = 0;
    }

    this.game.add.tween(this.game.world).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true);
  }

  create() {
    const bgWidth = this.game.cache.getImage('background').width;
    this.background = this.game.add.tileSprite(0, 0, bgWidth, this.game.world.height, 'background');
    this.background.scale.x = this.game.world.width / bgWidth;
    this.background.autoScroll(0, this.gameData.gameVelocity);

    // игрок
    const playerSpawnX = this.gameData.playerSpawnPoints[this.gameData.currentPlayerPoint].x;
    const playerSpawnY = this.gameData.playerSpawnPoints[this.gameData.currentPlayerPoint].y;
    this.player = this.game.add.sprite(playerSpawnX, playerSpawnY, 'player');
    this.game.physics.arcade.enable(this.player);
    this.player.anchor.setTo(0.5);
    this.player.body.collideWorldBounds = true;

    // стены
    this.walls = this.game.add.group();
    this.walls.enableBody = true;

    // кнопка паузы
    this.pause = this.game.add.button(this.game.world.width - 50, 50, 'pause', this._pauseGame, this);
    this.pause.anchor.setTo(0.5);
    this.pause.alpha = '0.3';

    // кнопка контроля звука
    this.soundControl = this.game.add.button(this.game.world.width - 140, 50, 'soundControl', this._toggleSound, this);
    this.soundControl.frame = this.game.sound.mute ? 1 : 0;
    this.soundControl.anchor.setTo(0.5);
    this.soundControl.alpha = '0.3';

    // счётчик очков
    this.miles = this.game.add.text(10, 10, `MILES PASSED: ${this.gameData.score}`, this.gameData.textStyle);

    // таймер, контролирующий появление стен
    this._createWall();
    this.wallTimer = this.game.time.create(false);
    this.wallTimer.loop(Phaser.Timer.SECOND, this._createWall, this);
    this.wallTimer.start();

    // таймер контролирующий скорость игры
    this.gameTimer = this.game.time.create(false);
    this.gameTimer.loop(Phaser.Timer.SECOND * 5, this._levelUp, this);
    this.gameTimer.start();
  }

  update() {
    this.game.physics.arcade.overlap(this.player, this.walls, this._handleOverlap, null, this);

    // управление
    if (this.game.input.activePointer.isDown && !this.gameData.isInputDown && !this.gameData.isGamePaused && this._isInClickableArea()) {
      this.gameData.isInputDown = true;
      var targetX = this.game.input.activePointer.position.x;

      if (targetX > this.gameData.playerSpawnPoints[this.gameData.currentPlayerPoint].x && this.gameData.currentPlayerPoint < 2) {
        this.gameData.currentPlayerPoint++;
      } else if (targetX < this.gameData.playerSpawnPoints[this.gameData.currentPlayerPoint].x && this.gameData.currentPlayerPoint > 0) {
        this.gameData.currentPlayerPoint--;
      }

      this.playerMovement = this.game.add.tween(this.player).to({ x: this.gameData.playerSpawnPoints[this.gameData.currentPlayerPoint].x }, 120, 'Back.easeOut', true);
    }

    if (this.game.input.activePointer.isUp && !this.gameData.isGamePaused) {
      this.gameData.isInputDown = false;
    }
  }

  _isInClickableArea() {
    return this.game.input.activePointer.position.y > this.pause.bottom;
  }

  _createWall() {
    let spawnSpot = this.game.rnd.pick(this.gameData.wallSpawnPoints);

    let wall = this.walls.getFirstExists(false);

    if (!wall) {
      wall = this.walls.create(spawnSpot.x, spawnSpot.y, 'wall');
    } else {
      wall.reset(spawnSpot.x, spawnSpot.y);
    }

    wall.anchor.setTo(0.5);
    wall.width = this.game.world.width * 0.25;
    wall.body.velocity.y = this.gameData.gameVelocity;
    wall.checkWorldBounds = true;
    wall.events.onOutOfBounds.add(this._destroyWall, this);
  }

  _destroyWall(wall) {
    this.gameData.score++;
    this.miles.setText(`MILES PASSED: ${this.gameData.score}`);
    wall.kill();
  }

  _handleOverlap(player, wall) {
    if (player.y > wall.top) {
      if (this.playerMovement) {
        this.playerMovement.stop();
      }

      this._gameOver();
    }
  }

  _levelUp() {
    if (this.walls.children.length < 6) {
      this.wallTimer.events[0].delay *= 0.85;
      this.gameData.gameVelocity *= 1.1;
    } else {
      this.gameData.gameVelocity *= 1.1;
    }

    this.walls.setAll('body.velocity.y', this.gameData.gameVelocity);
    this.background.autoScroll(0, this.gameData.gameVelocity);
  }

  _pauseGame() {
    if (!this.gameData.isGamePaused) {
      this._pauseWorld();

      const bmd = this.game.add.bitmapData(this.game.world.width, this.game.world.height);
      bmd.fill(0, 0, 0, 0.7);

      const pauseText = this.game.make.text(this.game.world.centerX, this.game.world.centerY, `PAUSED\nTAP TO CONTINUE`, this.gameData.textStyle);
      pauseText.anchor.setTo(0.5);
      bmd.draw(pauseText);

      const overlay = this.game.add.sprite(0, -this.game.world.height, bmd);

      this.game.add.tween(overlay).to({ y: 0 }, 1000, Phaser.Easing.Bounce.Out, true);

      this.game.time.events.add(Phaser.Timer.SECOND, () => {
        this.game.input.onDown.addOnce(this._applyTransition, this, null, overlay, { y: -this.game.world.height }, 500, Phaser.Easing.Linear.None, true, this._resumeWorld, this);
      }, this);
    }
  }

  _pauseWorld() {
    this.gameData.isGamePaused = true;
    this.background.stopScroll();
    this.walls.setAll('body.enable', false);
    this.wallTimer.pause();
    this.gameTimer.pause();
  }

  _resumeWorld() {
    this.gameData.isGamePaused = false;
    this.background.autoScroll(0, this.gameData.gameVelocity);
    this.walls.setAll('body.enable', true);
    this.wallTimer.resume();
    this.gameTimer.resume();
  }

  _gameOver() {
    this.game.camera.shake(0.015, 150);
    this._pauseWorld();

    localStorage.setItem('totalAttempts', ++this.gameData.totalAttempts);

    const bmd = this.game.add.bitmapData(this.game.world.width, this.game.world.height);
    bmd.fill(0, 0, 0, 0.7);

    const scoreText = this.game.make.text(10, 10, `MILES PASSED: ${this.gameData.score}`, this.gameData.textStyle);
    bmd.draw(scoreText);

    const attemptsText = this.game.make.text(10, 40, `TOTAL ATTEMPTS: ${this.gameData.totalAttempts}`, this.gameData.textStyle);
    bmd.draw(attemptsText);

    const playAgainText = this.game.make.text(this.game.world.centerX, this.game.world.centerY + 20, 'TAP TO PLAY AGAIN', this.gameData.textStyle);
    playAgainText.anchor.setTo(0.5);
    bmd.draw(playAgainText);

    const gameOverText = this.game.make.text(this.game.world.centerX, this.game.world.centerY - 20, 'GAME OVER', this.gameData.textStyle);
    gameOverText.anchor.setTo(0.5);
    bmd.draw(gameOverText);

    const overlay = this.game.add.sprite(0, -this.game.world.height, bmd);

    this.game.add.tween(overlay).to({ y: 0 }, 1000, Phaser.Easing.Bounce.Out, true);

    this.game.time.events.add(Phaser.Timer.SECOND, () => {
      this.game.input.onDown.addOnce(this._applyTransition, this, null, this.game.world, { alpha: 0 }, 300, Phaser.Easing.Linear.None, true, this._restartGame, this);
    }, this);
  }

  _toggleSound() {
    this.game.sound.mute = !this.game.sound.mute;
    this.soundControl.frame = this.game.sound.mute ? 1 : 0;
  }

  _applyTransition(pointer, e, target, data, time, easing, selfStart, callback, context) {
    const transition = this.game.add.tween(target).to(data, time, easing, selfStart);

    if (callback) {
      transition.onComplete.add(callback, context);
    }
  }

  _restartGame() {
    this.game.state.start('Game');
  }
}
