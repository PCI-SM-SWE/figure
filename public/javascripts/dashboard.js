//var socket = io('datapuking.com');
var socket = io('localhost');

var app = angular.module("Visualization", ['lvl.directives.dragdrop']);

app.controller('MainCtrl', ['$scope', function($scope) 
{
	var client = new Handler(socket);
	var graphs;

	$(document).ready(function()
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
			var graphObject;
			
			for(var i = 0; i < graphObjects.length; i++)
			{
				graphObject = graphObjects[i];				
				console.log(graphObject.type);
				switch(graphObject.type) {
				    case "bar":
				        barCnt += 1;
				        break;
				    case "line":
				        lineCnt += 1;
				        break;
				    case "pie":
				        pieCnt += 1;
				        break;
				    case "map":
				        mapCnt += 1;
				        break;
				    case "stats":
				        statsCnt += 1;
				        break;
				    default:
				        break;
				}
				
				$("#bar-badge").html(barCnt);
				$("#line-badge").html(lineCnt);
				$("#pie-badge").html(pieCnt);
				$("#map-badge").html(mapCnt);
				$("#stats-badge").html(statsCnt);

				// $('#' + graphObject.type + 'Graphs').append('<li><a href = "">' + graphObject.file_name + '</a></li>');

				var li = document.createElement('li');
				var a = document.createElement('a');
				a.innerHTML = graphObject.file_name;

				a.onclick = function()
				{
					for(var j = 0; j < graphObjects.length; j++)
					{
						graphObject = graphObjects[j];

						if(graphObject.file_name == this.innerHTML)
							break;
					}

					$('#thumbnails').empty();

					$('#thumbnails').append('<div class="btn-group" data-toggle="buttons"><label class="btn btn-default" name = "small"><input type="radio">Small</label><label class="btn btn-default" name = "large"><input type="radio">Large</label></div><br><br>');

					$("label[name = 'small'").click(function()
					{
						$('#thumbnails').children("img").remove();
						var img = document.createElement('img');
						//img.setAttribute('src', 'saved_images/' + graphObject.file_name); 
						img.setAttribute('src', graphObject.png); 
						img.setAttribute('style', '-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none; width: 50%; height: 400%; margin-bottom: 0px; display: block; margin: 4px; margin-left: auto; margin-right: auto;');
						img.setAttribute('x-lvl-draggable', 'true');
						img.setAttribute('draggable', 'true');
						img.setAttribute('id', graphObject.file_name);
						img.setAttribute('class', 'thumbnail ui-draggable');
						img.setAttribute('title', 'small');

						angular.element(document).injector().invoke(function($compile) {
							$compile(img)($scope);
						});	

						$('#thumbnails').append(img);
					});

					$("label[name = 'large'").click(function()
					{
						$('#thumbnails').children("img").remove();
						var img = document.createElement('img');
						//img.setAttribute('src', 'saved_images/' + graphObject.file_name); 
						img.setAttribute('src', graphObject.png); 
						img.setAttribute('style', '-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none; width: 80%; height: 500%; margin-bottom: 0px; display: block; margin: 4px; margin-left: auto; margin-right: auto;');
						img.setAttribute('x-lvl-draggable', 'true');
						img.setAttribute('draggable', 'true');
						img.setAttribute('id', graphObject.file_name);
						img.setAttribute('class', 'thumbnail ui-draggable');
						img.setAttribute('title', 'large');

						angular.element(document).injector().invoke(function($compile) {
							$compile(img)($scope);
						});	

						$('#thumbnails').append(img);
					});

					$("label[name = 'small'").click();
				};

				li.appendChild(a);

				$('#' + graphObject.type + 'Graphs').append(li);

				// var img = document.createElement('img');
				// //img.setAttribute('src', 'saved_images/' + graphObject.file_name); 
				// img.setAttribute('src', graphObject.png); 
				// img.setAttribute('style', '-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none; width: 85px; height: 70px; margin-bottom: 0px; display: inline; margin: 4px;');
				// img.setAttribute('x-lvl-draggable', 'true');
				// img.setAttribute('draggable', 'true');
				// img.setAttribute('id', graphObject.file_name);
				// img.setAttribute('class', 'thumbnail ui-draggable');

				// angular.element(document).injector().invoke(function($compile) {
				// 	$compile(img)($scope);
				// });	

				// $('#thumbnails').append(img);
			}
			$("#menu-bar").on({
				mouseenter: function() {
					$("#menu-bar ul").css("height", barCnt*31 + "px");
				},
				mouseleave: function() {
					$("#menu-bar ul").css("height", "0px");
				}
			});
			$("#menu-line").on({
				mouseenter: function() {
					$("#menu-line ul").css("height", lineCnt*31 + "px");
				},
				mouseleave: function() {
					$("#menu-line ul").css("height", "0px");
				}
			});
			$("#menu-pie").on({
				mouseenter: function() {
					$("#menu-pie ul").css("height", pieCnt*31 + "px");
				},
				mouseleave: function() {
					$("#menu-pie ul").css("height", "0px");
				}
			});
			$("#menu-map").on({
				mouseenter: function() {
					$("#menu-map ul").css("height", mapCnt*31 + "px");
				},
				mouseleave: function() {
					$("#menu-map ul").css("height", "0px");
				}
			});
			$("#menu-stats").on({
				mouseenter: function() {
					$("#menu-stats ul").css("height", statsCnt*31 + "px");
				},
				mouseleave: function() {
					$("#menu-stats ul").css("height", "0px");
				}
			});

			graphs = graphObjects;
		});
	}

	function placeGraph (drag, drop)
	{
		var droppedRow = parseInt(drop.attr('id').charAt(3));
		var droppedCol = parseInt(drop.attr('id').charAt(7));
		var rowBounds = 2;
		var colBounds = 3;
		var graphRow;
		var graphCol;

		console.log(droppedRow + ' ' + droppedCol);

		if (drag.attr('title') == 'small')
		{
			if (droppedRow + 1 <= rowBounds)
			{
				if (droppedCol + 1 <= colBounds)
				{
					graphRow = droppedRow;
					graphCol = droppedCol;
				}
				else
				{
					graphRow = droppedRow;
					graphCol = droppedCol - 1;
				}

			}
			else
			{
				if (droppedCol + 1 <= colBounds)
				{
					graphRow = droppedRow - 1
					graphCol = droppedCol;
				}
				else
				{
					graphRow = droppedRow - 1;
					graphCol = droppedCol - 1;
				}
			}

			console.log('#row' + graphRow + 'col' + graphCol);

			$('#row' + graphRow + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none;');
			$('#row' + (graphRow + 1) + 'col' + graphCol).attr('style', 'position: relative; z-index: -1; border-top: none; border-right: none;');
			$('#row' + (graphRow + 1) + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none;');

			$('#row' + graphRow + 'col' + graphCol).attr('style', 'overflow: visible; border-right: none; border-bottom: none;')
			$('#row' + graphRow + 'col' + graphCol).append('<svg id = "graph" style = "width: 200%; height: 200%; title = "small"></svg>');
		}
		else if (drag.attr('title') == 'large')
		{
			if (droppedRow + 1 <= rowBounds)
			{
				if (droppedCol + 2 <= colBounds)
				{
					graphRow = droppedRow;
					graphCol = droppedCol;
				}
				else
				{
					graphRow = droppedRow;
					graphCol = 1;
				}

			}
			else
			{
				if (droppedCol + 2 <= colBounds)
				{
					graphRow = 1;
					graphCol = droppedCol;
				}
				else
				{
					graphRow = 1;
					graphCol = 1;
				}
			}

			console.log('#row' + graphRow + 'col' + graphCol);

			$('#row' + graphRow + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none; border-right: none;');
			$('#row' + graphRow + 'col' + (graphCol + 2)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none;');
			$('#row' + (graphRow + 1) + 'col' + graphCol).attr('style', 'position: relative; z-index: -1; border-top: none; border-right: none;');
			$('#row' + (graphRow + 1) + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none; border-right: none;');
			$('#row' + (graphRow + 1) + 'col' + (graphCol + 2)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none;');

			$('#row' + graphRow + 'col' + graphCol).attr('style', 'overflow: visible; border-right: none; border-bottom: none;')
			$('#row' + graphRow + 'col' + graphCol).append('<svg id = "graph" style = "width: 300%; height: 200%; position: relative; z-index = auto; "></svg>');
		}		
	}

	$scope.dropped = function(dragEl, dropEl)
	{
		var drag = angular.element(dragEl);
		var drop = angular.element(dropEl);

		console.log(drag);
		console.log(drop);

		var graphObject;

		for(var i = 0; i < graphs.length; i++)
		{
			graphObject = graphs[i]

			if(graphObject.file_name == drag.attr('id'))
				break;
		}

		// console.log(JSON.stringify(graphObject));
	
		if(graphObject.type == "bar")
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

				placeGraph(drag, drop);

				d3.select('#graph')
				.datum(graphObject.chart_data)
				.call(chart);
				
				nv.utils.windowResize(chart.update);

				return(chart);
			});
		}
		else if(graphObject.type == "line")
		{
			nv.addGraph(function()
			{
				var chart = nv.models.lineChart()
				.useInteractiveGuideline(true)
				.transitionDuration(350)
				.showYAxis(true)
				.showXAxis(true);
				
				chart.xAxis.rotateLabels(-65);

				chart.xAxis.showMaxMin(true);
				chart.xAxis.axisLabel(graphObject.xAxis);
					
				if(graphObject.is_date_time == true)
				{
					chart.xAxis.tickFormat(function(d)
					{
						return(d3.time.format('%c')(new Date(d)));
					});

					chart.margin({left: 100, right: 30, bottom: 180});
				}
				else
				{
					chart.xAxis.tickFormat(d3.format(',g'));
					chart.margin({left: 100, right: 30, bottom: 80});
				}
				
				chart.yAxis.axisLabel(graphObject.yAxis);
				chart.yAxis.tickFormat(d3.format(',g'));
				
				placeGraph(drag, drop);

				d3.select('#graph')
				.datum(graphObject.chart_data)
				.call(chart);
				
				nv.utils.windowResize(chart.update);		
				
				return(chart);		
			});				
		}
		else if(graphObject.type == "pie")
		{
			nv.addGraph(function() 
			{
				var chart = nv.models.pieChart()
				.x(function(d) { return d.label; })
				.y(function(d) { return d.value; })
				.showLabels(true);

				placeGraph(drag, drop);

				d3.select('#graph')
				.datum(graphObject.chart_data)
				.transition().duration(350)
				.call(chart);
				
				nv.utils.windowResize(chart.update);	
				
				return(chart);
			});		
		}
	};
}]);

