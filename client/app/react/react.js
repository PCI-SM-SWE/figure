'use strict';

angular.module('fullstackGenApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/react', {
        templateUrl: 'app/react/react.html',
        controller: 'ReactCtrl'
      });
  });
