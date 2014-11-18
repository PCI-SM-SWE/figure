'use strict';

describe('Controller: DashboardCtrl', function () {

  // load the controller's module
  beforeEach(window.angular.mock.module('figureApp'));
  beforeEach(window.angular.mock.module('socketMock'));

  var DashboardCtrl, scope, $httpBackend, graph;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($injector, _$httpBackend_, $controller, $rootScope) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/graphs/undefined')
      .respond([{_id: 1, data:[], owner: 'test', type: 'line', title: 'test title'}]);

    graph = $injector.get('graph');
    scope = $rootScope.$new();
    DashboardCtrl = $controller('DashboardCtrl', {
      $scope: scope
    });
  }));

  it('should fetch graphs on load.', function () {
    $httpBackend.flush();
    expect(scope.graphs.length).toBe(1);
  });

  it('should plot a graph that is not yet drawn', function () {
    $httpBackend.flush();

    spyOn(window, 'plot_line');
    scope.plot(scope.graphs[0]);
    expect(scope.graphs[0].drawn).toBe(true);
    expect(window.plot_line).toHaveBeenCalled();
  });

  it('should hide graphs if they are already drawn', function () {
    $httpBackend.flush();

    spyOn(scope, 'trash');
    scope.graphs[0].drawn = true;
    scope.plot(scope.graphs[0]);
    expect(scope.trash).toHaveBeenCalled();
  });

  it('should set drawn to false on trash', function() {
    $httpBackend.flush();

    scope.trash(scope.graphs[0]);
    expect(scope.graphs[0].drawn).toBe(false);
  });

  it('should know if any graphs are drawn', function () {
    expect(scope.noGraphsDrawn()).toBe(true);

    $httpBackend.flush();

    expect(scope.noGraphsDrawn()).toBe(true);
    scope.graphs[0].drawn = true;
    expect(scope.noGraphsDrawn()).toBe(false);
  });

  it('should hide the graph on edit and redirect', function () {
    $httpBackend.flush();

    spyOn(graph, 'set');
    scope.edit(scope.graphs[0]);
    expect(graph.set).toHaveBeenCalled();
  });

  it('should unhook on destroy', function () {
    scope.$destroy();
  });

  it('should delete the graph on remove', function() {
    $httpBackend.flush();

    spyOn(window, 'confirm').and.returnValue(true);
    $httpBackend.expectDELETE('/api/graphs/' + scope.graphs[0]._id).respond([]);
    scope.remove(scope.graphs[0]);
    expect(window.confirm).toHaveBeenCalled();
    $httpBackend.flush();
  });

  it('should do nothing when remove is dismissed', function() {
    $httpBackend.flush();

    spyOn(window, 'confirm').and.returnValue(false);
    scope.remove(scope.graphs[0]);
    expect(window.confirm).toHaveBeenCalled();
  });
});
