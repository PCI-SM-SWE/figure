'use strict';

angular.module('figureApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/react', {
        templateUrl: 'app/react/react.html',
        controller: 'ReactCtrl'
      });
  });
