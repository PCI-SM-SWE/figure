var app = angular.module("Visualization", []);
app.controller('MainCtrl', function($scope) {
	$scope.submit = function() {
		alert("Please sign in with facebook!");
	}
});