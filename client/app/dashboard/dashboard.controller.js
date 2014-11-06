'use strict';

angular.module('figureApp')
  .controller('DashboardCtrl', function ($scope, $http, Auth, socket) {

    // Initialization via socketio
    $http.get('/api/graphs/' + Auth.getCurrentUser().name).success(function(graphs) {
        $scope.graphs = graphs;
        socket.syncUpdates('graph', $scope.graphs);
    });
    // Unhook things!
    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('graphs');
    });
  });
