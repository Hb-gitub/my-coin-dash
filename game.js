/* global Phaser, COIN_DASH */
class CoinDash extends Phaser.Scene {
  constructor() { super('CoinDash'); }

  create() {
    const c = COIN_DASH;
    this.score = 0;
    this.finished = false;
    this.paused = false;
    this.time.paused = false;
    this.deadline = this.time.now + c.roundSeconds * 1000;
    this.physics.world.setBounds(0, 44, c.width, c.height - 44);
    this.panel = null;
    this.grid = this.add.grid(c.width / 2, c.height / 2, c.width, c.height, 40, 40);
    this.hud = this.add.text(18, 12, '', { font: '18px monospace' });
    this.player = this.add.rectangle(c.width / 2, c.height / 2, 24, 24);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.coin = this.add.circle(100, 100, 9);
    this.physics.add.existing(this.coin);
    this.coin.body.setCircle(9);
    this.placeCoin();
    this.drones = this.physics.add.group();
    for (let i = 0; i < c.droneCount; i++) {
      const drone = this.add.rectangle(90 + i * 270, 100, 26, 26);
      this.drones.add(drone);
      drone.body.setCollideWorldBounds(true).setBounce(1, 1);
      const angle = (35 + i * 105) * Math.PI / 180;
      drone.body.setVelocity(Math.cos(angle) * c.droneSpeed, Math.sin(angle) * c.droneSpeed);
    }
    this.physics.add.overlap(this.player, this.coin, () => {
      if (this.finished) return;
      this.score++;
      this.placeCoin();
    });
    this.physics.add.overlap(this.player, this.drones, () => this.finish('A drone caught you!'));
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,R');
    this.input.keyboard.on('keydown-R', () => this.scene.restart());
    this.input.keyboard.on('keydown-P', () => this.togglePause());
    this.pauseBox = this.add.rectangle(0, 0, 300, 110);
    this.pauseText = this.add.text(0, 0, 'Paused\nPress P to resume',
      { font: '24px monospace', align: 'center', lineSpacing: 12 }).setOrigin(0.5);
    this.pauseOverlay = this.add.container(c.width / 2, c.height / 2, [this.pauseBox, this.pauseText])
      .setDepth(10).setVisible(false);
    // Plain D moves right (WASD), so the theme toggle is Shift+D.
    this.input.keyboard.on('keydown-D', event => {
      if (!event.shiftKey || event.repeat) return;
      COIN_DASH.theme = COIN_DASH.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme();
    });
    this.applyTheme();
  }

  togglePause() {
    if (this.finished) return;
    this.paused = !this.paused;
    if (this.paused) {
      // The scene clock keeps following wall time, so remember what is left of the round.
      this.remainingMs = this.deadline - this.time.now;
      this.physics.pause();
      this.tweens.pauseAll();
      this.time.paused = true;
    } else {
      this.deadline = this.time.now + this.remainingMs;
      this.physics.resume();
      this.tweens.resumeAll();
      this.time.paused = false;
    }
    this.pauseOverlay.setVisible(this.paused);
  }

  applyTheme() {
    const t = COIN_DASH.themes[COIN_DASH.theme];
    document.body.classList.toggle('light', COIN_DASH.theme === 'light');
    this.cameras.main.setBackgroundColor(t.background);
    this.grid.setFillStyle(t.background, 1).setOutlineStyle(t.grid, 0.45);
    this.hud.setColor(t.text);
    this.player.setFillStyle(t.player);
    this.coin.setFillStyle(t.coin);
    this.drones.getChildren().forEach(drone => drone.setFillStyle(t.drone));
    this.pauseBox.setFillStyle(t.panel, 0.9);
    this.pauseText.setColor(t.text);
    if (this.panel) {
      this.panel.setFillStyle(t.panel, 0.95);
      this.message.setColor(t.text);
    }
  }

  placeCoin() {
    const c = COIN_DASH;
    // Avoid spawning the next coin directly underneath the player.
    let x, y;
    do {
      x = Phaser.Math.Between(25, c.width - 25);
      y = Phaser.Math.Between(70, c.height - 25);
    } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 60);
    this.coin.setPosition(x, y);
    this.coin.body.reset(x, y);
  }

  update() {
    if (this.finished || this.paused) return;
    const dx = Number(this.cursors.right.isDown || this.keys.D.isDown)
      - Number(this.cursors.left.isDown || this.keys.A.isDown);
    const dy = Number(this.cursors.down.isDown || this.keys.S.isDown)
      - Number(this.cursors.up.isDown || this.keys.W.isDown);
    const direction = new Phaser.Math.Vector2(dx, dy).normalize().scale(COIN_DASH.playerSpeed);
    this.player.body.setVelocity(direction.x, direction.y);
    const seconds = Math.max(0, Math.ceil((this.deadline - this.time.now) / 1000));
    this.hud.setText(`Coins: ${this.score}                       Time: ${seconds}s`);
    if (seconds === 0) this.finish('Time is up!');
  }

  finish(reason) {
    if (this.finished) return;
    this.finished = true;
    this.physics.pause();
    const c = COIN_DASH;
    this.panel = this.add.rectangle(c.width / 2, c.height / 2, 460, 150);
    this.message = this.add.text(c.width / 2, c.height / 2,
      `${reason}\n${this.score} coins collected\nPress R to try again`,
      { font: '24px monospace', align: 'center', lineSpacing: 12 }
    ).setOrigin(0.5);
    this.applyTheme();
  }
}
window.coinDashGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: COIN_DASH.width,
  height: COIN_DASH.height,
  backgroundColor: COIN_DASH.themes[COIN_DASH.theme].background,
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
  scene: CoinDash
});
