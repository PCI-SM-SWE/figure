'use strict';

angular.module('figureApp')
  .controller('DashboardCtrl', function ($scope, $http, Auth, socket) {

    $scope.graphs = [];

    // Initialization via socketio
    $http.get('/api/graphs/' + Auth.getCurrentUser().name).success(function(graphs) {
        $scope.graphs = graphs;
        socket.syncUpdates('graph', $scope.graphs);
    });
    // Unhook things!
    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('graphs');
    });

    $scope.plot = function(graph) {

      // Don't regraph if it's already drawn.
      if (graph.drawn) {
        return;
      }

      //Mark as drawn
      graph.drawn = true;
      window['plot_' + graph.type]('graph_' + graph._id, graph.data);
    };

    $scope.trash = function(graph) {
      graph.drawn = false;
    };

    $scope.noGraphsDrawn = function() {
      for (var i = 0; i < $scope.graphs.length; i++) {
        if ($scope.graphs[i].drawn) {
          return false;
        }
      }

      return true;
    };

    $scope.edit = function() {
      //Todo
    };

    $scope.remove = function(graph) {
      if (confirm("This will remove this graph completely. This action is permanent. Continue?") == true) {
        $http.delete('/api/graphs/' + graph._id);
      }
    };
  });
