'use strict';

describe('Controller: FigureCtrl', function () {

  // load the controller's module
  beforeEach(window.angular.mock.module('figureApp'));
  beforeEach(window.angular.mock.module('socketMock'));

  var FigureCtrl, scope, $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/graphtypes')
      .respond([]);
    $httpBackend.expectGET('/api/paramtypes')
      .respond([]);

    scope = $rootScope.$new();
    FigureCtrl = $controller('FigureCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
