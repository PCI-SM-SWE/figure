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
				// a.setAttribute('href','');
				a.innerHTML = graphObject.title;

				a.onclick = function()
				{
					for(var j = 0; j < graphObjects.length; j++)
					{
						graphObject = graphObjects[j];

						if(graphObject.title == this.innerHTML)
							break;
					}

					$('#thumbnails').empty();

					$('#thumbnails').append('<div class="btn-group" data-toggle="buttons"><label class="btn btn-default" name = "small"><input type="radio">Small</label><label class="btn btn-default" name = "large"><input type="radio">Large</label></div><br><br>');

					$("label[name = 'small']").click(function()
					{
						$('#thumbnails').children("img, p").remove();
						var img = document.createElement('img');
						//img.setAttribute('src', 'saved_images/' + graphObject.file_name); 
						img.setAttribute('src', graphObject.png); 
						img.setAttribute('style', '-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none; width: 30%; height: 300%; margin-bottom: 0px; display: block; margin: 4px; margin-left: auto; margin-right: auto;');
						img.setAttribute('x-lvl-draggable', 'true');
						img.setAttribute('draggable', 'true');
						//img.setAttribute('id', graphObject.title.replace(/ /g, '_'));
						img.setAttribute('class', 'thumbnail ui-draggable');
						img.setAttribute('title', graphObject.title);
						img.setAttribute('data-size', 'small');
						img.setAttribute('data-placed', 'false');

						angular.element(document).injector().invoke(function($compile) {
							$compile(img)($scope);
						});	

						$('#thumbnails').append(img);
						$('#thumbnails').append('<p>Drag image to place on dashboard</p>');
					});

					$("label[name = 'large']").click(function()
					{
						$('#thumbnails').children("img, p").remove();
						var img = document.createElement('img');
						//img.setAttribute('src', 'saved_images/' + graphObject.file_name); 
						img.setAttribute('src', graphObject.png); 
						img.setAttribute('style', '-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none; width: 40%; height: 400%; margin-bottom: 0px; display: block; margin: 4px; margin-left: auto; margin-right: auto;');
						img.setAttribute('x-lvl-draggable', 'true');
						img.setAttribute('draggable', 'true');
						//img.setAttribute('id', graphObject.title.replace(/ /g, '_'));
						img.setAttribute('class', 'thumbnail ui-draggable');
						img.setAttribute('title', graphObject.title);
						img.setAttribute('data-size', 'large')
						img.setAttribute('data-placed', 'false');

						angular.element(document).injector().invoke(function($compile) {
							$compile(img)($scope);
						});	

						$('#thumbnails').append(img);
						$('#thumbnails').append('<p>Drag image to place on dashboard</p>');
					});

					$("label[name = 'small']").click();
				};

				li.appendChild(a);

				$('#' + graphObject.type + 'Graphs').append(li);
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

	var rowBounds = 3;
	var colBounds = 5;
	var grid = [[], [], [], []];
	var graphId = 65;

	function resetCell(row, col)
	{
		$('#row' + row + 'col' + col).empty();
		$('#row' + row + 'col' + col).removeAttr('style');		
		$('#row' + row + 'col' + col).removeAttr('draggable');
		$('#row' + row + 'col' + col).removeAttr('x-lvl-draggable');
		$('#row' + row + 'col' + col).attr('data-placed', 'false');
	}

	$scope.resetGrid = function()
	{
		for (var i = 0; i < grid.length; i++)
		{
			for (var j = 0; j < grid[i].length; j++)
			{
				grid[i][j] = undefined;
				resetCell(i, j);
			}
		}
	}

	function spaceTaken(graphRow, graphCol, usedRow, usedCol)
	{
		for (var i = 0; i < usedRow.length; i++)
		{
			if (grid[graphRow + usedRow[i]][graphCol + usedCol[i]] != undefined)
				return (false);
		}

		return (true);
	}

	function placeGraph (drag, drop)
	{
		var droppedRow = parseInt(drop.attr('id').charAt(3));
		var droppedCol = parseInt(drop.attr('id').charAt(7));
		
		var graphRow;
		var graphCol;
		var usedRow;
		var usedCol;
	
		var id = drag.attr('id');

		if (drag.attr('data-size') == 'small')
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

			usedRow = [0, 0, 1, 1];
			usedCol = [0, 1, 0, 1];

			if (spaceTaken(graphRow, graphCol, usedRow, usedCol) == false)
			{
				alert("Graph cannot be placed there.");
				return (false);
			}

			$('#row' + graphRow + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none;');
			$('#row' + (graphRow + 1) + 'col' + graphCol).attr('style', 'position: relative; z-index: -1; border-top: none; border-right: none;');
			$('#row' + (graphRow + 1) + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none;');

			$('#row' + graphRow + 'col' + graphCol).attr('style', 'overflow: visible; border-right: none; border-bottom: none;');
			$('#row' + graphRow + 'col' + graphCol).attr('draggable', 'true');
			$('#row' + graphRow + 'col' + graphCol).attr('x-lvl-draggable', 'true');
			$('#row' + graphRow + 'col' + graphCol).attr('data-placed', 'true');
			//$('#row' + graphRow + 'col' + graphCol).attr('class', 'ui-draggable');
			$('#row' + graphRow + 'col' + graphCol).append('<svg id = "' + String.fromCharCode(graphId) + '" title = "' + drag.attr('title') + '" data-size = "small" style = "width: 200%; height: 200%; position: relative; z-index = 1;"></svg>');

			angular.element(document).injector().invoke(function($compile) {
				$compile($('#row' + graphRow + 'col' + graphCol))($scope);
			});	

			grid[graphRow][graphCol] = String.fromCharCode(graphId);
			grid[graphRow][graphCol + 1] = String.fromCharCode(graphId);
			grid[graphRow + 1][graphCol] = String.fromCharCode(graphId);
			grid[graphRow + 1][graphCol + 1] = String.fromCharCode(graphId);
		}
		else if (drag.attr('data-size') == 'large')
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
					if (droppedCol + 1 > colBounds)
					{
						graphRow = droppedRow;
						graphCol = droppedCol - 2;
					}
					else
					{
						graphRow = droppedRow;
						graphCol = droppedCol - 1;
					}
				}
			}
			else
			{
				if (droppedCol + 2 <= colBounds)
				{
					graphRow = droppedRow - 1;
					graphCol = droppedCol;
				}
				else
				{
					if (droppedCol + 1 > colBounds)
					{
						graphRow = droppedRow;
						graphCol = droppedCol - 2;
					}
					else
					{
						graphRow = droppedRow;
						graphCol = droppedCol - 1;
					}
				}
			}

			console.log('#row' + graphRow + 'col' + graphCol);

			usedRow = [0, 0, 0, 1, 1, 1];
			usedCol = [0, 1, 2, 0, 1, 2];

			if (spaceTaken(graphRow, graphCol, usedRow, usedCol) == false)
			{
				alert("Graph cannot be placed there.");
				return (false);
			}

			$('#row' + graphRow + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none; border-right: none;');
			$('#row' + graphRow + 'col' + (graphCol + 2)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none;');
			$('#row' + (graphRow + 1) + 'col' + graphCol).attr('style', 'position: relative; z-index: -1; border-top: none; border-right: none;');
			$('#row' + (graphRow + 1) + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none; border-right: none;');
			$('#row' + (graphRow + 1) + 'col' + (graphCol + 2)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none;');

			$('#row' + graphRow + 'col' + graphCol).attr('style', 'overflow: visible; border-right: none; border-bottom: none;');
			$('#row' + graphRow + 'col' + graphCol).attr('draggable', 'true');
			$('#row' + graphRow + 'col' + graphCol).attr('x-lvl-draggable', 'true');
			$('#row' + graphRow + 'col' + graphCol).attr('data-placed', 'true');

			$('#row' + graphRow + 'col' + graphCol).append('<svg id = "' + String.fromCharCode(graphId) + '" title = "' + drag.attr('title') + '" data-size = "large" style = "width: 300%; height: 200%; position: relative; z-index = 1;"></svg>');

			angular.element(document).injector().invoke(function($compile) {
				$compile($('#row' + graphRow + 'col' + graphCol))($scope);
			});	

			grid[graphRow][graphCol] = String.fromCharCode(graphId);
			grid[graphRow][graphCol + 1] = String.fromCharCode(graphId);
			grid[graphRow][graphCol + 2] = String.fromCharCode(graphId);
			grid[graphRow + 1][graphCol] = String.fromCharCode(graphId);
			grid[graphRow + 1][graphCol + 1] = String.fromCharCode(graphId);
			grid[graphRow + 1][graphCol + 2] = String.fromCharCode(graphId);
		}	
		
		console.log(grid);
		return (true);	
	}

	function moveGraph (drag, drop)
	{
		var droppedRow = parseInt(drop.attr('id').charAt(3));
		var droppedCol = parseInt(drop.attr('id').charAt(7));
		
		var graphRow;
		var graphCol;
		var usedRow;
		var usedCol;

		var id = drag.attr('id');

		if (drag.attr('data-size') == 'small')
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

			console.log(graphRow + " " + graphCol);

			usedRow = [0, 0, 1, 1];
			usedCol = [0, 1, 0, 1];

			var gridOld = [[], [], [], []];

			for (var i = 0; i < grid.length; i++)
			{
				for (var j = 0; j < grid[i].length; j++)
					gridOld[i][j] = grid[i][j];
			}

			for (var i = 0; i < grid.length; i++)
			{
				for (var j = 0; j < grid[i].length; j++)
				{
					if (grid[i][j] == id)
						grid[i][j] = undefined;
				}
			}

			if (spaceTaken(graphRow, graphCol, usedRow, usedCol) == false)
			{
				alert("Graph cannot be placed there.");
				grid = gridOld;
				return (false);
			}

			console.log(gridOld);
			grid = gridOld;

			for (var i = 0; i < grid.length; i++)
			{
				for (var j = 0; j < grid[i].length; j++)
				{
					if (grid[i][j] == id)
					{
						grid[i][j] = undefined;
						resetCell(i, j);
					}
				}
			}

			console.log('#row' + graphRow + 'col' + graphCol);					

			$('#row' + graphRow + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none;');
			$('#row' + (graphRow + 1) + 'col' + graphCol).attr('style', 'position: relative; z-index: -1; border-top: none; border-right: none;');
			$('#row' + (graphRow + 1) + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none;');

			$('#row' + graphRow + 'col' + graphCol).attr('style', 'overflow: visible; border-right: none; border-bottom: none;')
			//$('#row' + graphRow + 'col' + graphCol).attr('class', 'ui-draggable');
			$('#row' + graphRow + 'col' + graphCol).attr('draggable', 'true');
			$('#row' + graphRow + 'col' + graphCol).attr('x-lvl-draggable', 'true');
			$('#row' + graphRow + 'col' + graphCol).attr('data-placed', 'true');
			$('#row' + graphRow + 'col' + graphCol).append('<svg id = "' + id + '" title = "' + drag.attr('title') + '" data-size = "small" style = "width: 200%; height: 200%; position: relative; z-index = 1;"></svg>');

			
			//$('#row' + graphRow + 'col' + graphCol).append('<svg id = "' + id + '" class = "ui-draggable" title = "' + drag.attr('title') + '" data-size = "small" data-placed = "true" style = "width: 200%; height: 200%; position: relative; z-index = 1; -moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none;" draggable = "true" x-lvl-draggable = "true"></svg>');

			angular.element(document).injector().invoke(function($compile) {
				$compile($('#row' + graphRow + 'col' + graphCol))($scope);
			});	

			grid[graphRow][graphCol] = id;
			grid[graphRow][graphCol + 1] = id;
			grid[graphRow + 1][graphCol] = id;
			grid[graphRow + 1][graphCol + 1] = id;
		}
		else if (drag.attr('title').indexOf('large') != -1)
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
					if (droppedCol + 1 > colBounds)
					{
						graphRow = droppedRow;
						graphCol = droppedCol - 2;
					}
					else
					{
						graphRow = droppedRow;
						graphCol = droppedCol - 1;
					}
				}
			}
			else
			{
				if (droppedCol + 2 <= colBounds)
				{
					graphRow = droppedRow - 1;
					graphCol = droppedCol;
				}
				else
				{
					if (dropedCol + 1 > colBounds)
					{
						graphRow = droppedRow;
						graphCol = droppedCol - 2;
					}
					else
					{
						graphRow = droppedRow;
						graphCol = droppedCol - 1;
					}
				}
			}

			var gridOld = [[], [], [], []];

			for (var i = 0; i < grid.length; i++)
			{
				for (var j = 0; j < grid[i].length; j++)
					gridOld[i][j] = grid[i][j];
			}

			for (var i = 0; i < grid.length; i++)
			{
				for (var j = 0; j < grid[i].length; j++)
				{
					if (grid[i][j] == id)
						grid[i][j] = undefined;
				}
			}

			usedRow = [0, 0, 0, 1, 1, 1];
			usedCol = [0, 1, 2, 0, 1, 2];

			if (spaceTaken(graphRow, graphCol, usedRow, usedCol) == false)
			{
				alert("Graph cannot be placed there.");
				grid = gridOld;
				return (false);
			}

			console.log(gridOld);
			grid = gridOld;

			for (var i = 0; i < grid.length; i++)
			{
				for (var j = 0; j < grid[i].length; j++)
				{
					if (grid[i][j] == id)
					{
						grid[i][j] = undefined;
						resetCell(i, j);
					}
				}
			}

			$('#row' + graphRow + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none; border-right: none;');
			$('#row' + graphRow + 'col' + (graphCol + 2)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none;');
			$('#row' + (graphRow + 1) + 'col' + graphCol).attr('style', 'position: relative; z-index: -1; border-top: none; border-right: none;');
			$('#row' + (graphRow + 1) + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none; border-right: none;');
			$('#row' + (graphRow + 1) + 'col' + (graphCol + 2)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none;');

			$('#row' + graphRow + 'col' + graphCol).attr('style', 'overflow: visible; border-right: none; border-bottom: none;');
			$('#row' + graphRow + 'col' + graphCol).attr('draggable', 'true');
			$('#row' + graphRow + 'col' + graphCol).attr('x-lvl-draggable', 'true');
			$('#row' + graphRow + 'col' + graphCol).attr('data-placed', 'true');
			$('#row' + graphRow + 'col' + graphCol).append('<svg id = "' + id + '" title = "' + drag.attr('title') + '" data-size = "large" style = "width: 300%; height: 200%; position: relative; z-index = 1;"></svg>');

			
			//$('#row' + graphRow + 'col' + graphCol).append('<svg id = "' + id + '" class = "ui-draggable" title = "' + drag.attr('title') + '" data-size = "small" data-placed = "true" style = "width: 200%; height: 200%; position: relative; z-index = 1; -moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none;" draggable = "true" x-lvl-draggable = "true"></svg>');

			angular.element(document).injector().invoke(function($compile) {
				$compile($('#row' + graphRow + 'col' + graphCol))($scope);
			});	

			grid[graphRow][graphCol] = id;
			grid[graphRow][graphCol + 1] = id;
			grid[graphRow][graphCol + 2] = id;
			grid[graphRow + 1][graphCol] = id;
			grid[graphRow + 1][graphCol + 1] = id;
			grid[graphRow + 1][graphCol + 2] = id;
		}		

		console.log(grid);
		return (true);
	}

	$scope.dropped = function(dragEl, dropEl)
	{
		console.log(dragEl);
		console.log(dropEl);

		var drag = angular.element(dragEl);
		var drop = angular.element(dropEl);
		var placed = false;

		var graphObject;

		if (drag.attr('data-placed') == 'true')
		{
			drag = drag.children();
			placed = true;	
		}

		for(var i = 0; i < graphs.length; i++)
		{
			if(graphs[i].title == drag.attr('title'))
			{
				graphObject = graphs[i]
				break;
			}
		}

		//console.log(JSON.stringify(graphObject));

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

				if (placed == false)
				{
					if(placeGraph(drag, drop) == false)
						return;

					d3.select('#' + String.fromCharCode(graphId))
					.datum(graphObject.chart_data)
					.call(chart);
					
					nv.utils.windowResize(chart.update);
					graphId++;	

					return(chart);
				}
				
				if(moveGraph(drag, drop) == false)
					return;
				
				d3.select('#' + drag.attr('id'))
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
				var id;
				
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

				if (placed == false)
				{
					id = String.fromCharCode(graphId);

					if(placeGraph(drag, drop) == false)
						return;

					setInterval(function()
					{
						var offset = $('#' + id).offset();
						// $('#plot' + num).siblings('.nvtooltip').css('left', offset.left);
						// $('#plot' + num).siblings('.nvtooltip').css('top', offset.top);
						$('#' + id).siblings('.nvtooltip').offset({top: offset.top, left: offset.left});
						//$('#plot' + num).siblings('.nvtooltip').css('margin', 0);
					}, 1);

					d3.select('#' + id)
					.datum(graphObject.chart_data)
					.call(chart);
					
					nv.utils.windowResize(chart.update);
					graphId++;	

					return(chart);		
				}
				
				id = drag.attr('id');

				if(moveGraph(drag, drop) == false)
					return;

				setInterval(function()
				{
					var offset = $('#' + id).offset();
					// $('#plot' + num).siblings('.nvtooltip').css('left', offset.left);
					// $('#plot' + num).siblings('.nvtooltip').css('top', offset.top);
					$('#' + id).siblings('.nvtooltip').offset({top: offset.top, left: offset.left});
					//$('#plot' + num).siblings('.nvtooltip').css('margin', 0);
				}, 1);

				d3.select('#' + id)
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

				if (placed == false)
				{
					if(placeGraph(drag, drop) == false)
						return;

					d3.select('#' + String.fromCharCode(graphId))
					.datum(graphObject.chart_data)
					.transition().duration(350)
					.call(chart);
					
					nv.utils.windowResize(chart.update);	
					graphId++;	

					return(chart);
				}
			
				if(moveGraph(drag, drop) == false)
					return;

				d3.select('#' + drag.attr('id'))
				.datum(graphObject.chart_data)
				.transition().duration(350)
				.call(chart);
				
				nv.utils.windowResize(chart.update);	
				
				return(chart);					
			});		
		}
	};
}]);

