'use strict';

angular.module('figureApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/figure', {
        templateUrl: 'app/figure/figure.html',
        controller: 'FigureCtrl'
      });
  });

$(document).ready( function() {
  // Needed for lvl-drag-drop
  $.event.props.push('dataTransfer');

  // Set up Bootstrap file input plugin
  $('#fromFileInput').fileinput({
    uploadLabel: 'Parse',
    showPreview: false,
    allowedFileExtensions: ['csv'],
    elErrorContainer: '.fromFileInputError'
  });

  $('.kv-fileinput-upload').click( function() {
    var file = $("input[type=file]")[0].files[0];

    if (!file) {
      return;
    }

    // Reset to raw view before parsing...
    $('.fa-list-ol').click();

    var reader = new FileReader();
    reader.onload = function(e) {
      var contents = e.target.result;

      var _scope = angular.element($('#fromFileInput')).scope();
      _scope.$apply( function() {
        _scope.setCodemirrorText(contents);
      });
    };
    reader.readAsText(file);
  });
});