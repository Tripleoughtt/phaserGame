
'use strict';

var PORT = process.env.PORT || 3000;

var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var http = require('http')
var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://127.0.0.1/scaffold');
app.set('views', 'templates')
app.set('view engine', 'jade');


//SOCKETS
var players = [];
var messages = [];
io.on('connection', function(client){
    // Listen for client disconnected
  onSocketConnection()
  client.on('disconnect', onClientDisconnect)

  // Listen for new player message
  client.on('new player', onNewPlayer)

  // Listen for move player message
  client.on('move player', onMovePlayer)
  console.log('socket connected')
  client.emit('message', {messages: messages})
  client.on('sending', function(data){
    messages.push(data.messageText)
    console.log(messages)
    io.emit('messageRecieved', data)
  });

  client.on('joined', function(playerData){
    console.log(playerData);
  })
});
// GENERAL MIDDLEWARE
app.use(morgan('dev'));
app.use(bodyParser.urlencoded( {extended: true} ));
app.use(bodyParser.json());
app.use(express.static('public'));

// ROUTES
app.use('/', function(req, res){
  res.render('index')
});

// 404 HANDLER
app.use(function(req, res){
  res.status(404).render('404')
})




// var setEventHandlers = function () {
//   // Socket.IO
//   socket.sockets.on('connection', onSocketConnection)
// }

// New socket connection
function onSocketConnection (client) {


}

// Socket client has disconnected
function onClientDisconnect () {
  // util.log('Player has disconnected: ' + this.id)

  var removePlayer = playerById(this.id)

  // Player not found
  if (!removePlayer) {
    //util.log('Player not found: ' + this.id)
    return
  }

  // Remove player from players array
  players.splice(players.indexOf(removePlayer), 1)

  // Broadcast removed player to connected socket clients
  this.broadcast.emit('remove player', {id: this.id})
}

// New player has joined
function onNewPlayer (data) {
  // Create a new player
  console.log('New Player Joined')
  var newPlayer = new Player(data.x, data.y)
  newPlayer.id = this.id

  // Broadcast new player to connected socket clients
  this.broadcast.emit('new player', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()})

  // Send existing players to the new player
  var i, existingPlayer
  for (i = 0; i < players.length; i++) {
    existingPlayer = players[i]
    this.emit('new player', {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()})
  }

  // Add new player to the players array
  players.push(newPlayer)
}

// Player has moved
function onMovePlayer (data) {
  // Find player in array
  console.log(data)
  var movePlayer = playerById(this.id)

  // Player not found
  if (!movePlayer) {
    //util.log('Player not found: ' + this.id)
    return
  }

  // Update player position
  movePlayer.setX(data.x)
  movePlayer.setY(data.y)

  // Broadcast updated position to connected socket clients
  this.broadcast.emit('move player', {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()})
}

/* ************************************************
** GAME HELPER FUNCTIONS
************************************************ */
// Find player by ID
function playerById (id) {
  var i
  for (i = 0; i < players.length; i++) {
    if (players[i].id === id) {
      return players[i]
    }
  }

  return false
}

var Player = function (startX, startY) {
  var x = startX
  var y = startY
  var id

  // Getters and setters
  var getX = function () {
    return x
  }

  var getY = function () {
    return y
  }

  var setX = function (newX) {
    x = newX
  }

  var setY = function (newY) {
    y = newY
  }

  // Define which variables and methods can be accessed
  return {
    getX: getX,
    getY: getY,
    setX: setX,
    setY: setY,
    id: id
  }
}


server.listen(PORT, function(){
  console.log('Listening on port ', PORT);
});







