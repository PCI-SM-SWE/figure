'use strict';

angular.module('figureApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/figure', {
        templateUrl: 'app/figure/figure.html',
        controller: 'FigureCtrl'
      });
});

function plot_discreteBar(elId, data) {
  nv.addGraph(function() {

    var chart = nv.models.discreteBarChart()
      .x(function(d) { return d.label })
      .y(function(d) { return d.value })
      .staggerLabels(true)
      .tooltips(false)
      .showValues(true)
      .transitionDuration(350)
      ;

    d3.select('#' + elId)
      .datum(data)
      .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
}

function plot_scatter(elId, data) {

  nv.addGraph(function() {
    var chart = nv.models.scatterChart()
      .showDistX(true)
      .showDistY(true)
      .transitionDuration(350)
      .color(d3.scale.category10().range())
      ;

    //Axis settings
    chart.xAxis.tickFormat(d3.format('.02f'));
    chart.yAxis.tickFormat(d3.format('.02f'));

    //We want to show shapes other than circles.
    chart.scatter.onlyCircles(false);

    d3.select('#' + elId)
      .datum(data)
      .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
}

function plot_line(elId, data) {
  nv.addGraph(function() {
    var chart = nv.models.lineChart()
      .margin({left: 100})
      .useInteractiveGuideline(true)
      .transitionDuration(350)
      .showLegend(true)
      .showYAxis(true)
      .showXAxis(true)
      ;

    chart.xAxis
      .axisLabel($('input[name="x"]').val());

    chart.yAxis
      .axisLabel($('input[name="y"]').val());

    d3.select('#' + elId)
      .datum(data)
      .call(chart);

    //Update the chart when window resizes.
    nv.utils.windowResize(chart.update);
    return chart;
  });
}

function plot_pie(elId, data) {
  nv.addGraph(function() {
    var chart = nv.models.pieChart()
      .x(function(d) { return d.label })
      .y(function(d) { return d.value })
      .showLabels(true);

      d3.select('#' + elId)
        .datum(data[0].values)
        .transition().duration(350)
        .call(chart);

    return chart;
  });

}
