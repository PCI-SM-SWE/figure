//var socket = io('datapuking.com');
var socket = io('localhost');

var app = angular.module("Visualization", ['lvl.directives.dragdrop']);

app.controller('MainCtrl', ['$scope', function($scope) 
{
	var client = new Handler(socket);
	
	$(document).ready (function ()
	{
		getSavedGraphs();
	});

	function getSavedGraphs()
	{
		client.getSavedGraphs(function(graphObjects)
		{
			for (var i = 0; i < graphObjects.length; i++)
			{
				graphObject = graphObjects[i];				
				console.log(graphObject.type);

				$('#' + graphObject.type + 'Graphs').append('<li><a href = "">' + graphObject.file_name + '</a></li>');
			}
		});
	}
}]);

//$('.menu-item ul').css({"height":"124px"});
$(".menu-item").hover(
		function () {
			$(".menu-item ul").css("height", "124px");
		}
);