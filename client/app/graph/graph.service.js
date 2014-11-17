'use strict';

angular.module('figureApp')
  .service('graph', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var currentGraph = null;

    function set(graph) {
        currentGraph = graph;
    }

    function get() {
        return currentGraph;
    }

    return {
        set: set,
        get: get
    };
  });
