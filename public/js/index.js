var socket = io('localhost');

var app = angular.module("Visualization", ['lvl.directives.dragdrop']);

app.controller('MainCtrl', ['$scope', function($scope) 
{
	var client = new Handler(socket);
	var fields;
	var dataObjectArray;				// JSON format for the data
	var operators = ['+', '-', '*', '/', 'sum()', 'count()', 'avg()'];
	var graphTypes = ['bar', 'line', 'pie', 'choropleth'];

	$(document).ready(function()
	{
		$('#loader').css('top', ($(window).height() / 2) + 'px'); 
		$('#loader').css('left', ($(window).width() / 2) + 'px');
		$('#darkLayer').css('height', $(document).height());

		setTimeout(addLoader(), 0);

		populateFileList();

		jQuery.event.props.push('dataTransfer');
		$('input[type=file]').bootstrapFileInput();

		// copy and paste option for data input
		$("#area").bind('paste', function(e)
		{
			var elem = $(this);

			setTimeout(function()
			{		       
				setTimeout(addLoader(), 0);

				var data = $('#area').val();
				var results = $.parse(data);
				//console.log(results.results.rows);
				dataObjectArray = results.results.rows;
				fields = results.results.fields;

				$('#dataTable').empty();
				generateFields();
				generateOperators();

				removeLoader();

				//console.log(JSON.stringify(dataObjectArray));
			}, 1000);
		});

		$(document).on('change', '.btn-file :file', function() 
		{
			var input = $(this);
			var numFiles = input.get(0).files ? input.get(0).files.length : 1
			var label = input.val().replace(/\\/g, '/').replace(/.*\//, '');

			input.trigger('fileselect', [numFiles, label]);		// calls the event below
		});

		$('.btn-file :file').on('fileselect', function(event, numFiles, label)
		{
			var input = $(this).parents('.input-group').find(':text')
			var log = numFiles > 1 ? numFiles + ' files selected' : label;

			if(input.length) 
				input.val(log);
			else if( log ) 
				alert(log);
		});

		// uploading files
		socket.on('connect', function()
		{
			var delivery = new Delivery(socket);
			
			delivery.on('delivery.connect',function(delivery)
			{
				$("button[type=submit]").click(function(evt)
				{
					setTimeout(addLoader(), 0);
					var file = $("input[type=file]")[0].files[0];
					delivery.send(file);
					evt.preventDefault();
				});
			});

			delivery.on('send.success', function(fileUID)
			{
				alert(fileUID.name  + " was successfully uploaded.");
				$scope.fileUpload();
			});
		});

		// calcaulte metric equation button enabled/disabled functionality
		var submitCheck = function() 
		{
			if($('#metricEquation').val() != '')
				$('#statSubmit').removeAttr('disabled');
			else
				$('#statSubmit').attr('disabled', 'disabled');
		}

		$('#metricEquation').keyup(submitCheck);
		$('#metricEquation').mouseenter(submitCheck);	

		removeLoader();
	});	// end $(document).ready

	// shows laoding gif
	function addLoader()
	{
		// setTimeout(function()
		// {
			$('#loader').show();
			$('#darkLayer').show();
			
		// }, 0)
	}

	// hides loading gif
	function removeLoader()
	{
		setTimeout(function()
		{
			$('#loader').hide();
			$('#darkLayer').hide();
		}, 1000);		
	}

	// uploading a file
	$scope.fileUpload = function()
	{
		setTimeout(addLoader(), 0);

		client.fileUploadRequest(function(data)
		{			
			dataObjectArray = new Array();

			Papa.parse(data, 
			{
				header: true,
				worker: true,
				step: function(row)
				{
					dataObjectArray.push(row);
				},
				complete: function()
				{					
					finishedParsing(data);
				}
			});		
		});
	};

	// populates uploaded files, sample data, ifloops.com
	function populateFileList()
	{
		client.filesList(function(filesObject)
		{
			// gets uploaded files
			$('#storedList').empty();

			var uploaded_files = filesObject.uploaded_files;
			
			for(var i = 0; i < uploaded_files.length; i++)
			{
				var file = uploaded_files[i];

				var li = document.createElement('li');
				var a = document.createElement('a');
				a.setAttribute('id', file);
				a.setAttribute('style', 'cursor: default;');

				a.onclick = function()
				{
					storedData(this.getAttribute('id'));
				};

				a.innerHTML = file.substr(file.indexOf('uploaded_files') + 'uploaded_files'.length + 1);	
				li.appendChild(a);
				$('#storedList').append(li);
			}

			// gets sample data
			$('#sampleData').empty();

			var sample_data = filesObject.sample_data;

			for(var i = 0; i < sample_data.length; i++)
			{
				var file = sample_data[i];

				var li = document.createElement('li');
				var a = document.createElement('a');
				a.setAttribute('id', file);
				a.setAttribute('style', 'cursor: default;');
		
				a.onclick = function()
				{
					storedData(this.getAttribute('id'));
				};

				a.innerHTML = file.substr(file.indexOf('sample_data') + 'sample_data'.length + 1);	
				li.appendChild(a);
				$('#sampleData').append(li);
			}

			//gets tabels from ifloops.com
			$('#mysqlTables').empty();

			var mysqlTables = filesObject.mysql_tables;

			for (var i = 0; i < mysqlTables.length; i++)
			{
				var table_name = mysqlTables[i];

				var li = document.createElement('li');
				var a = document.createElement('a');
				a.setAttribute('id', table_name);
				a.setAttribute('style', 'cursor: default;');
		
				a.onclick = function()
				{
					var numEntries = prompt('How many entries would you like?\n(Exceeding 1000 entries may impact performance)')

					if (numEntries == null || isNaN(numEntries) == true)
					{
						alert('Invalid input.');
						return;
					}
					storedTable(this.getAttribute('id'), numEntries);
				};

				a.innerHTML = table_name;	
				li.appendChild(a);
				$('#mysqlTables').append(li);
			}
		});
	}

	function finishedParsing(data)
	{	
		fields = Object.keys(dataObjectArray[0]);

		$('#dataTable').empty();
		generateFields();
		populateTable();
		generateOperators();

		$('#area').val(data);

		removeLoader();
	}

	// access uploaded file or sample data
	function storedData(name)
	{	
		setTimeout(addLoader(), 0);		

		client.storedDataRequest(name, function(data)
		{
			dataObjectArray = new Array();

			Papa.parse(data, 
			{
				header: true,
				worker: true,
				step: function(row)
				{
					//console.log(JSON.stringify(row.data[0]));
					dataObjectArray.push(row.data[0]);
				},
				complete: function()
				{	
					console.log(JSON.stringify(dataObjectArray));				
					finishedParsing(data);
				}
			});		
		});
	}

	// access a table from ifloops.com
	function storedTable(table, numEntries)
	{
		setTimeout(addLoader(), 0);

		client.storedTable(table, numEntries, function(tableObject)
		{
			fields = tableObject.headers;
			dataObjectArray = tableObject.data;

			var rawData = Papa.unparse(dataObjectArray);

			$('#dataTable').empty();
			generateFields();
			populateTable();
			generateOperators();

			$('#area').val(rawData);

			removeLoader();
		});
	}

	// generates the draggable fields and table header
	function generateFields()
	{
		$('.fields').empty();

		var thead = document.createElement('thead');
		$('#dataTable').append(thead);

		var tr;

		tr = document.createElement('tr');
		tr.setAttribute('id', 'header');
		$('thead').append(tr);

		for(var i = 0; i < fields.length; i++)
		{
			tr = document.createElement('tr');
			tr.setAttribute('style', '-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none;');
			tr.setAttribute('x-lvl-draggable', 'true');
			tr.setAttribute('draggable', 'true');
			tr.setAttribute('id', fields[i]);
			tr.setAttribute('class', 'ui-draggable');

			var td = document.createElement('td');
			td.innerHTML = fields[i];
			
			tr.appendChild(td);

			angular.element(document).injector().invoke(function($compile) {
				$compile(tr)($scope);
			});	

			$('.fields').append(tr);	

			var th = document.createElement('th');			
			th.innerHTML = fields[i] + "&nbsp;&nbsp;&nbsp;";

			th.onclick = function()
			{
				setTimeout(addLoader(), 0);
				removeLoader();
			};

			$('#header').append(th);
		}
	}

	// generates the draggable operators for stats option
	function generateOperators()
	{
		$('.operators').empty();

		for(var i = 0; i < operators.length; i++)
		{
			var tr = document.createElement('tr');
			tr.setAttribute('style', '-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none;');
			tr.setAttribute('x-lvl-draggable', 'true');
			tr.setAttribute('draggable', 'true');
			tr.setAttribute('id', operators[i]);
			tr.setAttribute('class', 'ui-draggable');

			var td = document.createElement('td');
			td.innerHTML = operators[i];
			
			tr.appendChild(td);

			angular.element(document).injector().invoke(function($compile) {
				$compile(tr)($scope);
			});	

			$('.operators').append(tr);	
		}
	}

	// displays the raw data in table format
	function populateTable()
	{
		var tbody = document.createElement('tbody');
		tbody.setAttribute('id', 'tableBody')
		$('#dataTable').append(tbody);

		for (var i = 0; i < dataObjectArray.length; i++)
		{
			var tr = document.createElement('tr');
			
			for (var key in dataObjectArray[i])
			{
				var value = dataObjectArray[i][key];				
				var td = document.createElement('td');
				td.innerHTML = value;
				tr.appendChild(td);
				$('#tableBody').append(tr);
			}
		}

		$('#dataTable').tablesorter();
	}

	// select sample data 
	// $scope.sampleData = function(num)
	// {
	// 	client.sampleDataRequest(num, function(data)
	// 	{
	// 		console.log(data);

	// 		$('#area').val(data);
	// 		var results = $.parse(data);	
	// 		console.log(results.results.rows[0]);
	// 		dataObjectArray = results.results.rows;
	// 		fields = results.results.fields;
			
	// 		generateFields();
	// 		generateOperators();

	// 		console.log(JSON.stringify(dataObjectArray));
	// 	});
	// };


	var xAxis;					// bar/line
	var yAxis;					// bar/line
	var grouping;				// grouping field for data
	var valueField;				// pie
	var countField;				// pie
	var locationField;			// choropleth map
	var choroplethValueField;	// choropleth map
	var currentTab = 1;			// 1 = bar, 2 = line, 3 = pie, 4 = choropleth map
	var temp;

	// clears/resets all fields, labels, and charts,
	$scope.clearAll = function()
	{
		$(".saveBtn").attr("disabled", "disabled"); // to make save button unclickable
		if(currentTab == 1)
		{
			$('#xAxisBar').val('');
			$('#yAxisBar').val('');
			$('#barGraph').empty();
			$('titleBar').val('');
		}
		else if(currentTab == 2)
		{
			$('#xAxisLine').val('');
			$('#yAxisLine').val('');
			$('#groupingLine').val('');
			$('#lineGraph').empty();
			$('#groupingLine').val('');
			$('titleLine').val('');

			temp = setInterval(function()
			{
				$('.nvtooltip').css('display', 'none');
			}, 0);
		}
		else if(currentTab == 3)
		{
			$('#valueField').val('');
			$('#countField').val('');
			$('#pieChart').empty();
			$('#title').val('');
		}
		else if(currentTab == 4)
		{
			$('#locationField').val('');
			$('#choroplethValueField').val('');
			$('#map').empty();
		}

		xAxis = '';
		yAxis = '';
		grouping = '';
		valueField = '';
		countField = '';
		locationField = '';
		choroplethValueField = '';
	};

	// when user clicks a visualization type tab
	$scope.selectVisualizationType = function()
	{
		$scope.clearAll();
		currentTab = $scope.graphTab;
	};

	// drag and drop functionality for the fields of the visualization
	$scope.dropped = function(dragEl, dropEl)
	{
		// console.log(dragEl);
		// console.log(dropEl);

		var drag = angular.element(dragEl);
		var drop = angular.element(dropEl);

		drop.val(drag.attr('id'));
		
		readyToGraph();
	};

	// drag and drop functionality for metric options
	$scope.droppedMetric = function(dragEl, dropEl)
	{
		console.log(dragEl);
		console.log(dropEl);

		var drag = angular.element(dragEl);
		var drop = angular.element(dropEl);
		var operator;

		console.log($('#metricFields').children().length);
		
		if($('#metricFields').children().length == 2)
			return;

		drop.val(drop.val() + drag.attr('id'));

		if(drag.attr('id').indexOf('()') != -1)
		{
			operator = drag.attr('id').substring(0, drag.attr('id').indexOf('()'));
			console.log(operator);

			var label = document.createElement('label')
			label.setAttribute('class', 'inputMetricField');
			label.innerHTML = '<br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;	' + operator + ':&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';

			var input = document.createElement('input');
			input.setAttribute('id', operator);
			input.setAttribute('type', 'email');
			input.setAttribute('class', 'inputMetricField');
			input.setAttribute('placeholder', 'Drop field here');
			input.setAttribute('x-lvl-drop-target', 'true');
			input.setAttribute('x-on-drop', 'droppedMetricField(dragEl, dropEl)');
			
			angular.element(document).injector().invoke(function($compile) {
				$compile(input)($scope);
			});	

			$('#metricFields').append(label);
			$('#metricFields').append(input);
		}
	};

	// drag and drop functionality for certain operators for the metric equation
	$scope.droppedMetricField = function(dragEl, dropEl)
	{
		// console.log(dragEl);
		// console.log(dropEl);

		var drag = angular.element(dragEl);
		var drop = angular.element(dropEl);

		var operator = drop.attr('id');
		var field = drag.attr('id');

		if(operator == 'sum')
		{
			var sum = 0;

			for(var i = 0; i < dataObjectArray.length; i++)
			{
				if(dataObjectArray[i][field] != '')
					sum += dataObjectArray[i][field];
			}

			console.log(sum);
			$('#metricEquation').val($('#metricEquation').val().replace(operator + '()', sum));
		}
		else if(operator == 'count')
		{
			var count = 0;

			for(var i = 0; i < dataObjectArray.length; i++)
			{
				if(dataObjectArray[i][field] != '')
					count++;
			}

			console.log(count);
			$('#metricEquation').val($('#metricEquation').val().replace(operator + '()', count));
		}
		else if(operator == 'avg')
		{
			var sum = 0;

			for(var i = 0; i < dataObjectArray.length; i++)
			{
				if(dataObjectArray[i][field] != '')
					sum += dataObjectArray[i][field];
			}

			console.log(sum);
			console.log(dataObjectArray.length);
			$('#metricEquation').val($('#metricEquation').val().replace(operator + '()', sum / dataObjectArray.length));
		}

		$('.inputMetricField').remove();
	};

	// clears the metric equation
	$scope.clearMetric = function()
	{
		$('.inputMetricField').remove();
		$('#metricEquation').val('');
		$('#statSubmit').attr('disabled', 'disabled');
	};

	// calcaultes the metric equation
	$scope.calculateMetric = function()
	{
		if($('#metricEquation').val() != '')
		{
			try	
			{
				var result = eval($('#metricEquation').val());

				if((typeof result) === 'number')
					$('#metricEquation').val(result);
			}
			catch(err)
			{
				return;
			}
		}			
	};

	// graphs the specified visualization type if all necessary input is there
	function readyToGraph()
	{
		if($scope.graphTab == 1)
		{
			xAxis = $('#xAxisBar').val();
			yAxis = $('#yAxisBar').val();

			if(xAxis != '' && yAxis != '')
			{
				console.log('plotBar()');
				plotBar();
			}
		}
		else if($scope.graphTab == 2)
		{
			xAxis = $('#xAxisLine').val();
			yAxis = $('#yAxisLine').val();
			grouping = $('#groupingLine').val();

			clearInterval(temp);

			if(xAxis != '' && yAxis != '')
			{
				console.log('plotLine()');
				plotLine();
			}
		}
		else if($scope.graphTab == 3)
		{
			valueField = $('#valueField').val();
			countField = $('#countField').val();

			if(valueField != '')
			{
				console.log('plotPie()');
				plotPie();
			}
		}
		else if($scope.graphTab == 4)
		{
			locationField = $('#locationField').val();
			choroplethValueField = $('#choroplethValueField').val();

			if(locationField != '' && choroplethValueField != '')
			{
				console.log('plotChoroplethMap()');
				plotChoroplethMap();
			}
		}		
		else if($scope.graphTab == 5)
		{
			// if stats tab is selected
		}

		// console.log('xAxis: ' + xAxis);
		// console.log('yAxis: ' + yAxis);
		// console.log('valueField: ' + valueField);
		// console.log('countField: ' + countField);
		// console.log('locationField: ' + locationField);
		// console.log('choroplethValueField: ' + choroplethValueField);
	}

	var chartData;

	//---------------------------------BAR-----------------------------------------
	function plotBar()
	{
		// var svg = document.createElement("svg");
		// svg.setAttribute("id", "barGraph");
		// svg.setAttribute('width', '500');
		// svg.setAttribute('height', '500');
		
		// $('#chart1').append(svg);

		$('#barGraph').empty();
		console.log(JSON.stringify(dataObjectArray));

		var values = new Array();

		for(var i = 0; i < dataObjectArray.length; i++)
		{
			values.push({'label': dataObjectArray[i][xAxis].toString(), 'value': parseFloat(dataObjectArray[i][yAxis])});
		}

		chartData = new Array();
		chartData[0] = {key: yAxis, values: values};

		console.log(JSON.stringify(chartData));

		nv.addGraph(function()
		{
			var chart = nv.models.discreteBarChart()
					.x(function(d) { return d.label })    //Specify the data accessors.
					.y(function(d) { return d.value })
					.staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
					.tooltips(false	)        //Don't show tooltips
					.showValues(true)       //...instead, show the bar value right on top of each bar.
					.transitionDuration(350);

			d3.select('#barGraph')
			.datum(chartData)
			.call(chart);

			nv.utils.windowResize(chart.update);

			return(chart);
		});
	}

	//----------------------------------------------Line------------------------------------------
	function parseDateTime(value)
	{
		value = value.trim();

		var dateArray;
		var timeArray;
		var split = value.split(" ");
		var date;
		var time;
	
		if(split.length == 1)
			date = split[0];
		else if(split.length == 2)
		{
			date = split[0];
			time = split[1];
		}

		if(date.indexOf('/') != -1)
			dateArray = date.split('/');
		else if(date.indexOf('-') != -1)
			dateArray = date.split('-');
		else
			return(parseFloat(value));
		
		if(time != undefined && time.indexOf(':') != -1)
			timeArray = time.split(':');
		else
			return(new Date(dateArray[2], dateArray[0] - 1, dateArray[1]));

		return(new Date(dateArray[2], dateArray[0] - 1, dateArray[1], timeArray[0], timeArray[1], timeArray[2], 0));
	}	

	var isDateTime;

	function plotLine()
	{	
		$('#lineGraph').empty();
		$('#chart2').append(lineGraph);

		//$('#title').remove();
		//chartTitle = $('#chartTitle').val();
		
		var value;
		var colors = ['#FF0000', '#0000FF', '#00FF00', '#6600FF', '#FF00FF', '#663300', '#666699'];
		var colorsIndex = 0;
		var individualData;
		var group;
		var groupExists = false;
		var xValueString;
		var yValueString;
		var xValue;
		var yValue;
		var limit = 65;
		isDateTime = false;
		chartData = new Array();			
		var temp;
		var max = 0;

		if(xAxis == 'date' || xAxis == 'time' || xAxis == 'Date' || xAxis == 'Time' || xAxis == 'Field1')
			isDateTime = true;
		else
			isDateTime = false;

		if (grouping != '')
		{
			for (var i = 0; i < dataObjectArray.length; i++)
			{
				group = dataObjectArray[i][grouping];
				xValueString = dataObjectArray[i][xAxis];
				yValueString = dataObjectArray[i][yAxis];

				if (group == '' || xValueString == '')
					continue;
				else if (yValueString == '')
					yValueString = '0';

				// console.log(group);

				if (isDateTime == true)
				{
					//xValue = parseDateTime(xValue.toString());
					var format = d3.time.format('%m/%d/%Y');
					xValue = format.parse(xValueString.toString());

					if (xValue == null)
					{
						format = d3.time.format('%m/%d/%Y %H:%M:%S');
						xValue = format.parse(xValueString.toString());
					}

					if(xValue instanceof Date == true)
						value = {x: xValue.getTime(), y: parseFloat(yValueString)};
				
					else
					{
						value = {x: xValueString, y: parseFloat(yValueString)};
						isDateTime = false;
					}
				}
				else
					value = {x: xValueString, y: parseFloat(yValueString)};	

				if (parseFloat(yValueString) > max)
					max = parseFloat(yValueString);

				//console.log(JSON.stringify(value));

				if (chartData.length == 0)
				{
					temp = new Array ();
					temp.push(value);

					chartData[0] = {values: temp, key: group.substr(0, limit), color: colors[colorsIndex]};
					colorsIndex = (colorsIndex + 1) % colors.length;
					//console.log(JSON.stringify(chartData));
				}
				else
				{
					for (var j = 0; j < chartData.length; j++)
					{
						if (chartData[j].key.substr(0, limit) == group.substr(0, limit))
						{
							chartData[j].values.push(value);

							// var values = chartData[j].values;
							//console.log(chartData[j].values.length);

							// for (var k = 0; k < chartData[j].values.length; k++)
							// {
							// 	console.log("value.x: " + value.x + "\nchartData[j].values[k].x: " + chartData[j].values[k].x);
							// 	if (value.x < chartData[j].values[k].x || k == chartData[j].values.length - 1)
							// 	{
							// 		chartData[j].values.splice(k, 0, value);
							// 		// console.log(JSON.stringify(chartData[j].values));
							// 		// console.log("**************************************************************************");
							// 		break;
							// 	}
							// }

			
							//chartData[j].values = values;
							groupExists = true;
							break;
						}						
					}

					if (groupExists == false)
					{
						temp = new Array ();
						temp.push(value);

						chartData.push({values: temp, key: group.substr(0, limit), color: colors[colorsIndex]});
						colorsIndex = (colorsIndex + 1) % colors.length;
					}

					groupExists = false;
				}
			}
		}
		else
		{
			for (var i = 0; i < dataObjectArray.length; i++)
			{
				xValueString = dataObjectArray[i][xAxis];
				yValueString = dataObjectArray[i][yAxis];

				if (xValueString == '')
					continue;
				else if (yValueString == '')
					yValueString = '0';

				if (isDateTime == true)
				{
					//xValue = parseDateTime(xValue.toString());
					var format = d3.time.format('%m/%d/%Y');
					xValue = format.parse(xValueString.toString());

					if (xValue == null)
					{
						format = d3.time.format('%m/%d/%Y %H:%M:%S');
						xValue = format.parse(xValueString.toString());
					}

					if(xValue instanceof Date == true)
						value = {x: xValue.getTime(), y: parseFloat(yValueString)};
					else
					{
						value = {x: xValueString, y: parseFloat(yValueString)};
						isDateTime = false;
					}
				}
				else
					value = {x: xValueString, y: parseFloat(yValueString)};	

				if (parseFloat(yValueString) > max)
					max = parseFloat(yValueString);

				if (chartData.length == 0)
				{
					temp = new Array();
					temp.push(value);

					chartData[0] = {values: temp, key: yAxis, color: colors[colorsIndex]};
					colorsIndex = (colorsIndex + 1) % colors.length;
				}
				else
					chartData[0].values.push(value);					
			}
		}

		console.log(JSON.stringify(chartData));
		//return;


		// if(grouping != '')
		// 	group = dataObjectArray[0][grouping];			
		// else
		// 	group = false;	

		// if(xAxis == 'date' || xAxis == 'time' || xAxis == 'Date' || xAxis == 'Time' || xAxis == 'Field1')
		// {
		// 	isDateTime = true;
		// 	xValue = parseDateTime(dataObjectArray[0][xAxis].toString());

		// 	if(xValue instanceof Date == true)
		// 		values.push({x: xValue.getTime(), y: parseFloat(dataObjectArray[0][yAxis])});
		// 	else
		// 	{
		// 		values.push({x: xValue, y: parseFloat(dataObjectArray[0][yAxis])});
		// 		isDateTime = false;
		// 	}
		// }
		// else
		// {
		// 	values.push({x: dataObjectArray[0][xAxis], y: parseFloat(dataObjectArray[0][yAxis])});	
		// }
	
		// console.log('isDateTime: ' + isDateTime);		
		
		// for(var i = 1; i < dataObjectArray.length; i++)
		// {				
		// 	if(group != false && group != dataObjectArray[i][grouping] && group != '')
		// 	{
		// 		//console.log('group: ' + group);

		// 		groupExists = false;

		// 		for(var j = 0; j < chartData.length; j++)
		// 		{
		// 			if(chartData[j].key.substr(0, limit) == group.substr(0, limit))
		// 			{
		// 				var newValues = chartData[j].values;

		// 				for(var k = 0; k < values.length; k++)
		// 					newValues.push(values[k]);

		// 				chartData[j].values = newValues;
		// 				groupExists = true;
		// 				break;
		// 			}
		// 		}

		// 		if(groupExists == false)
		// 		{
		// 			console.log('group: ' + group.substr(0, limit));
		// 			individualData = {values: values, key: group.substr(0, limit), color: colors[colorsIndex]};
		// 			chartData.push(individualData);
		// 			colorsIndex =(colorsIndex + 1) % colors.length;

		// 			//console.log(JSON.stringify(individualData));
		// 		}
			
		// 		group = dataObjectArray[i][grouping];
		// 		values = new Array();

		// 		// console.log('chartData: ' + JSON.stringify(chartData));
		// 		// return;
		// 	}// end if 

		// 	xValue = dataObjectArray[i][xAxis];
		// 	yValue = dataObjectArray[i][yAxis];


		// 	if (yValue == '')
		// 		yValue = '0';
			
		// 	if (xValue != '')
		// 	{
		// 		if(isDateTime == true)
		// 		{				
		// 			xValue = parseDateTime(xValue.toString());

		// 			if(xValue instanceof Date == true)
		// 				values.push({x: xValue.getTime(), y: parseFloat(yValue)});
		// 			else
		// 				values.push({x: xValue, y: parseFloat(yValue)});				
		// 		}
		// 		else
		// 			values.push({x: xValue, y: parseFloat(yValue)});	
		// 	}		
		// }//end for

		// //adding last element
		// if(group == false)
		// {
		// 	console.log('group: ' + group.substr(0, limit));
		// 	individualData = {values: values, key: yAxis, color: colors[colorsIndex]};
		// 	chartData.push(individualData);
		// }
		// else
		// {
		// 	groupExists = false;

		// 	for(var j = 0; j < chartData.length; j++)
		// 	{
		// 		if(chartData[j].key.substr(0, limit) == group.substr(0, limit))
		// 		{
		// 			var newValues = chartData[j].values;

		// 			for(var k = 0; k < values.length; k++)
		// 				newValues.push(values[k]);

		// 			chartData[j].values = newValues;
		// 			groupExists = true;
		// 			break;
		// 		}
		// 	}

		// 	if(groupExists == false)
		// 	{
		// 		console.log('group: ' + group.substr(0, limit));
		// 		individualData = {values: values, key: group.substr(0, limit), color: colors[colorsIndex]};
		// 		chartData.push(individualData);

		// 		console.log(JSON.stringify(individualData));
		// 	}
		// }

		//console.log(JSON.stringify(chartData));
		//console.log(chartData.length);
		//return;
		
	
		//$('#chart').prepend('<div id = "title" style = "font-size: 30px; margin-top: 1%;">' + chartTitle + '</div>');
		
		nv.addGraph(function()
		{
			var chart = nv.models.lineChart()
			.useInteractiveGuideline(true)
			.transitionDuration(350)
			.showYAxis(true)
			.showXAxis(true);
			

			chart.xAxis.rotateLabels(-65);
			chart.xAxis.showMaxMin(true);
			chart.xAxis.axisLabel(xAxis);
			
			if(isDateTime == true)
			{
				chart.xAxis.tickFormat(function(d)
				{
					return d3.time.format('%c')(new Date(d));
				});
				chart.margin({left: 80, right: 80, bottom: 180});
			}
			else
			{
				chart.xAxis.tickFormat(d3.format(',g'));
				chart.margin({left: 100, right: 80, bottom: 80});
			}

			chart.yAxis.axisLabel(yAxis);
			chart.yAxis.tickFormat(d3.format(',g'));
			chart.lines.forceY([0, max]);

			
			d3.select('#lineGraph').datum(chartData).call(chart);
			nv.utils.windowResize(chart.update);		
			
			return(chart);		
		});				
	}

	//-------------------------- PIE ------------------------------------------
	function addToArray(array, element)
	{		
		for(var i = 0; i < array.length; i++)
		{
			if(array[i]['label'] == element)
			{
				array[i]['value']++;
				return(array);
			}
		}		
		
		array.push({'label': element, 'value': 1});
		return(array);		
	}
	
	function plotPie()
	{
		$('#pieChart').empty();
		//$('#title').remove();
		//chartTitle = $('#chartTitle').val();
		
		var cumulativeArray = new Array();
		var valueLabel = $('#valueField').val();
		var countField = $('#countField').val();		
		chartData = new Array();
		
		if(countField == '')
		{
			for(var i = 0; i < dataObjectArray.length; i++)
			{
				var value = dataObjectArray[i][valueLabel];	
				
				if(value != '')
					chartData = addToArray(chartData, value);
			}
		}
		else
		{
			for(var i = 0; i < dataObjectArray.length; i++)
			{				
				chartData.push({'label': dataObjectArray[i][valueLabel], 'value': dataObjectArray[i][countField]});
			}			
		}
		console.log(JSON.stringify(chartData));		
		
		//$('#chart').prepend('<div id = "title" style = "font-size: 30px; margin-top: 1%;">' + chartTitle + '</div>');
		
		nv.addGraph(function() 
		{
			var chart = nv.models.pieChart()
			.x(function(d) { return d.label; })
			.y(function(d) { return d.value; })
			.showLabels(true);

			d3.select('#pieChart')
			.datum(chartData)
			.transition().duration(350)
			.call(chart);
			
			nv.utils.windowResize(chart.update);	
			
			return(chart);
		});		
	}

	//-------------------------- MAP GRAPHING ----------------------------------
	// Still glitchy, shading won't display unless I force the location of 
	// element with class leaflet-zoom-animated
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

	function plotChoroplethMap()
	{
		var i;
		var locationField = $('#locationField').val();
		var valueField = $('#valueField'). val();

		map = L.mapbox.map('map', 'examples.map-i86nkdio')
		.setView([37.8, -96], 4);

		popup = new L.Popup({ autoPan: false });	  

		console.log(statesData);
		statesLayer = L.geoJson(statesData,  {
			style: getStyle,
			onEachFeature: onEachFeature
		}).addTo(map);	  

		map.legendControl.addLegend(getLegendHTML());

		// $('.leaflet-zoom-animated').attr('width', '2000');
		// $('.leaflet-zoom-animated').attr('height', '629');
		
		// $('.leaflet-zoom-animated').attr('style', '-webkit-transform: translate3d(0, 0, 0); width: 2000px; height: 629px;');

		// var e = document.getElementsByClassName('leaflet-zoom-animated')[0];
		// e.setAttribute('width', '2000');
		// e.setAttribute('height', '629')
		// e.setAttribute('viewBox', '0 0 2000 629')
		// e.setAttribute('id', 'choroplethMap');
		
		// var x;
		// var y;
		// var z;

		// setInterval(function()
		// {
		// 	var attr = $('.leaflet-map-pane').attr('style');
		// 	attr = attr.substring(attr.indexOf('(') + 1);

		// 	var x = attr.substr(0, attr.indexOf('px'));			
		// 	attr = attr.substring(attr.indexOf('px') + 4);

		// 	var y = attr.substr(0, attr.indexOf('px'));
		// 	attr = attr.substring(attr.indexOf('px') + 4);

		// 	var z = attr.substr(0, attr.indexOf('px'));

		// 	// console.log('x = ' + x);
		// 	// console.log('y = ' + y);
		// 	// console.log('z = ' + z);

		// 	$('#choroplethMap').attr('style', '-webkit-transform: translate3d(' + x + ', ' + y + 'px, ' + z + 'px); width: 2000px; height: 629px;');

		// 	if(document.getElementById('choroplethMap') != undefined)
		// 		document.getElementById('choroplethMap').removeAttribute('viewBox');	
		// }, 1000);
	}

	// saving chart to local drive
	$scope.saveFigure = function()
	{
		var canvas;
		var image;
		var ctx;
		var graph;
		var title;

		if($scope.graphTab == 1)
		{
			graph = document.getElementById('barGraph');
			canvas = document.getElementById('barCanvas');
			image = document.getElementById('barImage');
			title = $('#titleBar').val();

			ctx = canvas.getContext('2d');
			ctx.drawSvg('<svg>' + graph.innerHTML + '/<svg>', 0, 0, 800, 500);
			image.src = canvas.toDataURL();
			console.log(image.src);

		
			// var download = document.createElement('a');
			// download.href = canvas.toDataURL();
			// download.download = 'asdf';
			// download.click();			
		}
		else if($scope.graphTab == 2)
		{			
			graph = document.getElementById('lineGraph');	
			canvas = document.getElementById('lineCanvas');
			image = document.getElementById('lineImage');
			title = $('#titleLine').val();

			ctx = canvas.getContext('2d');
			ctx.drawSvg('<svg>' + graph.innerHTML + '/<svg>', 0, 0, 1050, 850);
			image.src = canvas.toDataURL();

			// var download = document.createElement('a');
			// download.href = canvas.toDataURL();
			// download.download = 'asdf';
			// download.click();			
		}

		else if($scope.graphTab == 3)
		{
			graph = document.getElementById('pieChart');
			canvas = document.getElementById('pieCanvas');
			image = document.getElementById('pieImage');
			title = $('#titlePie').val();

			ctx = canvas.getContext('2d');
			ctx.drawSvg('<svg>' + graph.innerHTML + '/<svg>', 0, 0, 800, 470);
			image.src = canvas.toDataURL();

			// var download = document.createElement('a');
			// download.href = canvas.toDataURL();
			// download.download = 'asdf';
			// download.click();			
		}		
		else if($scope.graphTab == 4)
		{
			// var style = $('#map').attr('style');
			// $('#map').attr('style', 'display: none;' + style);
			// tmp.appendChild(document.getElementById('choroplethMap'));
			// canvas = document.getElementById('choroplethMapCanvas');
			// image = document.getElementById('choroplethMapImage');
			// ctx = canvas.getContext('2d');
			// ctx.drawSvg(tmp.innerHTML, 0, 0, 800, 470);
			// image.src = canvas.toDataURL();
			// image.setAttribute('style', 'border: 1px solid;')
		}		

		// send chart information to redis, for dashboard.js to use
		client.getSavedGraphs(function(graphObjects)
		{
			for (var i = 0; i < graphObjects.length; i++)
			{
				if (graphObjects[i].title == title)
				{
					var r = window.confirm('A graph with title "' + title + '" already exists.  Do you still want to save?');

					if (r == true)
					{
						var counter = 0;

						for (var j = 0; j < graphObjects.length; j++)
						{
							if (graphObjects[j].title.indexOf(title) != -1)
								counter++;
						}		

						if (graphTypes[$scope.graphTab - 1] != "line")
							client.saveGraph({'chart_data': chartData, 'title': title + '(' + counter + ')', 'type': graphTypes[$scope.graphTab - 1], 'png': canvas.toDataURL()});
						else
							client.saveGraph({'chart_data': chartData, 'title': title + '(' + counter + ')', 'type': graphTypes[$scope.graphTab - 1], 'png': canvas.toDataURL(), 'xAxis': xAxis, 'yAxis': yAxis, 'is_date_time': isDateTime});
						
						alert(title + '(' + counter + ')' + " graph saved.");
					}
					
					exit();
				}
			}

			if (graphTypes[$scope.graphTab - 1] != "line")
				client.saveGraph({'chart_data': chartData, 'title': title, 'type': graphTypes[$scope.graphTab - 1], 'png': canvas.toDataURL()});
			else
				client.saveGraph({'chart_data': chartData, 'title': title, 'type': graphTypes[$scope.graphTab - 1], 'png': canvas.toDataURL(), 'xAxis': xAxis, 'yAxis': yAxis, 'is_date_time': isDateTime});
			
			alert(title + " graph saved.");		
		});
	};
}]);


/*
 * makes save button unclickable if nothing is in field
 * Lot of repeating code, see if I can condense it somehow
 */

// for bar graph save button
$("#xAxisBar, #yAxisBar, #titleBar").on({
	mouseenter: function() {
		if($("#xAxisBar").val() == '' || $("#yAxisBar").val() == '' || $("#titleBar").val() == '' || $('#barGraph').children().length == 0) {
			$(".saveBtn").attr("disabled", "disabled");
		} else {
			$(".saveBtn").removeAttr("disabled");
		}
	},
	keyup: function() {
		if($("#xAxisBar").val() == '' || $("#yAxisBar").val() == '' || $("#titleBar").val() == '' || $('#barGraph').children().length == 0) {
			$(".saveBtn").attr("disabled", "disabled");
		} else {
			$(".saveBtn").removeAttr("disabled");
		}
	}
});

// for line graph save button
$("#xAxisLine, #yAxisLine, #titleLine").on({
	mouseenter: function() {
		if($("#xAxisLine").val() == '' || $("#yAxisLine").val() == '' || $("#titleLine").val() == '' || $('#lineGraph').children().length == 0) {
			$(".saveBtn").attr("disabled", "disabled");
		} else {
			$(".saveBtn").removeAttr("disabled");
		}
	},
	keyup: function() {
		if($("#xAxisLine").val() == '' || $("#yAxisLine").val() == '' || $("#titleLine").val() == '' || $('#lineGraph').children().length == 0) {
			$(".saveBtn").attr("disabled", "disabled");
		} else {
			$(".saveBtn").removeAttr("disabled");
		}
	}
});

// for pie chart save button
$("#valueField, #titlePie").on({
	mouseenter: function() {
		if($("#valueField").val() == '' || $("#titlePie").val() == '' || $('#pieChart').children().length == 0) {
			$(".saveBtn").attr("disabled", "disabled");
		} else {
			$(".saveBtn").removeAttr("disabled");
		}
	},
	keyup: function() {
		if($("#valueField").val() == '' || $("#titlePie").val() == '' || $('#pieChart').children().length == 0) {
			$(".saveBtn").attr("disabled", "disabled");
		} else {
			$(".saveBtn").removeAttr("disabled");
		}
	}
});

// for map save button
$("#locationField, #choroplethValueField").on({
	mouseenter: function() {
		if($("#locationField").val() == '' || $("#choroplethValueField").val() == '') {
			$(".saveBtn").attr("disabled", "disabled");
		} else {
			$(".saveBtn").removeAttr("disabled");
		}
	},
	keyup: function() {
		if($("#locationField").val() == '' || $("#choroplethValueField").val() == '') {
			$(".saveBtn").attr("disabled", "disabled");
		} else {
			$(".saveBtn").removeAttr("disabled");
		}
	}
});

