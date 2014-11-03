'use strict';

angular.module('figureApp')
  .controller('FigureCtrl', function ($scope) {

    $scope.rawView = true;

    $scope.fields = [];
    $scope.parsedData = [];
    $scope.columnSort = {};
    $scope.inputMode = 'raw';

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

        // When it's table view tell tablesorter to update.
        if (false) {
            $('#raw-data-table').trigger('updateAll', [true]);
        }
    };

    $scope.changeActiveGraph = function(graph) {
        $scope.activeGraph = graph;
    };

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

        // Tell angular to re-up.
        $scope.$apply();
    }

    // Graph information
    $scope.activeGraph = '';
    $scope.graphTypes = [{
        type: 'discreteBar',
        formalName: 'Bar Chart',
        learnMore: 'https://en.wikipedia.org/wiki/Bar_chart',
        description: 'A bar chart or bar graph is a chart with rectangular bars with lengths proportional to the values that they represent. The bars can be plotted vertically or horizontally. A vertical bar chart is sometimes called a column bar chart.'

    }, {
        type: 'line',
        formalName: 'Line Chart',
        learnMore: 'https://en.wikipedia.org/wiki/Line_chart',
        description: 'A line chart or line graph is a type of chart which displays information as a series of data points called "markers" connected by straight line segments. Line Charts show how a particular data changes at equal intervals of time. '
    }, {
        type: 'pie',
        formalName: 'Pie Chart',
        learnMore: 'https://en.wikipedia.org/wiki/Pie_chart',
        description: 'A pie chart is divided into sectors, illustrating numerical proportion. In a pie chart, the arc length of each sector (and consequently its central angle and area), is proportional to the quantity it represents.'
    }, {
        type: 'scatter',
        formalName: 'Scatterplot',
        learnMore: 'https://en.wikipedia.org/wiki/Scatter_plot',
        description: 'A scatter plot, scatterplot, or scattergraph is a type of mathematical diagram using Cartesian coordinates to display values for two variables for a set of data. The data is displayed as a collection of points, each having the value of one variable determining the position on the horizontal axis and the value of the other variable determining the position on the vertical axis.'
    }];
  });
