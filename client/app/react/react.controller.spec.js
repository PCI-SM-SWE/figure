'use strict';

describe('Controller: ReactCtrl', function () {

  // load the controller's module
  beforeEach(module('fullstackGenApp'));

  var ReactCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ReactCtrl = $controller('ReactCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
