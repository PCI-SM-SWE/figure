'use strict';

angular.module('figureApp')
  .controller('ReactCtrl', function ($scope, Auth) {
    $scope.message = 'Hello';

    $scope.person = Auth.getCurrentUser();
    $scope.dataList = { 'data': [] };

    $scope.generateData = function() {

      $scope.dataList.data = [];

      for (var i = 0; i < 2000; i++) {
        $scope.dataList.data.push({'id': i, 'val': 'This is element ' + i + '.'});
      }
    }
  });
