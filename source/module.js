'use strict';

var app = angular.module('appFrame', ['ui.router', 'btford.socket-io']);

app.config(function($stateProvider, $urlRouterProvider){
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('home', {url: '/', templateUrl: 'views/home/home.html', controller: 'homeCtrl' })
    .state('game', {url: '/game', templateUrl: 'views/gameGrid/grid.html', controller: 'gameCtrl'})
});





