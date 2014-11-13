'use strict';

angular.module('figureApp')
  .controller('FigureCtrl', function ($scope, $http, graph, socket, Auth) {

    $scope.rawView = true;

    $scope.fields = [];
    $scope.parsedData = [];
    $scope.columnSort = {};
    $scope.inputMode = 'raw';
    $scope.activeGraph = '';
    $scope.paramModel = {};
    $scope.hasGraph = false;
    $scope.editGraph = graph.get();

    $scope.isLoggedIn = function() {
      return Auth.isLoggedIn();
    };

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

        initializeEditMode();
      }
    };
    $scope.setCodemirrorText = function (val) {
      if (!$scope.editor) {
        throw 'Codemirror editor does not exist!'
      }
      $scope.editor.setValue(val);
    };

    // Control methods
    $scope.parseURL = function() {
      $scope.dataChanged = 'url';
      parseCodemirrorInput($scope.dataURL);
    };

    $scope.setRawView = function(rawView) {
      $scope.rawView = rawView;
    };

    $scope.changeActiveGraph = function(graph) {
      $scope.activeGraph = graph;
      $scope.clearChartConfig();
    };

    $scope.dropParam = function(dragEl, dropEl) {
      var drag = angular.element( document.getElementById(dragEl) );
      var drop = angular.element( document.getElementById(dropEl) );

      if ( drop.val() != drag.data().value) {
        $('.save-graph').text('Save').removeClass('disabled');
      }

      $scope.paramModel[drop.attr('name')] = drag.data().value;
      $scope.safeApply();

      if (angular.element(chartConfForm).hasClass('ng-valid')) { $scope.graph(); }
    };

    $scope.clearChartConfig = function() {
      $('input.droppable').val('');
      $('.analyze').hide().empty();
      $('.save-graph').text('Save').removeClass('disabled');

      $scope.paramModel = {};
      $scope.hasGraph = false;
    };

    $scope.submitChartConfig = function(event) {
      event.preventDefault();

      $scope.graph();
    };

    $scope.graph = function() {

      // Make sure all required fields have values
      var fields = $('.form-chart-config input:visible');
      var nvFields = [];
      var series = '';
      for (var i = 0; i < fields.length; i++) {
        var el = $(fields[i]);
        var datum = {};
        datum[fields[i].name] = el.val();

        if (fields[i].name === 'y') { series = el.val(); }
        nvFields.push(datum);
      }

      // Format the data for NVD3
      var data = [];
      var xAxisDate = false;
      for (var i = 0; i < $scope.parsedData.length; i++ ) {

        var datum = {};

        for (var j = 0; j < nvFields.length; j++) {
          var record = $scope.parsedData[i];
          var key = Object.keys(nvFields[j])[0];
          var value = record[nvFields[j][key]];

          // Auto-detect date and convert to int
          // YYYY/....
          // YYYY-....
          if (key == 'x' && typeof value == 'string' &&
              moment(value, ['YYYY-MM-DD HH:mm:ss', 'YYYY-mm-DD']).isValid()) {
            var time = Date.parse(value);

            if ( !isNaN(time) ) {
              value = time;
              xAxisDate = true;
            }
          }

          datum[key] = value;
        }
        data.push(datum);
      }

      // Draw the graph
      var elId = $scope.activeGraph.type;
      $('.analyze').empty().append('<svg id="' + elId + '"></svg>').show();
      $scope.hasGraph = true;
      $scope.chartDataArray = [{key: series, values: data}];
      $scope.safeApply();
      window['plot_' + $scope.activeGraph.type](elId, $scope.chartDataArray, xAxisDate);
    };

    $scope.saveGraph = function(event) {
      // Save the graph
      var graphObj = {
        title: $scope.paramModel.title,
        data: $scope.chartDataArray,
        owner: Auth.getCurrentUser().name,
        type: $scope.activeGraph.type
      };

      if ($scope.editGraph) {
        $http.put('/api/graphs/' + $scope.editGraph._id, graphObj)
          .success( function() {
            $(event.currentTarget).text('Updated').addClass('disabled');
            $scope.editGraph = null;
          });
      }
      else {
        $http.post('/api/graphs', graphObj )
          .success( function() {
            $(event.currentTarget).text('Saved').addClass('disabled');
          });
      }
    };

    // Innate column sorting breaks with a key has a space in it. To avoid this,
    // use a function for the orderBy instead of a property name.
    $scope.formatColumnSort = function(val) {
      return val[$scope.columnSort.sortColumn];
    };

    // The drag and drop screws with apply...
    $scope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if(phase == '$apply' || phase == '$digest') {
        if(fn && (typeof(fn) === 'function')) {
          fn();
        }
      }
      else {
        this.$apply(fn);
      }
    };

    // Private helpers
    function parseCodemirrorInput(input, callback) {
      // If there were no changes, don't do anything.
      if (!$scope.dataChanged || input === '') {
        return;
      }

      prepareParsing();

      Papa.parse(input, {
        header: true,
        dynamicTyping: true,
        worker: true,
        download: $scope.dataChanged == 'url',
        step: function(row) {
          if (row.errors.length > 0) {
            for (var error in row.errors) {
              $scope.parseError += row.errors[error].message + '\n';
            }
          }
          else {
            // The following line is responsible for browser lock-ups on large datasets... Sadly, I think this is a fault
            // of angular and unavoidable.
            $scope.parsedData.push(row.data[0]);
            $scope.fields = row.meta.fields;
          }
        },
        complete: function() {
          finishParsing(callback);
        },
        error: function(err) {
          $scope.parseError = err;
        }
      });
    }

    function prepareParsing() {
      // Clean up state pre-parse.
      $scope.parseError = '';
      $scope.parsedData = [];
      $scope.fields = [];
      $scope.columnSort = {};

      $('.load-mask')
        .height($(document).height())
        .width($(document).width());
      $scope.loadMask = true;

      // Tell angular to re-up.
      $scope.safeApply();
    }

    function finishParsing(callback) {
      // Clean up state after parse.

      // These reset regardless of success.
      $scope.dataChanged = false;
      $scope.clearChartConfig();
      $scope.loadMask = false;

      if (callback) {
        callback();
      }
      // Tell angular to re-up.
      $scope.safeApply();
    }

    function initializeEditMode() {
      // See if the graph service has a graph. Because that means we're coming from an edit
      // and need to pull that in.
      if (!$scope.editGraph) {
        return;
      }

      var data = Papa.unparse($scope.editGraph.data[0].values);
      $scope.setCodemirrorText(data);

      clearTimeout($scope.changeTimeout);
      parseCodemirrorInput(data, setEditModeState);
    }

    function setEditModeState() {
      for (var i = 0; i < $scope.graphtypes.length; i++) {
        if ($scope.graphtypes[i].type == $scope.editGraph.type) {
          $scope.activeGraph = $scope.graphtypes[i];
          break;
        }
      }
      $scope.paramModel.title = $scope.editGraph.title;

      // Clear the service's graph.
      graph.set(null);
    }
  });
