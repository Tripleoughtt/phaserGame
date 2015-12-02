'use strict';

angular.module('appFrame')
.factory('socket', function(socketFactory){
  var socket = io()
  return socketFactory({
    ioSocket: socket
  });
})
.controller('gameCtrl', function($scope, socket){
  console.log('we on');
  var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

  function preload() {
    game.load.image('background', 'assets/background.png', 30, 20)
    game.load.image('platform', 'assets/platfrom.png')
    game.load.image('char', 'assets/archer.png', 32, 48);

  }
  var platforms;
  var player;
  var cursors;
  var enemies;
  var currentSpeed = 0

  function create() {
    var startX = Math.floor(Math.random() * (800))
    var startY = Math.floor(Math.random() * (600))
    // player = game.add.sprite(startX, startY, 'dude')

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(startX, startY, 'background');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var platform = platforms.create(0, game.world.height - 64, 'platform');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platform.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    platform.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'platform');

    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'platform');


    ledge.body.immovable = true;

    player = game.add.sprite(32, game.world.height - 150, 'char');

    game.physics.arcade.enable(player)
    player.body.bounce.y = 0.2
    player.body.gravity.y = 300
    player.body.collideWorldBounds = true

    cursors = game.input.keyboard.createCursorKeys();

    //player.animations.add('left', [8, 9, 10, 11, 12, 13, 14, 15], 15, true);
    //player.animations.add('right', [0, 1, 2, 3, 4, 5, 6, 7], 15, true);

    enemies = [];
    socket.emit('new player', { x: player.x, y: player.y })

    setEventHandlers()

  }

  function update() {


    socket.emit('move player', { x: player.body.x, y: player.body.y })

    game.physics.arcade.collide(player, platforms)

    player.body.velocity.x = 0;

    if(cursors.left.isDown){
      player.body.velocity.x = -150;
    } else if (cursors.right.isDown){
      player.body.velocity.x = 150
    } else if (cursors.up.isDown && player.body.touching.down){
      player.body.velocity.y = -350;
    }
  }

  //EVENT HANDLERS
  var setEventHandlers = function () {
  // Socket connection successful
  socket.on('connect', onSocketConnected)

  // Socket disconnection
  socket.on('disconnect', onSocketDisconnect)

  // New player message received
  socket.on('new player', onNewPlayer)

  // Player move message received
  socket.on('move player', onMovePlayer)

  // Player removed message received
  socket.on('remove player', onRemovePlayer)
}

function onSocketConnected () {
  console.log('Connected to socket server')

  // Send local player data to the game server
  socket.emit('new player', { x: player.x, y: player.y })
}

// Socket disconnected
function onSocketDisconnect () {
  console.log('Disconnected from socket server')
}

// New player
function onNewPlayer (data) {
  console.log('New player connected:', data.id)


  // Add new player to the remote players array
  enemies.push(new RemotePlayer(data.id, game, player, data.x, data.y))
}


function onRemovePlayer (data) {
  var removePlayer = playerById(data.id)

  // Player not found
  if (!removePlayer) {
    console.log('Player not found: ', data.id)
    return
  }

  removePlayer.player.kill()

  // Remove player from array
  enemies.splice(enemies.indexOf(removePlayer), 1)
}

function onMovePlayer (data) {
  var movePlayer = playerById(data.id)

  // Player not found
  if (!movePlayer) {
    console.log('Player not found: ', data.id)
    return
  }

  // Update player position
  movePlayer.player.x = data.x
  movePlayer.player.y = data.y
}

function playerById (id) {
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i].player.name === id) {
      return enemies[i]
    }
  }

  return false
}

});
console.log('hello')
