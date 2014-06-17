var socket = io('http://localhost:4000');

var app = angular.module("Visualization", []);
app.controller('MainCtrl', function($scope) {
	var client = new Handler(socket);
	
	$scope.sample1 = function(callback) {
		client.sample1Request(function(data) {
			console.log(data);
			callback(data);
		});
	}
	$scope.sample1(function(data) {
		$('#sample1').click(function() { 
			$('#area').val(data);
		});
	});
	
});