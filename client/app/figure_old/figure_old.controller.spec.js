'use strict';

describe('Controller: FigureOldCtrl', function () {

  // load the controller's module
  beforeEach(module('figureApp'));

  var FigureOldCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FigureOldCtrl = $controller('FigureOldCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
