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
			var barCnt = 0,
				lineCnt = 0,
				pieCnt = 0,
				mapCnt = 0,
				statsCnt = 0;
			for (var i = 0; i < graphObjects.length; i++)
			{
				graphObject = graphObjects[i];				
				console.log(graphObject.type);
				switch(graphObject.type) {
			    case "bar":
			        barCnt += 31;
			        break;
			    case "line":
			        lineCnt += 31;
			        break;
			    case "pie":
			        pieCnt += 31;
			        break;
			    case "map":
			        mapCnt += 31;
			        break;
			    case "stats":
			        statsCnt += 31;
			        break;
			    default:
			        break;
			}

				$('#' + graphObject.type + 'Graphs').append('<li><a href = "">' + graphObject.file_name + '</a></li>');
			}
			$("#menu-bar").on({
				mouseenter: function () {
					$("#menu-bar ul").css("height", barCnt + "px");
				},
				mouseleave: function() {
					$("#menu-bar ul").css("height", "0px");
				}
			});
			$("#menu-line").on({
				mouseenter: function () {
					$("#menu-line ul").css("height", lineCnt + "px");
				},
				mouseleave: function() {
					$("#menu-line ul").css("height", "0px");
				}
			});
			$("#menu-pie").on({
				mouseenter: function () {
					$("#menu-pie ul").css("height", pieCnt + "px");
				},
				mouseleave: function() {
					$("#menu-pie ul").css("height", "0px");
				}
			});
			$("#menu-map").on({
				mouseenter: function () {
					$("#menu-map ul").css("height", mapCnt + "px");
				},
				mouseleave: function() {
					$("#menu-map ul").css("height", "0px");
				}
			});
			$("#menu-stats").on({
				mouseenter: function () {
					$("#menu-stats ul").css("height", statsCnt + "px");
				},
				mouseleave: function() {
					$("#menu-stats ul").css("height", "0px");
				}
			});
		});
	}
}]);

