var socket = io('http://localhost:80');

var app = angular.module("Visualization", ['lvl.directives.dragdrop']);

app.controller('MainCtrl', ['$scope', function($scope) 
{
	var client = new Handler(socket);
	var dataObjectArray;

	function generateFields ()
	{
		$('#fields').empty();
		var i;

		for (i = 0; i < $scope.fields.length; i++)
		{
			var tr = document.createElement ('tr');
			tr.setAttribute ('style', '-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none;');
			tr.setAttribute ('x-lvl-draggable', 'true');
			tr.setAttribute ('draggable', 'true');
			tr.setAttribute ('id', $scope.fields[i]);
			tr.setAttribute ('class', 'ui-draggable');

			var td = document.createElement ('td');
			td.innerHTML = $scope.fields[i];
			
			tr.appendChild (td);

			angular.element(document).injector().invoke(function($compile) {
				$compile(tr)($scope);
			});	

			$('#fields').append (tr);	
		}
	}

	$(document).ready (function ()
	{
		jQuery.event.props.push('dataTransfer');

		$("#area").bind ('paste', function(e)
		{
		    var elem = $(this);

		    setTimeout (function()
		    {		       
		    	var data = $('#area').val();
				var results = $.parse(data);
				console.log(results.results.rows);
				dataObjectArray = results.results.rows;
				$scope.fields = results.results.fields;

		    	generateFields ();

		    	console.log(JSON.stringify(dataObjectArray));
		    }, 1000);
		});
	});

	$scope.sampleData = function(num)
	{
		client.sampleDataRequest(num, function(data)
		{
			console.log(data);

			$('#area').val(data);
			var results = $.parse(data);	
			console.log(results.results.rows[0]);
			dataObjectArray = results.results.rows;
			$scope.fields = results.results.fields;
			
			generateFields ();

			console.log(JSON.stringify(dataObjectArray));
		});
	};

	var xAxis;
	var yAxis;
	var grouping;
	var valueField;
	var countField;
	var locationField;
	var choroplethValueField;	
	var currentTab = 1;

	$scope.selectVisualizationType = function ()
	{
		if (currentTab == 1)
		{
			$('#xAxisBar').val('');
			$('#yAxisBar').val('');
			$('#barGraph').empty();
		}
		else if (currentTab == 2)
		{
			$('#xAxisLine').val('');
			$('#yAxisLine').val('');
			$('#groupingLine').val('');
			$('#lineGraph').empty();

			//clear optional grouping field
		}
		else if (currentTab == 3)
		{
			$('#valueField').val('');
			$('#countField').val('');
			$('#pieChart').empty();
		}
		else if (currentTab == 4)
		{
			$('#locationField').val('');
			$('#choroplethValueField').val('');
			$('#map').empty();
		}

		xAxis = '';
		yAxis = '';
		valueField = '';
		countField = '';
		locationField = '';
		choroplethValueField = '';

		currentTab = $scope.graphTab;
	};

	$scope.dropped = function (dragEl, dropEl)
	{
		console.log (dragEl);
		console.log (dropEl);

		var drag = angular.element (dragEl);
		var drop = angular.element (dropEl);

		drop.val(drag.attr('id'));
		
		readyToGraph ();
	};

	function readyToGraph ()
	{
		if ($scope.graphTab == 1)
		{
			xAxis = $('#xAxisBar').val();
			yAxis = $('#yAxisBar').val();

			if (xAxis != '' && yAxis != '')
			{
				console.log ('plotBar()');
				plotBar();
			}
		}
		else if ($scope.graphTab == 2)
		{
			xAxis = $('#xAxisLine').val();
			yAxis = $('#yAxisLine').val();
			grouping = $('#groupingLine').val();

			if (xAxis != '' && yAxis != '')
			{
				console.log ('plotLine()');
				plotLine();
			}
		}
		else if ($scope.graphTab == 3)
		{
			valueField = $('#valueField').val();
			countField = $('#countField').val();

			if (valueField != '')
			{
				console.log ('plotPie()');
				plotPie();
			}
		}
		else if ($scope.graphTab == 4)
		{
			locationField = $('#locationField').val();
			choroplethValueField = $('#choroplethValueField').val();

			if (locationField != '' && choroplethValueField != '')
			{
				console.log ('plotChoroplethMap ()');
				plotChoroplethMap();
			}
		}		

		console.log ('xAxis: ' + xAxis);
		console.log ('yAxis: ' + yAxis);
		console.log ('valueField: ' + valueField);
		console.log ('countField: ' + countField);
		console.log ('locationField ' + locationField);
		console.log ('choroplethValueField ' + choroplethValueField);
	}

	function plotBar ()
	{
		$('#barGraph').empty ();
		console.log (JSON.stringify(dataObjectArray));

		var i;
		var values = new Array ();

		for (i = 0; i < dataObjectArray.length; i++)
		{
			values.push ({'label': dataObjectArray[i][xAxis].toString(), 'value': parseFloat(dataObjectArray[i][yAxis])});
		}

		var chartData = new Array ();
		chartData[0] = {key: yAxis, values: values};

		console.log(JSON.stringify(chartData));

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

	function plotLine ()
	{	
		$('#lineGraph').empty ();
		//$('#title').remove ();
		//chartTitle = $('#chartTitle').val ();
		
		var values = new Array();		
		var dateArray;
		var chartData = new Array();			
		var i;
		var isDate = false;
		var colors = ['#ff7f0e', '#2ca02c', '#7777ff'];
		var colorsIndex = 0;
		var individualData;
		var group = dataObjectArray[0][grouping];		

		if (xAxis == 'date')
			isDate = true;
		
		console.log ('isDate: ' + isDate);
		
		for (i = 0; i < dataObjectArray.length; i++)
		{				
			var xValue = dataObjectArray[i][xAxis];
			var yValue = dataObjectArray[i][yAxis];
			
			if (group != dataObjectArray[i][grouping])
			{
				individualData = {values: values, key: group, color: colors[colorsIndex]};
				chartData.push(individualData);
				colorsIndex = colorsIndex + 1;
				group = dataObjectArray[i][grouping];
				values = new Array();
			}

			if (yValue == '')
				yValue = '0';
			
			if (isDate == true)
			{
				if (xValue.indexOf ('/') != -1)
					dateArray = xValue.split ('/');
				else if (xValue.indexOf ('-') != -1)
					dateArray = xValue.split ('-');
				
				xValue = new Date (dateArray[2], dateArray[0] - 1, dateArray[1]);
				xValue = xValue.getTime ();
				values.push ({x: xValue, y: parseFloat (yValue)});
				values.push ({x: xValue, y: parseFloat(yValue)});
			}
			else
				values.push ({x: parseFloat (xValue), y: parseFloat (yValue)});
			{
				values.push ({x: xValue, y: parseFloat(yValue)});						
			}
		}

		console.log (JSON.stringify (chartData));

		//return;
				
	
		//$('#chart').prepend ('<div id = "title" style = "font-size: 30px; margin-top: 1%;">' + chartTitle + '</div>');
		
		nv.addGraph (function ()
		{
			var chart = nv.models.lineChart()
			.margin ({left: 100, right: 70})
			.useInteractiveGuideline (true)
			.transitionDuration (350)
			.showYAxis (true)
			.showXAxis (true);
			
			chart.xAxis.showMaxMin (true);
			chart.xAxis.axisLabel (xAxis)
			
			if (isDate == true)
			{
				chart.xAxis.tickFormat (function (d)
				{
					return d3.time.format ('%x')(new Date (d));
				});
			}
			else
				chart.xAxis.tickFormat (d3.format (',g'));
			
			chart.yAxis.axisLabel (yAxis).tickFormat (d3.format (',g'));
			
			d3.select ('#lineGraph').datum (chartData).call (chart);
			nv.utils.windowResize(chart.update);		
			
			return chart;		
		});				
	}

	function addToArray (array, element)
	{
		var i; 
		
		for (i = 0; i < array.length; i++)
		{
			if (array[i]['label'] == element)
			{
				array[i]['value']++;
				return (array);
			}
		}		
		
		array.push ({'label': element, 'value': 1});
		return (array);		
	}
	
	function plotPie ()
	{
		$('#pieChart').empty ();
		//$('#title').remove ();
		//chartTitle = $('#chartTitle').val ();
		
		var cumulativeArray = new Array ();
		var valueLabel = $('#valueField').val();
		var countField = $('#countField').val();
		var i;
		
		var chartData = new Array ();
		
		//dataObjectArray = [{'orangeBoardings': 1}, {'orangeBoardings': 1}, {'orangeBoardings': 1}, {'orangeBoardings': 2}, {'orangeBoardings': 2}, {'orangeBoardings': 3}]
		if (countField == '')
		{
			for (i = 0; i < dataObjectArray.length; i++)
			{
				var value = dataObjectArray[i][valueLabel];
				
				if (value != '')
					chartData = addToArray (chartData, value);
			}
			
			//chartData = [{'label': 'orangeBoardings', 'value': 1}, {'label': 'orangeBoardings', 'value': 2}, {'label': 'orangeBoardings', 'value': 3}];
		}
		else
		{
			for (i = 0; i < dataObjectArray.length; i++)
			{				
				chartData.push ({'label': dataObjectArray[i][valueLabel], 'value': dataObjectArray[i][countField]});
			}			
		}
		console.log (JSON.stringify (chartData));		
		
		//$('#chart').prepend ('<div id = "title" style = "font-size: 30px; margin-top: 1%;">' + chartTitle + '</div>');
		
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
			
			return chart;
		});		
	}

	var map;
	var popup;
	var statesLayer;
	var closeTooltip;	
	
	function getStyle(feature) 
	{
		console.log (feature.properties.density + '-' + getColor(feature.properties.density));
		
		return {
			weight: 2,
			opacity: 0.1,
			color: 'black',
			fillOpacity: 0.7,
			fillColor: getColor(feature.properties.density)
		};
	}

	// get color depending on population density value
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
		

  
	function onEachFeature(feature, layer)
	{
		console.log('onEachFeature');
		layer.on({
			mousemove: mousemove,
			mouseout: mouseout,
			click: zoomToFeature
		});
	}
  
function mousemove(e)
{
	var layer = e.target;

	popup.setLatLng(e.latlng);
	popup.setContent('<div class="marker-title">' + layer.feature.properties.name + '</div>' +
	layer.feature.properties.density + ' people per square mile');

	if (!popup._map) 
		popup.openOn(map);
	window.clearTimeout(closeTooltip);

	// highlight feature
	layer.setStyle({
		weight: 3,
		opacity: 0.3,
		fillOpacity: 0.9
	});

	if (!L.Browser.ie && !L.Browser.opera)
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

function getLegendHTML()
{
	var grades = [0, 10, 20, 50, 100, 200, 500, 1000],
	labels = [],
	from, to;

	for (var i = 0; i < grades.length; i++)
	{
		from = grades[i];
		to = grades[i + 1];

		labels.push(
		'<li><span class="swatch" style="background:' + getColor(from + 1) + '"></span> ' +
		from + (to ? '&ndash;' + to : '+')) + '</li>';
	}

	return '<span>People per square mile</span><ul>' + labels.join('') + '</ul>';
}

	function plotChoroplethMap ()
	{

		var i;
		var locationField = $('#locationField').val ();
		var valueField = $('#valueField'). val ();

		map = L.mapbox.map('map', 'examples.map-i86nkdio')
		.setView([37.8, -96], 4);

		popup = new L.Popup({ autoPan: false });	  

		console.log (statesData);
		statesLayer = L.geoJson(statesData,  {
		style: getStyle,
		onEachFeature: onEachFeature
		}).addTo(map);	  


		map.legendControl.addLegend(getLegendHTML());

		$('.leaflet-zoom-animated').attr('width', '2000');
		$('.leaflet-zoom-animated').attr('height', '629');
		$('.leaflet-zoom-animated').attr('style', '-webkit-transform: translate3d(0, 0, 0); width: 2000px; height: 629px;');

		var e = document.getElementsByClassName('leaflet-zoom-animated')[0];
		e.setAttribute ('viewBox', '0 0 2000 629')
		e.setAttribute ('id', 'temp');
		var x;
		var y;
		var z;

		setInterval(function()
		{
			var attr = $('.leaflet-map-pane').attr('style');
			attr = attr.substring (attr.indexOf ('(') + 1);

			var x = attr.substr(0, attr.indexOf('px'));			
			attr = attr.substring(attr.indexOf('px') + 4);

			var y = attr.substr(0, attr.indexOf('px'));
			attr = attr.substring(attr.indexOf('px') + 4);

			var z = attr.substr(0, attr.indexOf('px'));


			$('.leaflet-zoom-animated').attr('style', '-webkit-transform: translate3d(' + x + ', ' + y + 'px, ' + z + 'px); width: 2000px; height: 629px;');

			document.getElementById('temp').removeAttribute('viewBox');
		}, 0);
	}
}]);


$(document).on('change', '.btn-file :file', function() 
{
	var input = $(this),
	numFiles = input.get(0).files ? input.get(0).files.length : 1,
	label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
	input.trigger('fileselect', [numFiles, label]);
});

$(document).ready(function() 
{
	$('.btn-file :file').on('fileselect', function(event, numFiles, label) 
	{

		var input = $(this).parents('.input-group').find(':text'),
		log = numFiles > 1 ? numFiles + ' files selected' : label;

		if( input.length ) 
		{
			input.val(log);
		} 
		else 
		{
			if( log ) 
				alert(log);
		}

		$(document).on('change', '.btn-file :file', function()
		{
			var input = $(this),
			numFiles = input.get(0).files ? input.get(0).files.length : 1,
			label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
			console.log(input);
			input.trigger('fileselect', [numFiles, label]);
		});
	});
});
