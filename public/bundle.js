'use strict';

var app = angular.module('appFrame', ['ui.router', 'btford.socket-io']);

app.config(function($stateProvider, $urlRouterProvider){
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('home', {url: '/', templateUrl: 'views/home/home.html', controller: 'homeCtrl' })
    .state('game', {url: '/game', templateUrl: 'views/gameGrid/grid.html', controller: 'gameCtrl'})
});






/* global game */

var RemotePlayer = function (index, game, player, startX, startY) {
  var x = startX
  var y = startY

  this.game = game
  this.health = 3
  this.player = player
  this.alive = true

  this.player = game.add.sprite(x, y, 'char')

  // this.player.animations.add('move', [0, 1, 2, 3, 4, 5, 6, 7], 20, true)
  // this.player.animations.add('stop', [3], 20, true)

  //this.player.anchor.setTo(0.5, 0.5)

  this.player.name = index.toString()
  //this.player.body.immovable = true
  //this.player.body.collideWorldBounds = true
  //this.player.body.bounce.y = 0.2;
  //this.player.body.gravity.y = 300;
  

  this.lastPosition = { x: x, y: y }
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

'use strict';

angular.module('appFrame')
.factory('socket', function(socketFactory){
  var socket = io()
  return socketFactory({
    ioSocket: socket
  });
})
.controller('homeCtrl', function($scope, socket){
  console.log('homeCtrl');
  //var socket = io();
  socket.on('message', function(data) {
    console.log(data.messages)
    $scope.messages = data.messages
    
  })
  var numPlayers= [];
  $scope.char= {};
  $scope.messages = [];
  $scope.$watchCollection('messages', function(newMessages, oldMessages){
    $scope.messages = newMessages
  })
  socket.on('messageRecieved', function(message){
    $scope.messages.push(message.messageText)
      console.log($scope.messages)
  })

  $scope.sendMessage = function(message){
    console.log(message)
    socket.emit('sending', {messageText: message})
  }
  $scope.meleeChar = function() {
    $scope.char.health = 10;
    $scope.char.attack  = 3;
    $scope.char.range = 1;
    $scope.char.moves = 10;
  }
  $scope.rangedChar = function() {
    $scope.char.health = 5;
    $scope.char.attack  = 2;
    $scope.char.range = 16;
    $scope.char.moves = 3;
  }
  $scope.login = function(username) {
    if ($scope.char) {
      socket.emit('joined', $scope.char)
      numPlayers.push(username);
      if (numPlayers.length >= 2) {
        console.log('ready w 2')
      }
    }
  }
});
console.log('hello')
