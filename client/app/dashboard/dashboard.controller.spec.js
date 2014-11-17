'use strict';

describe('Controller: DashboardCtrl', function () {

  // load the controller's module
  beforeEach(window.angular.mock.module('figureApp'));
  beforeEach(window.angular.mock.module('socketMock'));

  var DashboardCtrl, scope, $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/graphs/undefined')
      .respond([{data:[], owner: 'test', type: 'line', title: 'test title'}]);

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

    scope.edit(scope.graphs[0]);
    // Need to have some expectations here, but can't figure out how to hook into the dependencies.
  });
});
