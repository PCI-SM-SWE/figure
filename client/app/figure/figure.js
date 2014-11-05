'use strict';

angular.module('figureApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/figure', {
        templateUrl: 'app/figure/figure.html',
        controller: 'FigureCtrl'
      });
});

function plot_discreteBar(data) {
  nv.addGraph(function() {

    var chart = nv.models.discreteBarChart()
      .x(function(d) { return d.label })
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
