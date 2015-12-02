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
