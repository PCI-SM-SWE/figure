//var socket = io('datapuking');
var socket = io('localhost');

var app = angular.module("Visualization", ['lvl.directives.dragdrop']);

app.controller('MainCtrl', ['$scope', function($scope) 
{
	var client = new Handler(socket);
	var graphs;

	$(document).ready(function()
	{		
		// client.redisError(function(err)
		// {
		// 	alert('Cannot connect to database.\nTry to refresh the page or contact IT.');
		// 	exit();
		// });

		$('#loader').css('top', ($(window).height() / 2) + 'px'); 
		$('#loader').css('left', ($(window).width() / 2) + 'px');

		addLoader();

		jQuery.event.props.push("dataTransfer");
		getSavedGraphs();

		$scope.resetGrid();

		removeLoader();
	});

	function addLoader()
	{		
		$('#loader').show();
		$('#darkLayer').show();
		$('#darkLayer').css('height', $(document).height());
	}

	function removeLoader()
	{
		setTimeout(function()
		{
			$('#loader').hide();
			$('#darkLayer').hide();
		}, 1000);		
	}

	// Retrieves saved graphs from redis
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
				
				console.log(JSON.stringify(graphObject));

				// Populating the cool dropdown
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
				    case "choropleth":
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

				// Creating the link to the each graph's image
				var li = document.createElement('li');
				var a = document.createElement('a');
				a.setAttribute('style', 'cursor: default;');
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

					// Small and large sizes
					$("label[name = 'small']").click(function()
					{
						$('#thumbnails').children("img, p").remove();
						var img = document.createElement('img');
						//img.setAttribute('src', 'saved_images/' + graphObject.file_name); 
						img.setAttribute('src', graphObject.png); 
						img.setAttribute('style', '-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none; width: 30%; height: 300%; margin-bottom: 0px; display: block; margin: 4px; margin-left: auto; margin-right: auto;');
						img.setAttribute('x-lvl-draggable', 'true');
						img.setAttribute('draggable', 'true');
						img.setAttribute('data-id', graphObject.title);
						img.setAttribute('class', 'thumbnail ui-draggable');
						//img.setAttribute('title', graphObject.title);
						img.setAttribute('data-size', 'small');
						img.setAttribute('data-placed', 'false');

						angular.element(document).injector().invoke(function($compile) {
							$compile(img)($scope);
						});	

						$('#thumbnails').append(img);
						$('#thumbnails').append('<p>Drag image to place on dashboard<br/>Cursor drop location will be the top left corner of the graph<br/>Width: 2 boxes</br>Height: 2 boxes</br>Maps cannot be moved after placed</p>');
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
						img.setAttribute('data-id', graphObject.title);
						img.setAttribute('class', 'thumbnail ui-draggable');
						//img.setAttribute('title', graphObject.title);
						img.setAttribute('data-size', 'large')
						img.setAttribute('data-placed', 'false');

						angular.element(document).injector().invoke(function($compile) {
							$compile(img)($scope);
						});	

						$('#thumbnails').append(img);
						$('#thumbnails').append('<p>Drag image to place on dashboard<br/>Cursor drop location will be the top left corner of the graph<br/>Width: 3 boxes</br>Height: 2 boxes</br>Maps cannot be moved after placed</p>');
					});

					$("label[name = 'small']").click();
				};

				li.appendChild(a);

				$('#' + graphObject.type + 'Graphs').append(li);
			}

			// Cool dropdown 
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
	var grid = [[], [], [], []];			// Used to keep track of graph locations
	var dashboardGrid = [[], [], [], []];	// Contains graph locations as well as size data

	// Resets a specific cell
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

	// Resets the whole dashboard
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

	// Checks if cell has been taken by another graph
	function spaceTaken(graphRow, graphCol, usedRow, usedCol)
	{
		for (var i = 0; i < usedRow.length; i++)
		{
			if (grid[graphRow + usedRow[i]][graphCol + usedCol[i]] != undefined)
				return (false);
		}

		return (true);
	}

	// Dragging graph image to the dashboard
	function placeGraph (droppedRow, droppedCol, size, type, id)
	{		
		var graphRow;
		var graphCol;
		var usedRow;
		var usedCol;
	
		var title = id.substring(0, id.indexOf('('));

		if (id.indexOf('(') == -1)
			title = id;

		if (size == 'small')
		{
			// Determines the coordinates, so graph is not out of bounds
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

			// Checks if any graphs are already in the spaces trying to be used
			if (spaceTaken(graphRow, graphCol, usedRow, usedCol) == false)
			{
				$('div.alert').remove();
				$('body').prepend('<div class="alert alert-danger" style = "position: fixed; z-index: 100; width: 100%"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong> Graph cannot be placed there.</div>');
				$('.alert').offset({top: $(window).scrollTop() + 51, left: $(window).scrollLeft()});
				return (false);
			}

			$('#row' + graphRow + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none;');
			$('#row' + (graphRow + 1) + 'col' + graphCol).attr('style', 'position: relative; z-index: -1; border-top: none; border-right: none;');
			$('#row' + (graphRow + 1) + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none;');

			$('#row' + graphRow + 'col' + graphCol).attr('style', 'overflow: visible; border-right: none; border-bottom: none;');
			$('#row' + graphRow + 'col' + graphCol).removeAttr('x-lvl-drop-target');
			$('#row' + graphRow + 'col' + graphCol).removeAttr('x-on-drop');
			$('#row' + graphRow + 'col' + graphCol).append('<h3>' + title + '</h3>');

			if (type != "choropleth")
			{		
				$('#row' + graphRow + 'col' + graphCol).attr('draggable', 'true');
				$('#row' + graphRow + 'col' + graphCol).attr('x-lvl-draggable', 'true');
				$('#row' + graphRow + 'col' + graphCol).attr('data-placed', 'true');
				$('#row' + graphRow + 'col' + graphCol).append('<svg data-id = "' + id + '" title = "' + title + '" data-size = "small" class = "nvd3" style = "width: 200%; height: 180%; position: relative; z-index = 1;"></svg>');
			}
			else
				$('#row' + graphRow + 'col' + graphCol).append('<div data-id = "' + id + '" title = "' + title + '" data-size = "small" style = "width: 220%; height: 170%; position: relative; z-index = 1;"></div>');

			angular.element(document).injector().invoke(function($compile) {
				$compile($('#row' + graphRow + 'col' + graphCol))($scope);
			});	

			// Updates the grid with teh graph's id
			grid[graphRow][graphCol] = id;
			grid[graphRow][graphCol + 1] = id;
			grid[graphRow + 1][graphCol] = id;
			grid[graphRow + 1][graphCol + 1] = id;

			dashboardGrid[graphRow][graphCol] = id + 'S';
		}
		else if (size == 'large')
		{
			// Determines the coordinates so graph is not out of bounds
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

			// Checks if any graphs are already in the spaces trying to be used
			if (spaceTaken(graphRow, graphCol, usedRow, usedCol) == false)
			{
				$('div.alert').remove();
				$('body').prepend('<div class="alert alert-danger" style = "position: fixed; z-index: 1; width: 100%"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong> Graph cannot be placed there.</div>');
				$('.alert').offset({top: $(window).scrollTop() + 51, left: $(window).scrollLeft()});
				return (false);
			}

			$('#row' + graphRow + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none; border-right: none;');
			$('#row' + graphRow + 'col' + (graphCol + 2)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none;');
			$('#row' + (graphRow + 1) + 'col' + graphCol).attr('style', 'position: relative; z-index: -1; border-top: none; border-right: none;');
			$('#row' + (graphRow + 1) + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none; border-right: none;');
			$('#row' + (graphRow + 1) + 'col' + (graphCol + 2)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none;');

			$('#row' + graphRow + 'col' + graphCol).attr('style', 'overflow: visible; border-right: none; border-bottom: none;');
			$('#row' + graphRow + 'col' + graphCol).removeAttr('x-lvl-drop-target');
			$('#row' + graphRow + 'col' + graphCol).removeAttr('x-on-drop');
			$('#row' + graphRow + 'col' + graphCol).append('<h3>' + title + '</h3>');

			if (type != "choropleth")
			{		
				$('#row' + graphRow + 'col' + graphCol).attr('draggable', 'true');
				$('#row' + graphRow + 'col' + graphCol).attr('x-lvl-draggable', 'true');
				$('#row' + graphRow + 'col' + graphCol).attr('data-placed', 'true');
				$('#row' + graphRow + 'col' + graphCol).append('<svg data-id = "' + id + '" title = "' + title + '" data-size = "small" class = "nvd3" style = "width: 300%; height: 180%; position: relative; z-index = 1;"></svg>');
			}
			else
				$('#row' + graphRow + 'col' + graphCol).append('<div data-id = "' + id + '" title = "' + title + '" data-size = "small" style = "width: 338%; height: 170%; position: relative; z-index = 1;"></div>');

			angular.element(document).injector().invoke(function($compile) {
				$compile($('#row' + graphRow + 'col' + graphCol))($scope);
			});	

			// Updates grid
			grid[graphRow][graphCol] = id;
			grid[graphRow][graphCol + 1] = id;
			grid[graphRow][graphCol + 2] = id;
			grid[graphRow + 1][graphCol] = id;
			grid[graphRow + 1][graphCol + 1] = id;
			grid[graphRow + 1][graphCol + 2] = id;

			dashboardGrid[graphRow][graphCol] = id + 'L';
		}	
		
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

		return ({'graphRow': graphRow, 'graphCol': graphCol});
	}

	/*	Moving graph from one cell to another
		Choropleth maps cannot be moved	*/
	function moveGraph (dragRow, dragCol, droppedRow, droppedCol, size, id)
	{		
		var graphRow;
		var graphCol;
		var usedRow;
		var usedCol;

		var title = $("svg[data-id='" + id + "']").attr('title');

		if (size == 'small')
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

			// Copies grid to gridOld
			for (var i = 0; i < grid.length; i++)
			{
				for (var j = 0; j < grid[i].length; j++)
					gridOld[i][j] = grid[i][j];
			}

			// Clears the grid of the old location
			for (var i = 0; i < usedRow.length; i++)
			{
				grid[dragRow + usedRow[i]][dragCol + usedCol[i]] = undefined;
			}

			// Determines if graph can be placed to new location
			if (spaceTaken(graphRow, graphCol, usedRow, usedCol) == false)
			{
				$('div.alert').remove();
				$('body').prepend('<div class="alert alert-danger" style = "position: fixed; z-index: 1; width: 100%"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong> Graph cannot be placed there.</div>');
				$('.alert').offset({top: $(window).scrollTop() + 51, left: $(window).scrollLeft()});
				
				grid = gridOld;
				return (false);
			}

			grid = gridOld;

			// Clears old location
			for (var i = 0; i < usedRow.length; i++)
			{
				grid[dragRow + usedRow[i]][dragCol + usedCol[i]] = undefined;
				resetCell(dragRow + usedRow[i], dragCol + usedCol[i]);
			}

			dashboardGrid[dragRow][dragCol] = undefined;

			console.log('#row' + graphRow + 'col' + graphCol);					

			$('#row' + graphRow + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none;');
			$('#row' + (graphRow + 1) + 'col' + graphCol).attr('style', 'position: relative; z-index: -1; border-top: none; border-right: none;');
			$('#row' + (graphRow + 1) + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none;');

			$('#row' + graphRow + 'col' + graphCol).attr('style', 'overflow: visible; border-right: none; border-bottom: none;')
			//$('#row' + graphRow + 'col' + graphCol).attr('class', 'ui-draggable');
			$('#row' + graphRow + 'col' + graphCol).attr('draggable', 'true');
			$('#row' + graphRow + 'col' + graphCol).attr('x-lvl-draggable', 'true');
			$('#row' + graphRow + 'col' + graphCol).attr('data-placed', 'true');
			$('#row' + graphRow + 'col' + graphCol).removeAttr('x-lvl-drop-target');
			$('#row' + graphRow + 'col' + graphCol).removeAttr('x-on-drop');

			$('#row' + graphRow + 'col' + graphCol).append('<h3>' + title + '</h3>');	
			$('#row' + graphRow + 'col' + graphCol).append('<svg data-id = "' + id + '" title = "' + title + '" data-size = "small" style = "width: 200%; height: 180%; position: relative; z-index = 1;"></svg>');

			//$('#row' + graphRow + 'col' + graphCol).append('<svg id = "' + id + '" class = "ui-draggable" title = "' + drag.attr('title') + '" data-size = "small" data-placed = "true" style = "width: 200%; height: 200%; position: relative; z-index = 1; -moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none;" draggable = "true" x-lvl-draggable = "true"></svg>');

			angular.element(document).injector().invoke(function($compile) {
				$compile($('#row' + graphRow + 'col' + graphCol))($scope);
			});	

			// Updates the grid at the new location
			grid[graphRow][graphCol] = id;
			grid[graphRow][graphCol + 1] = id;
			grid[graphRow + 1][graphCol] = id;
			grid[graphRow + 1][graphCol + 1] = id;

			dashboardGrid[graphRow][graphCol] = id + 'S';
		}
		else if (size== 'large')
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

			usedRow = [0, 0, 0, 1, 1, 1];
			usedCol = [0, 1, 2, 0, 1, 2];

			var gridOld = [[], [], [], []];

			//copy grid
			for (var i = 0; i < grid.length; i++)
			{
				for (var j = 0; j < grid[i].length; j++)
					gridOld[i][j] = grid[i][j];
			}

			for (var i = 0; i < usedRow.length; i++)
			{
				grid[dragRow + usedRow[i]][dragCol + usedCol[i]] = undefined;
			}		

			if (spaceTaken(graphRow, graphCol, usedRow, usedCol) == false)
			{
				$('div.alert').remove();
				$('body').prepend('<div class="alert alert-danger" style = "position: fixed; z-index: 1; width: 100%"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong> Graph cannot be placed there.</div>');
				$('.alert').offset({top: $(window).scrollTop() + 51, left: $(window).scrollLeft()});
				
				grid = gridOld;
				return (false);
			}

			grid = gridOld;

			for (var i = 0; i < usedRow.length; i++)
			{
				grid[dragRow + usedRow[i]][dragCol + usedCol[i]] = undefined;
				resetCell(dragRow + usedRow[i], dragCol + usedCol[i]);
			}

			dashboardGrid[dragRow][dragCol] = undefined;

			$('#row' + graphRow + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none; border-right: none;');
			$('#row' + graphRow + 'col' + (graphCol + 2)).attr('style', 'position: relative; z-index: -1; border-left: none; border-bottom: none;');
			$('#row' + (graphRow + 1) + 'col' + graphCol).attr('style', 'position: relative; z-index: -1; border-top: none; border-right: none;');
			$('#row' + (graphRow + 1) + 'col' + (graphCol + 1)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none; border-right: none;');
			$('#row' + (graphRow + 1) + 'col' + (graphCol + 2)).attr('style', 'position: relative; z-index: -1; border-left: none; border-top: none;');

			$('#row' + graphRow + 'col' + graphCol).attr('style', 'overflow: visible; border-right: none; border-bottom: none;');
			$('#row' + graphRow + 'col' + graphCol).attr('draggable', 'true');
			$('#row' + graphRow + 'col' + graphCol).attr('x-lvl-draggable', 'true');
			$('#row' + graphRow + 'col' + graphCol).attr('data-placed', 'true');
			$('#row' + graphRow + 'col' + graphCol).removeAttr('x-lvl-drop-target');
			$('#row' + graphRow + 'col' + graphCol).removeAttr('x-on-drop');

			$('#row' + graphRow + 'col' + graphCol).append('<h3>' + title + '</h3>');	
			$('#row' + graphRow + 'col' + graphCol).append('<svg data-id = "' + id + '" title = "' + title + '" data-size = "large" style = "width: 300%; height: 180%; position: relative; z-index = 1;"></svg>');

			
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

			dashboardGrid[graphRow][graphCol] = id + 'L';
		}		

		var t = "";
		for (var i = 0; i < grid.length; i++)
		{
			for (var j = 0; j < grid[i].length; j++)
			{
				t += grid[i][j] + " "
			}
			t += "\n";
		}
		console.log(t);

		return ({'graphRow': graphRow, 'graphCol': graphCol});
	}

	//	----------------------------- Map Graphing Functions ----------------------
	var map;
	var popup;
	var closeTooltip;

    function getColor(d)
    {
		return d > 1000 ? '#8c2d04' :
			d > 500  ? '#cc4c02' :
			d > 200  ? '#ec7014' :
			d > 100  ? '#fe9929' :
			d > 50   ? '#fec44f' :
			d > 20   ? '#fee391' :
			d > 10   ? '#fff7bc' :
			'#ffffe5';
  	}

  	function getStyle(feature)
  	{
     	return {
        	weight: 2,
        	opacity: 0.1,
        	color: 'black',
        	fillOpacity: 0.7,
        	fillColor: getColor(feature.properties.density)
    	};
 	}
  
	function mousemove(e)
	{
		var layer = e.target;

		popup.setLatLng(e.latlng);
		popup.setContent('<div class="marker-title">' + layer.feature.properties.name + '</div>' +
		layer.feature.properties.density + ' people per square mile');

		if(!popup._map) 
			popup.openOn(map);
		window.clearTimeout(closeTooltip);

		// highlight feature
		layer.setStyle({
			weight: 3,
			opacity: 0.3,
			fillOpacity: 0.9
		});

		if(!L.Browser.ie && !L.Browser.opera)
			layer.bringToFront();
	}

	function mouseout(e)
	{
		statesLayer.resetStyle(e.target);
		closeTooltip = window.setTimeout(function() {
			map.closePopup();
		}, 100);
	}

	function zoomToFeature(e)
	{
		map.fitBounds(e.target.getBounds());
	}

	function onEachFeature(feature, layer)
	{
		console.log('onEachFeature');
		layer.on({
			mousemove: mousemove,
			mouseout: mouseout,
			click: zoomToFeature
		});
	}

	function getLegendHTML()
	{
		var grades = [0, 10, 20, 50, 100, 200, 500, 1000],
		labels = [],
		from, to;

		for(var i = 0; i < grades.length; i++)
		{
			from = grades[i];
			to = grades[i + 1];

			labels.push(
			'<li><span class="swatch" style="background:' + getColor(from + 1) + '"></span> ' +
			from +(to ? '&ndash;' + to : '+')) + '</li>';
		}

		return '<span>People per square mile</span><ul>' + labels.join('') + '</ul>';
	}

	// When a graph is placed or moved
	$scope.dropped = function(dragEl, dropEl)
	{
		console.log(dragEl);
		console.log(dropEl);

		var drag = angular.element(dragEl);
		var drop = angular.element(dropEl);
		var placed = false;	
		var returnedData;

		var graphObject;

		var dragRow;
		var dragCol;
		var droppedRow = parseInt(drop.attr('id').charAt(3));
		var droppedCol = parseInt(drop.attr('id').charAt(7));
		var dragRow;
		var dragCol;

		// If graph is being moved
		if (drag.attr('data-placed') == 'true')
		{
			drag = drag.children('svg');
			placed = true;	
			dragRow = parseInt(drag.parent().attr('id').charAt(3));
			dragCol = parseInt(drag.parent().attr('id').charAt(7));
		}

		var id = drag.attr('data-id');		
		var size = drag.attr('data-size');

		// Find the specific object that belongs to the dragged graph
		for(var i = 0; i < graphs.length; i++)
		{
			if(graphs[i].title == id)
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
					returnedData = placeGraph(droppedRow, droppedCol, size, graphObject.type, id);

					if(returnedData == false)
						return;

					d3.select("#row" + returnedData.graphRow + "col" + returnedData.graphCol +" > svg[data-id='" + id + "']")
					.datum(graphObject.chart_data)
					.call(chart);
					
					nv.utils.windowResize(chart.update);	

					return(chart);
				}
				
				returnedData = moveGraph(dragRow, dragCol, droppedRow, droppedCol, size, id);

				if(returnedData == false)
					return;

				d3.select("#row" + returnedData.graphRow + "col" + returnedData.graphCol +" > svg[data-id='" + id + "']")
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

				if (placed == false)
				{
					returnedData = placeGraph(droppedRow, droppedCol, size, graphObject.type, id);

					if(returnedData == false)
						return;

					temp = setInterval(function()
					{
						var offset = $("#row" + returnedData.graphRow + "col" + returnedData.graphCol +" > svg[data-id='" + id + "']").offset();
						
						if (offset == undefined)
						{
							clearInterval(temp);
							return;
						}
						// $('#plot' + num).siblings('.nvtooltip').css('left', offset.left);
						// $('#plot' + num).siblings('.nvtooltip').css('top', offset.top);
						$("#row" + returnedData.graphRow + "col" + returnedData.graphCol +" > svg[data-id='" + id + "']").siblings('.nvtooltip').offset({top: offset.top, left: offset.left});
						//$('#plot' + num).siblings('.nvtooltip').css('margin', 0);
					}, 1);

					d3.select("#row" + returnedData.graphRow + "col" + returnedData.graphCol +" > svg[data-id='" + id + "']")
					.datum(graphObject.chart_data)
					.call(chart);
					
					nv.utils.windowResize(chart.update);

					return(chart);		
				}

				returnedData = moveGraph(dragRow, dragCol, droppedRow, droppedCol, size, id);

				if(returnedData == false)
					return;

				temp = setInterval(function()
				{
					var offset = $("#row" + returnedData.graphRow + "col" + returnedData.graphCol +" > svg[data-id='" + id + "']").offset();

					if (offset == undefined)
					{
						clearInterval(temp);
						return;
					}
					// $('#plot' + num).siblings('.nvtooltip').css('left', offset.left);
					// $('#plot' + num).siblings('.nvtooltip').css('top', offset.top);
					$("#row" + returnedData.graphRow + "col" + returnedData.graphCol +" > svg[data-id='" + id + "']").siblings('.nvtooltip').offset({top: offset.top, left: offset.left});
					//$('#plot' + num).siblings('.nvtooltip').css('margin', 0);
				}, 1);

				d3.select("#row" + returnedData.graphRow + "col" + returnedData.graphCol +" > svg[data-id='" + id + "']")
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
					returnedData = placeGraph(droppedRow, droppedCol, size, graphObject.type, id);

					if(returnedData == false)
						return;

					d3.select("#row" + returnedData.graphRow + "col" + returnedData.graphCol +" > svg[data-id='" + id + "']")
					.datum(graphObject.chart_data)
					.transition().duration(350)
					.call(chart);
					
					nv.utils.windowResize(chart.update);	

					return(chart);
				}
			
				returnedData = moveGraph(dragRow, dragCol, droppedRow, droppedCol, size, id);

				if(returnedData == false)
					return;

				d3.select("#row" + returnedData.graphRow + "col" + returnedData.graphCol +" > svg[data-id='" + id + "']")
				.datum(graphObject.chart_data)
				.transition().duration(350)
				.call(chart);
				
				nv.utils.windowResize(chart.update);	
				
				return(chart);					
			});		
		}
		else if(graphObject.type == "choropleth")
		{
			if (placed == false)
			{
				returnedData = placeGraph(droppedRow, droppedCol, size, graphObject.type, id);

				if (returnedData == false)
					return;

				L.mapbox.accessToken = 'pk.eyJ1IjoiaHVtcGhyZXk4MTQ2IiwiYSI6Im9RTi1Nem8ifQ.LTyEXsadU42usXI8O4k2tg';
				
				console.log($("#row" + returnedData.graphRow + "col" + returnedData.graphCol +" > div[data-id='" + id + "']")[0]);


				map = L.mapbox.map($("#row" + returnedData.graphRow + "col" + returnedData.graphCol +" > div[data-id='" + id + "']")[0], 'examples.map-i86nkdio').setView([37.8, -96], 4);

				popup = new L.Popup({ autoPan: false });	  
				
				statesLayer = L.geoJson(graphObject.chart_data,  {
					style: getStyle,
					onEachFeature: onEachFeature
				}).addTo(map);	  

				map.legendControl.addLegend(getLegendHTML());
			}
		}
	};
	
	// Publish dashboard
	$scope.publish = function()
	{
		var dashboardName = prompt('What would you like to name this dashboard?');

		if (dashboardName == null)
			return;

		dashboardName = dashboardName.split(' ').join('_');

		/*	Long html for single dashboard page
			Could be a better way to create a new pie-badge*/
		var html = '<!DOCTYPE html>\n' +
			'<html lang="en" ng-app = "Dashboard">\n' +
			'<head>\n' +
			'<meta charset="utf-8">\n' +
			'<meta http-equiv="X-UA-Compatible" content="IE=edge">\n' +
			'<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
			'<meta name="description" content="">\n' +
			'<meta name="author" content="">\n' +
			'<link rel="icon" href="favicon.ico">\n' +
			'<title>' + dashboardName + '</title>\n' +
			'</head>\n' + 
			'<body ng-controller="MainCtrl">\n' + 
			'<img id = "loader" src = "images/ajax-loader.gif" style = "position: fixed; z-index: 9999; display: none;">\n' + 
			'<div id="darkLayer" class="darkClass" style="display:none"></div>\n' +
			'<div class="container-fluid" style = "margin-left: 15px; margin-right: 15px;" id = "grid">\n' +
			'<div class="row-fluid">\n' + 			
			'<div class="row-fluid">\n' + 
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row0col0"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row0col1"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row0col2"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row0col3"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row0col4"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row0col5"></div>\n' +
			'</div>\n' +
			'<div class="row-fluid">\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row1col0"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row1col1"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row1col2"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row1col3"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row1col4"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row1col5"></div>\n' +
			'</div>\n' +
			'<div class="row-fluid">\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row2col0"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row2col1"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row2col2"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row2col3"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row2col4"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row2col5"></div>\n' +
			'</div>\n' +
			'<div class="row-fluid">\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row3col0"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row3col1"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row3col2"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row3col3"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row3col4"></div>\n' +
			'<div class="col-xs-2 col-sm-2 col-md-2 col-lg-2 dashboardScaffodling" id = "row3col5"></div>\n' +
			'</div>\n' +
			'</div>\n' +
			'</div>\n' + 
			'<br><br>\n' +
			'<link rel = "stylesheet" href="../bower_components/bootstrap/dist/css/bootstrap.min.css">\n' + 	
			'<link rel = "stylesheet" href="../css/style.css">\n' +
			'<link rel = "stylesheet" href = "../bower_components/nvd3/nv.d3.css">\n' +  
			'<link rel = "stylesheet" href="https://api.tiles.mapbox.com/mapbox.js/v2.0.1/mapbox.css">\n' + 
			'<script type="text/javascript" src="../bower_components/jquery/dist/jquery.min.js"></script>\n' +
			// '<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.0/jquery-ui.js"></script>\n' +
			'<script type = "text/javascript" src = "../bower_components/bootstrap/dist/js/bootstrap.min.js"></script>\n' +
			'<script type = "text/javascript" src = "../bower_components/angular/angular.min.js"></script>\n' +
			'<script type = "text/javascript" src = "../bower_components/d3/d3.min.js"></script>\n' + 
			'<script type = "text/javascript" src = "../bower_components/nvd3/nv.d3.min.js"></script>\n' +			
			'<script type = "text/javascript" src = "../bower_components/socket.io-client/socket.io.js"></script>\n' + 		
			'<script type = "text/javascript" src = "../bower_components/lvl-drag-drop/script/lvl-uuid.js"></script>\n' +
			'<script type = "text/javascript" src = "../bower_components/lvl-drag-drop/script/lvl-drag-drop.js"></script>\n' +
			'<script src="https://api.tiles.mapbox.com/mapbox.js/v2.0.1/mapbox.js"></script>\n' + 
			'<script type = "text/javascript" src = "../js/client_handler.js"></script>\n' +
			'<script type = "text/javascript" src = "../js/dashboard_display.js"></script>\n' + 
			'</body>\n' + 
			'</html>';		

		
		console.log("saving");
		// Sending dashboard data to redis and opening a new window for that single page dashboard
		client.saveDashboard({'title': dashboardName, 'html': html, 'grid': dashboardGrid}, function()
		{
			alert("You will now be redirected to your dashbaord.");
			var popup = window.open('/' + dashboardName, "_blank", "location = yes, menubar = yes, status = yes, titlebar = yes, height = " + screen.height + ", width = " + screen.width, false);
			popup.moveTo(0, 0);
			// location.reload(true);
		});		
	}
}]);

