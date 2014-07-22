//var socket = io('datapuking.com');
var socket = io('localhost');

var app = angular.module("Visualization", ['lvl.directives.dragdrop']);

app.controller('MainCtrl', ['$scope', function($scope) 
{
	var client = new Handler(socket);
	var graphs;

	$(document).ready (function ()
	{
		jQuery.event.props.push("dataTransfer");
		getSavedGraphs();

		$("#sortable").sortable(
		{
			placeholder: "ui-state-highlight"
		});

		$("#sortable").disableSelection();
	});

	function getSavedGraphs()
	{
		client.getSavedGraphs(function(graphObjects)
		{
			var barCnt = 0,
				lineCnt = 0,
				pieCnt = 0,
				mapCnt = 0,
				statsCnt = 0;
			
			for (var i = 0; i < graphObjects.length; i++)
			{
				graphObject = graphObjects[i];				
				console.log(graphObject.type);
				switch(graphObject.type) {
				    case "bar":
				        barCnt += 31;
				        break;
				    case "line":
				        lineCnt += 31;
				        break;
				    case "pie":
				        pieCnt += 31;
				        break;
				    case "map":
				        mapCnt += 31;
				        break;
				    case "stats":
				        statsCnt += 31;
				        break;
				    default:
				        break;
				}

				$('#' + graphObject.type + 'Graphs').append('<li><a href = "">' + graphObject.file_name + '</a></li>');

				var img = document.createElement('img');
				img.setAttribute('src', 'saved_images/' + graphObject.file_name); 
				img.setAttribute('style', '-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none; width: 85px; height: 70px; margin-bottom: 0px; display: inline; margin: 4px;');
				img.setAttribute('x-lvl-draggable', 'true');
				img.setAttribute('draggable', 'true');
				img.setAttribute('id', graphObject.file_name);
				img.setAttribute('class', 'thumbnail ui-draggable');

				angular.element(document).injector().invoke(function($compile) {
					$compile(img)($scope);
				});	

				$('#thumbnails').append(img);
			}
			$("#menu-bar").on({
				mouseenter: function () {
					$("#menu-bar ul").css("height", barCnt + "px");
				},
				mouseleave: function() {
					$("#menu-bar ul").css("height", "0px");
				}
			});
			$("#menu-line").on({
				mouseenter: function () {
					$("#menu-line ul").css("height", lineCnt + "px");
				},
				mouseleave: function() {
					$("#menu-line ul").css("height", "0px");
				}
			});
			$("#menu-pie").on({
				mouseenter: function () {
					$("#menu-pie ul").css("height", pieCnt + "px");
				},
				mouseleave: function() {
					$("#menu-pie ul").css("height", "0px");
				}
			});
			$("#menu-map").on({
				mouseenter: function () {
					$("#menu-map ul").css("height", mapCnt + "px");
				},
				mouseleave: function() {
					$("#menu-map ul").css("height", "0px");
				}
			});
			$("#menu-stats").on({
				mouseenter: function () {
					$("#menu-stats ul").css("height", statsCnt + "px");
				},
				mouseleave: function() {
					$("#menu-stats ul").css("height", "0px");
				}
			});

			graphs = graphObjects;
		});
	}

	$scope.dropped = function(dragEl, dropEl)
	{
		console.log(dragEl);
		console.log(dropEl);

		var drag = angular.element (dragEl);
		var drop = angular.element (dropEl);

		var drag = angular.element (dragEl);
		var drop = angular.element (dropEl);;

		var graphType;
		var chartData;

		for(var i = 0; i < graphs.length; i++)
		{
			if(graphs[i].file_name == drag.attr('id'))
			{
				graphType = graphs[i].type;
				chartData = graphs[i].chart_data;
				break;
			}
		}

		if (graphType == "bar")
		{			
			nv.addGraph(function()
			{
				var chart = nv.models.discreteBarChart()
						.x(function(d) { return d.label })    //Specify the data accessors.
						.y(function(d) { return d.value })
						.staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
						.tooltips(false)        //Don't show tooltips
						.showValues(true)       //...instead, show the bar value right on top of each bar.
						.transitionDuration(350);

				d3.select('#barGraph')
				.datum(chartData)
				.call(chart);

				nv.utils.windowResize(chart.update);

				return chart;
			});
		}
	};
}]);

