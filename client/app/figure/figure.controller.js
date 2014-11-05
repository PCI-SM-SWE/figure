'use strict';

angular.module('figureApp')
  .controller('FigureCtrl', function ($scope, $http, socket) {

    $scope.rawView = true;

    $scope.fields = [];
    $scope.parsedData = [];
    $scope.columnSort = {};
    $scope.inputMode = 'raw';
    $scope.activeGraph = '';
    $scope.paramModel = {};

    // Initialization via socketio
    $http.get('/api/graphtypes').success(function(graphtypes) {
        $scope.graphtypes = graphtypes;
        socket.syncUpdates('graphtypes', $scope.graphtypes);
    });
    $http.get('/api/paramtypes').success(function(paramtypes) {
        $scope.paramtypes = paramtypes;
        socket.syncUpdates('paramtypes', $scope.paramtypes);
    });
    // Unhook things!
    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('graphtypes');
      socket.unsyncUpdates('paramtypes');
    });

    // Code mirror set-up.
    $scope.editorOptions = {
        lineNumbers: true,
        onLoad: function (_editor) {
            $scope.editor = _editor;
            $scope.changeTimeout = null;

            // Set-up listeners
            $scope.editor.on('change', function(cm) {
                $scope.dataChanged = true;

                clearTimeout($scope.changeTimeout);
                $scope.changeTimeout = setTimeout( function() {
                    parseCodemirrorInput( cm.getValue() );
                }, 2000);
            });
            $scope.editor.on('blur', function(cm) {
                clearTimeout($scope.changeTimeout);
                parseCodemirrorInput( cm.getValue() );
            });
        }
    };
    $scope.setCodemirrorText = function (val) {
        if (!$scope.editor) {
            throw 'Codemirror editor does not exist!'
        }
        $scope.editor.setValue(val);
    };

    // Control methods
    $scope.setRawView = function(rawView) {
        $scope.rawView = rawView;
    };

    $scope.changeActiveGraph = function(graph) {
        $scope.activeGraph = graph;
    };

    $scope.dropParam = function(dragEl, dropEl) {
        var drag = angular.element( document.getElementById(dragEl) );
        var drop = angular.element( document.getElementById(dropEl) );

        drop.val(drag.data().value);

        graph();
    };

    $scope.clearChartConfig = function() {
        $('input.droppable').val('');
        $('#generated-chart').empty().hide();

        $scope.paramModel = {};
    };

    $scope.submitChartConfig = function(event) {
        event.preventDefault();

        graph();
    }

    // Innate column sorting breaks with a key has a space in it. To avoid this,
    // use a function for the orderBy instead of a property name.
    $scope.formatColumnSort = function(val) {
        return val[$scope.columnSort.sortColumn];
    };

    // Private helpers
    function parseCodemirrorInput(input) {
        // If there were no changes, don't do anything.
        if (!$scope.dataChanged || input === '') {
            return;
        }

        prepareParsing();

        Papa.parse(input, {
            header: true,
            dynamicTyping: true,
            worker: true,
            step: function(row) {
                if (row.errors.length > 0) {
                    for (var error in row.errors) {
                        $scope.parseError += row.errors[error].message + '\n';
                    }
                }
                else {
                    $scope.parsedData.push(row.data[0]);
                    $scope.fields = row.meta.fields;
                }
            },
            complete: finishParsing
        });
    }

    function prepareParsing() {
        // Clean up state pre-parse.
        $scope.parseError = '';
        $scope.parsedData = [];
        $scope.fields = [];
        $scope.columnSort = {};

        // Tell angular to re-up.
        $scope.$apply();
    }

    function finishParsing(results) {
        // Clean up state after parse.

        // These reset regardless of success.
        $scope.dataChanged = false;
        $scope.clearChartConfig();

        // Tell angular to re-up.
        $scope.$apply();
    }

    function graph() {

        // Make sure all required fields have values
        var fields = $('.required:visible');
        var nvFields = [];
        for (var i = 0; i < fields.length; i++) {
            if ($(fields[i]).val() === ''){
                return;
            }

            var datum = {};
            datum[fields[i].name] = $(fields[i]).val();
            nvFields.push(datum);
        }

        // Format the data for NVD3
        var data = [];
        for (var i = 0; i < $scope.parsedData.length; i++ ) {

            var datum = {};

            for (var j = 0; j < nvFields.length; j++) {
                var record = $scope.parsedData[i];
                var key = Object.keys(nvFields[j])[0];
                datum[key] = record[nvFields[j][key]];
            }
            data.push(datum);
        }

        // Draw the graph
        $('#generated-chart').empty().show();
        window['plot_' + $scope.activeGraph.type]([{key: $('input[name="seriesname"]').val(), values: data}]);
    }
  });
