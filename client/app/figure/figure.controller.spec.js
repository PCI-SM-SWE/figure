'use strict';

describe('Controller: FigureCtrl', function () {

  // load the controller's module
  beforeEach(module('figureApp'));

  var FigureCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FigureCtrl = $controller('FigureCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
