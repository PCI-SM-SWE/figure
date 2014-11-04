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

function plot_discreteBar(data) {
  nv.addGraph(function() {

    var chart = nv.models.discreteBarChart()
      .x(function(d) { return d.label })    //Specify the data accessors.
      .y(function(d) { return d.value })
      .staggerLabels(true)
      .tooltips(false)
      .showValues(true)
      .transitionDuration(350)
      ;

    d3.select('#generated-chart')
      .datum(data)
      .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
}

function plot_scatter() {

}

function plot_line() {

}

function plot_pie() {

}
