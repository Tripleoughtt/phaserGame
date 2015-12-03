/* global game */

var RemotePlayer = function (index, game, player, startX, startY, bullets) {
  var x = startX
  var y = startY

  this.game = game
  this.health = 3
  this.player = player
  this.alive = true

  //this.player.body.collide(bullets)
  //game.physics.arcade.overlap(this.player, bullets, damagePlayer, null, this)

  this.player = game.add.sprite(x, y, 'char')

  // this.player.animations.add('move', [0, 1, 2, 3, 4, 5, 6, 7], 20, true)
  // this.player.animations.add('stop', [3], 20, true)

  //this.player.anchor.setTo(0.5, 0.5)

  this.player.name = index.toString()
  //this.player.body.immovable = true
  //this.player.body.collideWorldBounds = true
  //this.player.body.bounce.y = 0.2;
  //this.player.body.gravity.y = 300;
  
  game.physics.enable(this.player, Phaser.Physics.ARCADE);
  this.lastPosition = { x: x, y: y }
}

RemotePlayer.prototype.damage = function() {

    this.health -= 1;

    if (this.health <= 0)
    {
        this.alive = false;

        this.player.kill();


        return true;
    }

    return false;

}

RemotePlayer.prototype.update = function () {
  if (this.player.x !== this.lastPosition.x || this.player.y !== this.lastPosition.y) {
    this.player.play('move')
    //this.player.rotation = Math.PI + game.physics.angleToXY(this.player, this.lastPosition.x, this.lastPosition.y)
  } else {
    this.player.play('stop')
  }

  this.lastPosition.x = this.player.x
  this.lastPosition.y = this.player.y
}

window.RemotePlayer = RemotePlayer