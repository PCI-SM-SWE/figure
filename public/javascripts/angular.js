var socket = io('http://localhost:4000');

var app = angular.module("Visualization", ['lvl.directives.dragdrop']);

app.controller('MainCtrl', ['$scope', function($scope) 
{
	var client = new Handler(socket);
	var dataObjectArray;

	$(document).ready (function ()
	{
		jQuery.event.props.push('dataTransfer');
	});

	$scope.sample1 = function()
	{
		client.sample1Request(function(data)
		{
			console.log(data);
			//callback(data);
			$('#area').val(data);
			var results = $.parse(data);
			console.log(results.results.rows[0]);
			dataObjectArray = results.results.rows;
			$scope.fields = results.results.fields;

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
		});
	};

	$scope.dropped = function (dragEl, dropEl)
	{
		console.log (dragEl);
		console.log (dropEl);

		var drag = angular.element (dragEl);
		var drop = angular.element (dropEl);

		drop.val(drag.attr ('id'));
		console.log ($scope.graphTab);	
	
		readyToGraph ();
	};

	var xAxis;
	var yAxis;
	var valueField;
	var countField;

	function readyToGraph ()
	{
		xAxis = $('#xAxis').val ();
		yAxis = $('#yAxis').val ();
		valueField = $('#valueField').val ();
		countField = $('#countField').val ();

		console.log ('xAxis: ' + xAxis);
		console.log ('yAxis: ' + yAxis);
		console.log ('valueField: ' + valueField);
		console.log ('countField: ' + countField);

		if ($scope.graphTab == 1 && xAxis != '' && yAxis != '')
		{
			//graph bar graph
		}
		else if ($scope.graphTab == 2 && xAxis != '' && yAxis != '')
		{
			console.log ('plotLine ()');
			plotLine ();
		}
		else if ($scope.graphTab == 3 && valueField != '')
		{
			//plot pie chart
		}
	}

	function plotLine ()
	{	
		$('svg').empty ();
		//$('#title').remove ();
		//chartTitle = $('#chartTitle').val ();
		
		var values = new Array ();		
		var dateArray;
		var chartData;			
		var i;
		var isDate = false;
		
		console.log ('(' + xAxis + ')');
		console.log ('(' + yAxis + ')');
		
		
		if (xAxis == 'date')
			isDate = true;
		
		console.log (isDate);
		
		for (i = 0; i < dataObjectArray.length; i++)
		{				
			var xValue = dataObjectArray[i][xAxis];
			var yValue = dataObjectArray[i][yAxis];
			
			if (yValue == '')
				yValue = '0';
			
			if (isDate == true)
			{
				if (xValue.indexOf ('/') != -1)
					dateArray = xValue.split ('/');
				else if (xValue.indexOf ('-') != -1)
					dateArray = xvalue.split ('-');
				
				xValue = new Date (dateArray[2], dateArray[0] - 1, dateArray[1]);
				xValue = xValue.getTime ();
				values.push ({x: xValue, y: parseInt (yValue)});
			}
			else
				values.push ({x: parseInt (xValue), y: parseInt (yValue)});				
		}

		console.log (JSON.stringify (values));
			
		chartData = [
	                 {
	                	 values: values,
	                	 color: '#ff7f0e'
	                 }];		
	
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
			
			d3.select ('#chart svg').datum (chartData).call (chart);
			//nv.utils.windowResize(chart.update());		
			
			return chart;		
		});				
	}
	
	// $scope.sample1(function(data) {
	// 	$('#sample1').click(function() { 
	// 		$('#area').val(data);
	// 	});
	// 	var results = $.parse(data);
	// 	console.log(results);
	// 	$scope.fields = results.results.fields;
	// });
}]);
