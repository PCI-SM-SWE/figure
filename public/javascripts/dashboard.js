//var socket = io('datapuking.com');
var socket = io('localhost');

var app = angular.module("Visualization", ['lvl.directives.dragdrop']);

app.controller('MainCtrl', ['$scope', function($scope) 
{
	var client = new Handler(socket);
	
	$(document).ready (function ()
	{
		
	});


}]);