'use strict';

angular.module('figureApp')
  .controller('FigureCtrl', function ($scope) {

    $scope.rawView = true;

    $scope.fields = [];
    $scope.parsedData = [];
    $scope.columnSort = {};

    // Code mirror set-up.
    $scope.editorOptions = {
        lineNumbers: true,
        onLoad: function (_editor) {
            $scope.editor = _editor;

            // Set-up listeners
            $scope.editor.on('change', function(cm) {
                $scope.dataChanged = true;
            });
            $scope.editor.on('blur', function(cm) {
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

    $scope.setRawView = function(rawView) {
        $scope.rawView = rawView;

        // When it's table view tell tablesorter to update.
        if (false) {
            $('#raw-data-table').trigger('updateAll', [true]);
        }
    };

    // Private helpers
    function parseCodemirrorInput(input) {

        // If there were no changes, don't do anything.
        if (!$scope.dataChanged || input === '') {
            return;
        }

        Papa.parse(input, {
            header: true,
            complete: finishParsing
        });
    }

    function finishParsing(results) {
        // Clean up state after parse.

        // These reset regardless of success.
        $scope.dataChanged = false;
        $scope.parseError = '';
        $scope.columns = [];
        $scope.parsedData = [];

        // Handle case when parsing errors.
        if( results.errors.length > 0 ) {

            for( var error in results.errors ) {
                $scope.parseError += results.errors[error].message + '\n';
            }
        }
        else {
            $scope.parsedData = results.data;
            $scope.fields = results.meta.fields;
        }

        // Tell angular to re-up.
        $scope.$apply();
    }
  });
