'use strict';

angular.module('figureApp')
  .controller('FigureCtrl', function ($scope) {

    $scope.rawView = true;

    // Test data until we get parsing in.
    $scope.fields = ['test','column','another','more','longer','even','move','all','the','columns'];
    $scope.parsedData = [{test: 1, column: 2},{test:3, column: 4}];
    $scope.columnSort = {};

    // Code mirror set-up.
    $scope.editorOptions = {
        lineNumbers: true,
        onLoad: function (_editor) {
            $scope.editor = _editor;
        }
    };
    $scope.getCodemirrorText = function () {
        return $scope.editor ? $scope.editor.getValue() : '';
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

  });
