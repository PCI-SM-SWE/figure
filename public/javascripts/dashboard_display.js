var socket = io('localhost');

var app = angular.module("Dashboard", ['lvl.directives.dragdrop']);

app.controller('MainCtrl', ['$scope', function($scope) 
{
	var client = new Handler(socket);
	var grid = [[], [], [], []];
	var rowBounds = 3;
	var colBounds = 5;

	$(document).ready(function()
	{	
		displayDashboard();
	});

	function displayDashboard()
	{
		client.getDashboard($('title').html(), function(dashboardObject)
		{
			console.log(JSON.stringify(dashboardObject));

			var title = dashboardObject.title;
			var dashboardGrid = dashboardObject.grid;
			var graphs;

			$('body').prepend('<h2 class = "text-center">' + title + '</h2><br>');

			client.getSavedGraphs(function(graphObjects)
			{
				graphs = graphObjects;
								
				//$scope.resetGrid();

				graph(title, dashboardGrid, graphs);
			});
		});
	}	

	function resetCell(row, col)
	{
		$('#row' + row + 'col' + col).empty();
		$('#row' + row + 'col' + col).removeAttr('style');		
		$('#row' + row + 'col' + col).removeAttr('draggable');
		$('#row' + row + 'col' + col).removeAttr('x-lvl-draggable');
		$('#row' + row + 'col' + col).attr('data-placed', 'false');
		$('#row' + row + 'col' + col).attr('x-lvl-drop-target', 'true');
		$('#row' + row + 'col' + col).attr('x-on-drop', 'dropped(dragEl, dropEl)');

		// angular.element(document).injector().invoke(function($compile) {
		// 	$compile($('#row' + row + 'col' + col))($scope);
		// });	
	}

	$scope.resetGrid = function()
	{
		for (var i = 0; i <= rowBounds; i++)
		{
			for (var j = 0; j <= colBounds; j++)
			{
				grid[i][j] = undefined;
				resetCell(i, j);
			}
		}
	}

	function placeGraph (droppedRow, droppedCol, size, id)
	{		
		// var t = "";
		// for (var i = 0; i < grid.length; i++)
		// {
		// 	for (var j = 0; j < grid[i].length; j++)
		// 	{
		// 		t += grid[i][j] + " "
		// 	}
		// 	t += "\n";
		// }
		// console.log(t);

		var title = id.substring(0, id.indexOf('('));

		if (id.indexOf('(') == -1)
			title = id;

		if (size == 'small')
		{
			$('#row' + droppedRow + 'col' + (droppedCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none;');
			$('#row' + (droppedRow + 1) + 'col' + droppedCol).attr('style', 'position: relative; z-index: -1; border-top: none; border-right: none;');
			$('#row' + (droppedRow + 1) + 'col' + (droppedCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none;');

			$('#row' + droppedRow + 'col' + droppedCol).attr('style', 'overflow: visible; border-right: none; border-bottom: none;');
			// $('#row' + droppedRow + 'col' + droppedCol).attr('draggable', 'true');
			// $('#row' + droppedRow + 'col' + droppedCol).attr('x-lvl-draggable', 'true');
			// $('#row' + droppedRow + 'col' + droppedCol).attr('data-placed', 'true');
			// $('#row' + droppedRow + 'col' + droppedCol).removeAttr('x-lvl-drop-target');
			// $('#row' + droppedRow + 'col' + droppedCol).removeAttr('x-on-drop');

			//$('#row' + graphRow + 'col' + graphCol).attr('class', 'ui-draggable');
			$('#row' + droppedRow + 'col' + droppedCol).append('<h3>' + title + '</h3>');	
			$('#row' + droppedRow + 'col' + droppedCol).append('<svg data-id = "' + id + '" title = "' + title + '" data-size = "small" style = "width: 200%; height: 180%; position: relative; z-index = 1;"></svg>');

			// angular.element(document).injector().invoke(function($compile) {
			// 	$compile($('#row' + droppedRow + 'col' + droppedCol))($scope);
			// });	

			// grid[droppedRow][droppedCol] = id;
			// grid[droppedRow][droppedCol + 1] = id;
			// grid[droppedRow + 1][droppedCol] = id;
			// grid[droppedRow + 1][droppedCol + 1] = id;
		}
		else if (size == 'large')
		{
			$('#row' + droppedRow + 'col' + (droppedCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none; border-right: none;');
			$('#row' + droppedRow + 'col' + (droppedCol + 2)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none;');
			$('#row' + (droppedRow + 1) + 'col' + droppedCol).attr('style', 'position: relative; z-index: -1; border-top: none; border-right: none;');
			$('#row' + (droppedRow + 1) + 'col' + (droppedCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none; border-right: none;');
			$('#row' + (droppedRow + 1) + 'col' + (droppedCol + 2)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none;');

			$('#row' + droppedRow + 'col' + droppedCol).attr('style', 'overflow: visible; border-right: none; border-bottom: none;');
			// $('#row' + droppedRow + 'col' + droppedCol).attr('draggable', 'true');
			// $('#row' + droppedRow + 'col' + droppedCol).attr('x-lvl-draggable', 'true');
			// $('#row' + droppedRow + 'col' + droppedCol).attr('data-placed', 'true');
			// $('#row' + droppedRow + 'col' + droppedCol).removeAttr('x-lvl-drop-target');
			// $('#row' + droppedRow + 'col' + droppedCol).removeAttr('x-on-drop');

			$('#row' + droppedRow + 'col' + droppedCol).append('<h3>' + title + '</h3>');	
			$('#row' + droppedRow + 'col' + droppedCol).append('<svg data-id = "' + id + '" title = "' + title + '" data-size = "large" style = "width: 300%; height: 180%; position: relative; z-index = 1;"></svg>');

			// angular.element(document).injector().invoke(function($compile) {
			// 	$compile($('#row' + droppedRow + 'col' + droppedCol))($scope);
			// });	

			// grid[droppedRow][droppedCol] = id;
			// grid[droppedRow][droppedCol + 1] = id;
			// grid[droppedRow][droppedCol + 2] = id;
			// grid[droppedRow + 1][droppedCol] = id;
			// grid[droppedRow + 1][droppedCol + 1] = id;
			// grid[droppedRow + 1][droppedCol + 2] = id;
		}	
	}

	function graphBar(row, col, graphObject, size, id)
	{
		var chart = nv.models.discreteBarChart()
				.x(function(d) { return d.label })    //Specify the data accessors.
				.y(function(d) { return d.value })
				.staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
				.tooltips(false)        //Don't show tooltips
				.showValues(true)       //...instead, show the bar value right on top of each bar.
				.transitionDuration(350);

	
		placeGraph(row, col, size, id);

		console.log("#row" + row + "col" + col +" > svg[data-id='" + id + "']");
		d3.select("#row" + row + "col" + col +" > svg[data-id='" + id + "']")
		.datum(graphObject.chart_data)
		.call(chart);
		
		nv.utils.windowResize(chart.update);	

		return(chart);	
	}

	function graphLine(row, col, graphObject, size, id)
	{
		var temp;

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
		
		chart.interactiveLayer.tooltip.distance = 50;

		placeGraph(row, col, size, id);

		temp = setInterval(function()
		{
			var offset = $("#row" + row + "col" + col +" > svg[data-id='" + id + "']").offset();
			
			if (offset == undefined)
			{
				clearInterval(temp);
				return;
			}
			// $('#plot' + num).siblings('.nvtooltip').css('left', offset.left);
			// $('#plot' + num).siblings('.nvtooltip').css('top', offset.top);
			$("#row" + row + "col" + col +" > svg[data-id='" + id + "']").siblings('.nvtooltip').offset({top: offset.top, left: offset.left});
			//$('#plot' + num).siblings('.nvtooltip').css('margin', 0);
		}, 1);

		d3.select("#row" + row + "col" + col +" > svg[data-id='" + id + "']")
		.datum(graphObject.chart_data)
		.call(chart);
		
		nv.utils.windowResize(chart.update);

		return(chart);		
	}

	function graphPie(row, col, graphObject, size, id)
	{
		var chart = nv.models.pieChart()
		.x(function(d) { return d.label; })
		.y(function(d) { return d.value; })
		.showLabels(true);
		
		placeGraph(row, col, size, id);

		d3.select("#row" + row + "col" + col +" > svg[data-id='" + id + "']")
		.datum(graphObject.chart_data)
		.transition().duration(350)
		.call(chart);
		
		nv.utils.windowResize(chart.update);	

		return(chart);		
	}

	function graph(title, dashboardGrid, graphs)
	{
		var graphed = false;

		for (var i = 0; i < dashboardGrid.length; i++)
		{
			for (var j = 0; j < dashboardGrid[i].length; j++)
			{
				var id = dashboardGrid[i][j];
				var size;
	
				if (id != null && id != undefined)
				{
					if (id.charAt(id.length - 1) == 'S')
						size = 'small';
					else if (id.charAt(id.length - 1) == 'L')
						size = 'large';

					id = id.substr(0, id.length - 1);				

					var graphObject;

					for (var k = 0; k < graphs.length; k++)
					{
						if (id == graphs[k].title)
						{
							graphObject = graphs[k];
							console.log(JSON.stringify(graphObject));
							break;
						}
					}		

					console.log(i + " " + j);		

					if(graphObject.type == "bar")
					{			
						nv.addGraph(graphBar(i, j, graphObject, size, id));
					}
					else if(graphObject.type == "line")
					{
						nv.addGraph(graphLine(i, j, graphObject, size, id));
					}
					else if(graphObject.type == "pie")
					{
						nv.addGraph(graphPie(i, j, graphObject, size, id));
					}
				}
			}
		}
	}
}]);