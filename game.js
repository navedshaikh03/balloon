const game = new Phaser.Game({
  type: Phaser.CANVAS,
  parent: 'game-container',
  width: 1400,
  height: 700,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
});

let balloons = [];
let pump;
let background;
let currentBalloon;
let isPumping = false;
let pumpCount = 0;
let balloonImages = ['balloon1', 'balloon2', 'balloon3'];

function preload() {
  this.load.image('balloon1', 'assets/balloon-a.png');
  this.load.image('balloon2', 'assets/balloon-b.png');
  this.load.image('balloon3', 'assets/balloon-c.png');
  this.load.image('pump', 'assets/pump.png');
  this.load.image('background', 'assets/background.png');
  this.load.image('wire', 'assets/wire.png');
}

function create() {
  background = this.add.sprite(0, 0, 'background');
  background.setScale(1.2);
  wire = this.add.sprite(910, 510, 'wire');
  wire.setScale(0.8);
  pump = this.add.sprite(1200, 500, 'pump');
  pump.setScale(0.2);
  pump.setInteractive({
    cursor: 'pointer',
    hitArea: new Phaser.Geom.Circle(0,0,0) 
  });
  pump.on('pointerdown', startPumping, this);

  this.physics.world.setBounds(0, 0, 1200, 700);
}

function startPumping() {
  if (!isPumping) {
    isPumping = true;
    let randomBalloonImage = Phaser.Math.RND.pick(balloonImages);
    currentBalloon = this.add.sprite(700, 400, randomBalloonImage);
    currentBalloon.setScale(0.1);
    this.physics.add.existing(currentBalloon);
    currentBalloon.body.moves = false;
    currentBalloon.body.immovable = true;
    currentBalloon.setInteractive({
      hitArea: new Phaser.Geom.Circle(5, 5, 5) 
    });
    this.tweens.add({
      targets: pump,
      // scale: 0.3,
      duration: 100,
      ease: 'Power2',
      yoyo: true,
      repeat: 0
    });
  }
  this.tweens.add({
    targets: pump,
    y: pump.y + 10, 
    duration: 100,
    ease: 'Power2',
    yoyo: true,
    repeat: 0
  });
  pumpCount++;

  if (pumpCount <= 3) {
    this.tweens.add({
      targets: currentBalloon,
      scale: 0.1 + (pumpCount * 0.1),
      duration: 100,
      ease: 'Power2',
      yoyo: false,
      repeat: 0
    });
    
  }

  if (pumpCount === 3) {
    detachBalloon.call(this);
  }
}

function detachBalloon() {
  isPumping = false;
  pumpCount = 0;

  this.tweens.add({
    targets: pump,
    // scale: 0.5,
    duration: 100,
    ease: 'Power2',
    yoyo: false,
    repeat: 0
  });

  currentBalloon.body.moves = true;
  currentBalloon.body.immovable = false;
  currentBalloon.body.velocity.x = Math.random() * 200 - 100;
  currentBalloon.body.velocity.y = Math.random() * 200 - 100; 

  currentBalloon.body.drag.x = 5;
  currentBalloon.body.drag.y = 5;

  balloons.push(currentBalloon);
  currentBalloon = null; // Reset currentBalloon to null
}
function update(time, delta) {
  for (let i = 0; i < balloons.length; i++) {
    let balloon = balloons[i];
    if (balloon.x < 0) {
      balloon.x = 0;
      balloon.body.velocity.x *= -1;
    } else if (balloon.x > 1400 - balloon.width) {
      balloon.x = 1400 - balloon.width;
      balloon.body.velocity.x *= -1;
    }
    if (balloon.y < 0) {
      balloon.y = 0;
      balloon.body.velocity.y *= -1;
    } else if (balloon.y > 700 - balloon.height) {
      balloon.y = 700 - balloon.height;
      balloon.body.velocity.y *= -1;
    }

    // Check if the balloon has been tapped
    if (!isPumping && this.input.activePointer.isDown) {
      let pointerX = this.input.activePointer.worldX;
      let pointerY = this.input.activePointer.worldY;
      if (balloon.getBounds().contains(pointerX, pointerY)) {
        balloon.tapped = true; // Set a flag to indicate that the balloon has been tapped
      }
    }

    // Check if the balloon has been tapped and burst it
    if (balloon.tapped) {
      burstBalloon.call(this, balloon);
      balloon.tapped = false; // Reset the flag
    }
  }
}
function burstBalloon(balloon) {
  console.log("Bursting balloon:", balloon);
  console.log(balloon)
  if (balloon) {
    // Remove the balloon from the game
    balloon.destroy();

    // Remove the balloon from the array
    let index = balloons.indexOf(balloon);
    if (index > -1) {
      balloons.splice(index, 1);
    }
  }
}