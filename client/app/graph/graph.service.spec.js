'use strict';

describe('Service: graph', function () {

  // load the service's module
  beforeEach(window.angular.mock.module('figureApp'));

  // instantiate service
  var graph;
  beforeEach(inject(function (_graph_) {
    graph = _graph_;
  }));

  it('should do something', function () {
    expect(!!graph).toBe(true);
  });

});
