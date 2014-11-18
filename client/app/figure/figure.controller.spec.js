'use strict';

describe('Controller: FigureCtrl', function () {

  // load the controller's module
  beforeEach(window.angular.mock.module('figureApp'));
  beforeEach(window.angular.mock.module('socketMock'));

  var FigureCtrl, scope, $httpBackend, graph, Auth;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($injector, _$httpBackend_, $controller, $rootScope) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/graphtypes')
      .respond([{type: 'line', formalName: 'Line Chart', params: ['x','y'], learnMore: '', description: 'test description'}]);
    $httpBackend.expectGET('/api/paramtypes')
      .respond([{name: 'x', type: 'mixed', required: true, help: 'help'},
                {name: 'y', type: 'mixed', required: false, help: 'help'}]);

    graph = $injector.get('graph');
    Auth = $injector.get('Auth');
    scope = $rootScope.$new();
    FigureCtrl = $controller('FigureCtrl', {
      $scope: scope
    });
  }));

  it('should load graphtypes on start', function () {
    $httpBackend.flush();

    expect(scope.graphtypes.length).toBe(1);
  });

  it('should load paramtypes on start', function () {
    $httpBackend.flush();

    expect(scope.paramtypes.length).toBe(2);
  });

  it('should unhook on destroy', function () {
    scope.$destroy();
  });

  it('should fetch the logged in user', function () {
    expect(scope.isLoggedIn()).not.toBe(null);
  });

  it('should load a code mirror instance', function () {
    expect(scope.editor).not.toBe(null);
  });

  it('should throw an error when no code mirror instance exists', function () {
    scope.editor = null;
    expect(scope.setCodemirrorText).toThrow();
  });

  it('should set code mirror text', function () {
    scope.editor = {setValue: function() {return true;}};
    expect(scope.setCodemirrorText).not.toThrow();
  });

  it('should parse a url', function () {
    spyOn(Papa, 'parse');
    scope.parseURL();
    expect(scope.dataChanged).toBe('url');
    expect(Papa.parse).toHaveBeenCalled();
  });

  it('should toggle raw view', function () {
    scope.setRawView(true);
    expect(scope.rawView).toBe(true);
  });

  it('should clear the chart on active graph change', function () {
    spyOn(scope, 'clearChartConfig');
    scope.changeActiveGraph({});
    expect(scope.clearChartConfig).toHaveBeenCalled();
  });

  describe('Controller: FigureCtrl: Dropping Params', function() {
    beforeEach( function() {
      spyOn(document, 'getElementById')
        .and
        .returnValue(
          '<div data-value="test" name="testParam"></div>');
      spyOn(scope, 'graph');
    });

    it('should not graph when the form is invalid', function () {
      scope.chartConfForm = { $valid: false };
      scope.dropParam();
      expect(scope.graph).not.toHaveBeenCalled();
    });

    it('should call graph when form is valid', function () {
      scope.chartConfForm = { $valid: true };
      scope.dropParam();
      expect(scope.graph).toHaveBeenCalled();
    });
  });

  it('should clear chart configuration', function () {
    scope.clearChartConfig();
    expect(scope.hasGraph).toBe(false);
  });

  it('should graph on submit', function () {
    spyOn(scope, 'graph');
    scope.submitChartConfig({preventDefault: function() {return false;}});
    expect(scope.graph).toHaveBeenCalled();
  });

  describe('Controller: FigureCtrl: Graphing', function () {

    var mockParsedData = [{ x: 1, y: 2 }];

    beforeEach(function() {
      $httpBackend.flush();
      spyOn(window, 'plot_line');
    });

    afterEach(function() {
      expect(scope.hasGraph).toBe(true);
      expect(window.plot_line).toHaveBeenCalled();
    });

    it('should graph regular data', function() {
      scope.parsedData = mockParsedData;
      scope.activeGraph = scope.graphtypes[0];
      scope.graph();
    });
  });

  describe('Controller: FigureCtrl: Saving Graphs', function () {

    var mockEvent = {
      currentTarget: {}
    };

    it('should post a new graph', function () {
      $httpBackend.expectPOST('/api/graphs')
        .respond([]);

      scope.editGraph = null;
      scope.saveGraph(mockEvent);
      $httpBackend.flush();
    });

    it('should put an existing graph', function () {
      $httpBackend.expectPUT('/api/graphs/1')
        .respond([]);

      scope.editGraph = {_id: 1};
      scope.saveGraph(mockEvent);
      $httpBackend.flush();
      expect(scope.editGraph).toBe(null);
    });
  });

  it('should sort columns using indexing', function () {
    scope.columnSort.sortColumn = 'test';
    expect(scope.formatColumnSort({test:1})).toBe(1);
  });
});
