'use strict';

describe('Service: graph', function () {

  // load the service's module
  beforeEach(window.angular.mock.module('figureApp'));

  // instantiate service
  var graph;
  var testGraph = { _id: 1, data: [], owner: 'test', type: 'line' };

  beforeEach(inject(function (_graph_) {
    graph = _graph_;
  }));

  it('should set a graph', function () {
    graph.set(testGraph);
    expect(graph.get()).toBe(testGraph);
  });

});
