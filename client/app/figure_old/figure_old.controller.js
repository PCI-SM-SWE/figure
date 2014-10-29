'use strict';

angular.module('figureApp')
  .controller('FigureOldCtrl', function ($scope, $compile, socket) {

    $scope.parseError = '';
    $scope.dataChanged = false;

    var socket = socket.socket;
    var client = new Handler(socket);
    var delivery = new Delivery(socket);
    var fields;
    var dataObjectArray;                // JSON format for the data
    var operators = ['+', '-', '*', '/', 'sum()', 'count()', 'avg()'];
    var graphTypes = ['bar', 'line', 'pie', 'choropleth'];

    $(document).ready(function()
    {
        addLoader();

        populateFileList();

        jQuery.event.props.push('dataTransfer');
        $('input[type=file]').fileinput({
            showPreview: false,
            uploadLabel: 'Parse'
        });
        $('#dataTable').tablesorter({
            sortReset: true,
            sortRestart: true,
            widthFixed: true,
            widgets: ['zebra']
        });

        // Used for uploading files
        $(document).on('change', '.btn-file :file', function() {
            var input = $(this);
            var numFiles = input.get(0).files ? input.get(0).files.length : 1
            var label = input.val().replace(/\\/g, '/').replace(/.*\//, '');

            input.trigger('fileselect', [numFiles, label]);     // Calls the event below
        });

        $('.btn-file :file').on('fileselect', function(event, numFiles, label) {
            var input = $(this).parents('.input-group').find(':text')
            var log = numFiles > 1 ? numFiles + ' files selected' : label;

            if(input.length)
                input.val(log);
            else if( log )
                alert(log);
        });

        $('.kv-fileinput-upload').off('click');
        $('.kv-fileinput-upload').click( function(event) {
            event.preventDefault();

            addLoader();
            var file = $("input[type=file]")[0].files[0];

            if (!file) {
                removeLoader();
                return;
            }
            var reader = new FileReader();
            reader.onload = function(e) {
              var contents = e.target.result;
              $scope.fileUpload(contents);
            };
            reader.readAsText(file);
        });

        // Determines the metric equation button enabled/disabled functionality
        var submitCheck = function()
        {
            if($('#metricEquation').val() != '')
                $('#statSubmit').removeAttr('disabled');
            else
                $('#statSubmit').attr('disabled', 'disabled');
        }

        $('#metricEquation').keyup(submitCheck);
        $('#metricEquation').mouseenter(submitCheck);

        removeLoader();
    }); // End $(document).ready

    // Shows laoding gif
    function addLoader() {
        $('#loader').css('top', ($(window).height() / 2) + 'px');
        $('#loader').css('left', ($(window).width() / 2) + 'px');
        $('#darkLayer').css('height', $(document).height());

        $('#loader').show();
        $('#darkLayer').show();
    }

    // Hides loading gif
    function removeLoader() {
        setTimeout(function()
        {
            $('#loader').hide();
            $('#darkLayer').hide();
        }, 300);
    }

    $scope.parseManualInput = function() {

        if (!$scope.dataChanged) {
            return;
        }

        addLoader();

        var data = $('#area').val();
        setTimeout( function() {
            Papa.parse(data, {
                header: true,
                complete: function(results) {

                    removeLoader();
                    $scope.parseError = '';

                    if( results.errors.length > 0 ) {

                        for( var error in results.errors ) {
                            $scope.parseError += results.errors[error].message + '\n';
                        }
                        return;
                    }
                    dataObjectArray = results.data;
                    finishedParsing(data);
                }
            });
        }, 250);
    };

    // Uploading a file
    $scope.fileUpload = function(data) {
        addLoader();
        dataObjectArray = new Array();

        Papa.parse(data, {
            header: true,
            worker: true,
            step: function(row)
            {
                dataObjectArray.push(row.data[0]);
            },
            complete: function(results)
            {
                finishedParsing(data);
            }
        });
    };

    // Populates uploaded files, sample data, ifloops.com
    function populateFileList()
    {
        client.filesList(function(filesObject)
        {
            // Gets uploaded files
            $('#storedList').empty();

            var uploaded_files = filesObject.uploaded_files;

            for(var i = 0; i < uploaded_files.length; i++)
            {
                var file = uploaded_files[i];

                var li = document.createElement('li');
                var a = document.createElement('a');
                a.setAttribute('id', file);
                a.setAttribute('style', 'cursor: default;');

                a.onclick = function()
                {
                    storedData(this.getAttribute('id'));
                };

                a.innerHTML = file.substr(file.indexOf('uploaded_files') + 'uploaded_files'.length + 1);
                li.appendChild(a);
                $('#storedList').append(li);
            }

            // Gets sample data
            $('#sampleData').empty();

            var sample_data = filesObject.sample_data;

            for(var i = 0; i < sample_data.length; i++)
            {
                var file = sample_data[i];

                var li = document.createElement('li');
                var a = document.createElement('a');
                a.setAttribute('id', file);
                a.setAttribute('style', 'cursor: default;');

                a.onclick = function()
                {
                    storedData(this.getAttribute('id'));
                };

                a.innerHTML = file.substr(file.indexOf('sample_data') + 'sample_data'.length + 1);
                li.appendChild(a);
                $('#sampleData').append(li);
            }

            // Gets tabels from ifloops.com
            $('#mysqlTables').empty();

            var mysqlTables = filesObject.mysql_tables;

            for (var i = 0; i < mysqlTables.length; i++)
            {
                var table_name = mysqlTables[i];

                var li = document.createElement('li');
                var a = document.createElement('a');
                a.setAttribute('id', table_name);
                a.setAttribute('style', 'cursor: default;');

                a.onclick = function()
                {
                    var numEntries = prompt('How many entries would you like?\n(Exceeding 1000 entries may impact performance)')

                    if (numEntries == null || isNaN(numEntries) == true)
                    {
                        alert('Invalid input.');
                        return;
                    }
                    storedTable(this.getAttribute('id'), numEntries);
                };

                a.innerHTML = table_name;
                li.appendChild(a);
                $('#mysqlTables').append(li);
            }
        });
    }

    // Generates draggable fields, the table, and operators
    function finishedParsing(data)
    {
        fields = Object.keys(dataObjectArray[0]);

        $('#dataTable').empty();
        generateFields();
        populateTable();
        generateOperators();

        $('#area').val(data);

        removeLoader();

        $scope.dataChanged = false;
    }

    // Access uploaded file or sample data and parses it
    function storedData(name)
    {
        addLoader();

        client.storedDataRequest(name, function(data)
        {
            dataObjectArray = new Array();

            Papa.parse(data,
            {
                header: true,
                worker: true,
                step: function(row)
                {
                    dataObjectArray.push(row.data[0]);
                },
                complete: function()
                {
                    finishedParsing(data);
                    console.log(JSON.stringify(dataObjectArray));
                }
            });
        });
    }

    // Access a table from ifloops.com
    function storedTable(table, numEntries)
    {
        addLoader();

        client.storedTable(table, numEntries, function(tableObject)
        {
            fields = tableObject.headers;
            dataObjectArray = tableObject.data;

            var rawData = Papa.unparse(dataObjectArray);

            $('#dataTable').empty();
            generateFields();
            populateTable();
            generateOperators();

            $('#area').val(rawData);

            removeLoader();
        });
    }

    // Generates the draggable fields and table header
    function generateFields()
    {
        $('.fields').empty();

        var thead = document.createElement('thead');
        $('#dataTable').append(thead);

        var tr = document.createElement('tr');
        tr.setAttribute('id', 'header');
        $('thead').append(tr);

        for(var i = 0; i < fields.length; i++) {
            tr = document.createElement('tr');
            tr.setAttribute('style', '-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none;');
            tr.setAttribute('x-lvl-draggable', 'true');
            tr.setAttribute('draggable', 'true');
            tr.setAttribute('id', fields[i]);
            tr.setAttribute('class', 'ui-draggable');

            var td = document.createElement('td');
            td.innerHTML = fields[i];

            tr.appendChild(td);

            tr = $compile(tr)($scope);

            $('.fields').append(tr);

            var th = document.createElement('th');
            th.innerHTML = fields[i];

            $('#header').append(th);
        }
    }

    // Generates the draggable operators for metrics option
    function generateOperators()
    {
        $('.operators').empty();

        for(var i = 0; i < operators.length; i++)
        {
            var tr = document.createElement('tr');
            tr.setAttribute('style', '-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none;');
            tr.setAttribute('x-lvl-draggable', 'true');
            tr.setAttribute('draggable', 'true');
            tr.setAttribute('id', operators[i]);
            tr.setAttribute('class', 'ui-draggable');

            var td = document.createElement('td');
            td.innerHTML = operators[i];

            tr.appendChild(td);

            $compile(tr)($scope);

            $('.operators').append(tr);
        }
    }

    // Displays the raw data in table format
    function populateTable() {
        var tbody = document.createElement('tbody');
        tbody.setAttribute('id', 'tableBody');
        $('#dataTable').append(tbody);

        for (var i = 0; i < dataObjectArray.length; i++)
        {
            var tr = document.createElement('tr');

            for (var key in dataObjectArray[i])
            {
                var value = dataObjectArray[i][key];
                var td = document.createElement('td');
                td.innerHTML = value;
                tr.appendChild(td);
                $('#tableBody').append(tr);
            }
        }

        $('#dataTable').trigger('updateAll', [true]);
    }

    /* -------------------- Status after parsing ------------------------

    - dataObjectArray is an array of objects, where each object has keys that are fields and values that are the actual data
    - Ex.
        Raw Data:               dataObjectArray:
        Grades,count            [{"Grades":"30","Count":"10"},{"Grades":"100","Count":"2"},
        30,10                   {"Grades":"95","Count":"6"},{"Grades":"84","Count":"40"},{"Grades":"90","Count":"20"}]
        100,2
        95,6
        84,40
        90,20

    - draggable fields should be generated
    - the table format of the data should be populated
    - operators for metrics should be generated

    ----------------------------------------------------------------------*/

    var xAxis;                  // bar/line
    var yAxis;                  // bar/line
    var grouping;               // grouping field for data
    var valueField;             // pie
    var countField;             // pie
    var locationField;          // choropleth map
    var choroplethValueField;   // choropleth map
    var currentTab = 1;         // 1 = bar, 2 = line, 3 = pie, 4 = choropleth map
    var temp;

    // Clears/resets all fields, labels, and charts,
    $scope.clearAll = function()
    {
        $(".saveBtn").attr("disabled", "disabled");     // to make save button unclickable

        // Bar
        if(currentTab == 1)
        {
            $('#xAxisBar').val('');
            $('#yAxisBar').val('');
            $('#barGraph').empty();
            $('titleBar').val('');
        }

        // Line
        else if(currentTab == 2)
        {
            $('#xAxisLine').val('');
            $('#yAxisLine').val('');
            $('#groupingLine').val('');
            $('#lineGraph').empty();
            $('#groupingLine').val('');
            $('titleLine').val('');

            // Used to remove the tooltip, there may be a better way already
            // provided by nvd3
            temp = setInterval(function()
            {
                $('.nvtooltip').hide();;
            }, 0);
        }

        // Pie
        else if(currentTab == 3)
        {
            $('#valueField').val('');
            $('#countField').val('');
            $('#pieChart').empty();
            $('#title').val('');
        }

        // Choropleth map
        else if(currentTab == 4)
        {
            $('#locationField').val('');
            $('#choroplethValueField').val('');
            $('#map').remove();
            $('#mapWell').css('height', '');
        }

        xAxis = '';
        yAxis = '';
        grouping = '';
        valueField = '';
        countField = '';
        locationField = '';
        choroplethValueField = '';
    };

    // When user clicks a visualization type tab
    $scope.selectVisualizationType = function()
    {
        $scope.clearAll();
        currentTab = $scope.graphTab;
    };

    // Drag and drop functionality for the fields of the visualization
    $scope.dropped = function(dragEl, dropEl)
    {
        // console.log(dragEl);
        // console.log(dropEl);

        var drag = angular.element( document.getElementById(dragEl) );
        var drop = angular.element( document.getElementById(dropEl) );

        drop.val(drag.attr('id'));

        readyToGraph();
    };

    // Drag and drop functionality for metric options
    $scope.droppedMetric = function(dragEl, dropEl)
    {
        console.log(dragEl);
        console.log(dropEl);

        var drag = angular.element(dragEl);
        var drop = angular.element(dropEl);
        var operator;

        console.log($('#metricFields').children().length);

        if($('#metricFields').children().length == 2)
            return;

        drop.val(drop.val() + drag.attr('id'));

        if(drag.attr('id').indexOf('()') != -1)
        {
            operator = drag.attr('id').substring(0, drag.attr('id').indexOf('()'));
            console.log(operator);

            var label = document.createElement('label')
            label.setAttribute('class', 'inputMetricField');
            label.innerHTML = '<br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;   ' + operator + ':&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';

            var input = document.createElement('input');
            input.setAttribute('id', operator);
            input.setAttribute('type', 'email');
            input.setAttribute('class', 'inputMetricField');
            input.setAttribute('placeholder', 'Drop field here');
            input.setAttribute('x-lvl-drop-target', 'true');
            input.setAttribute('x-on-drop', 'droppedMetricField(dragEl, dropEl)');

            angular.element(document).injector().invoke(function($compile) {
                $compile(input)($scope);
            });

            $('#metricFields').append(label);
            $('#metricFields').append(input);
        }
    };

    // Drag and drop functionality for certain operators for the metric equation
    $scope.droppedMetricField = function(dragEl, dropEl)
    {
        // console.log(dragEl);
        // console.log(dropEl);

        var drag = angular.element(dragEl);
        var drop = angular.element(dropEl);

        var operator = drop.attr('id');
        var field = drag.attr('id');

        if(operator == 'sum')
        {
            var sum = 0;

            for(var i = 0; i < dataObjectArray.length; i++)
            {
                if(dataObjectArray[i][field] != '')
                    sum += dataObjectArray[i][field];
            }

            console.log(sum);
            $('#metricEquation').val($('#metricEquation').val().replace(operator + '()', sum));
        }
        else if(operator == 'count')
        {
            var count = 0;

            for(var i = 0; i < dataObjectArray.length; i++)
            {
                if(dataObjectArray[i][field] != '')
                    count++;
            }

            console.log(count);
            $('#metricEquation').val($('#metricEquation').val().replace(operator + '()', count));
        }
        else if(operator == 'avg')
        {
            var sum = 0;

            for(var i = 0; i < dataObjectArray.length; i++)
            {
                if(dataObjectArray[i][field] != '')
                    sum += dataObjectArray[i][field];
            }

            console.log(sum);
            console.log(dataObjectArray.length);
            $('#metricEquation').val($('#metricEquation').val().replace(operator + '()', sum / dataObjectArray.length));
        }

        $('.inputMetricField').remove();
    };

    // Clears the metric equation
    $scope.clearMetric = function()
    {
        $('.inputMetricField').remove();
        $('#metricEquation').val('');
        $('#statSubmit').attr('disabled', 'disabled');
    };

    // Evaluates the metric equation
    $scope.calculateMetric = function()
    {
        if($('#metricEquation').val() != '')
        {
            try
            {
                var result = eval($('#metricEquation').val());

                if((typeof result) === 'number')
                    $('#metricEquation').val(result);
            }
            catch(err)
            {
                return;
            }
        }
    };

    // Graphs the specified visualization type if all necessary input is there
    function readyToGraph()
    {
        // Bar
        if($scope.graphTab == 1)
        {
            xAxis = $('#xAxisBar').val();
            yAxis = $('#yAxisBar').val();

            if(xAxis != '' && yAxis != '')
            {
                console.log('plotBar()');
                plotBar();
            }
        }

        // Line
        else if($scope.graphTab == 2)
        {
            xAxis = $('#xAxisLine').val();
            yAxis = $('#yAxisLine').val();
            grouping = $('#groupingLine').val();

            clearInterval(temp);        // clears the hack used to remove tooltips

            if(xAxis != '' && yAxis != '')
            {
                console.log('plotLine()');
                plotLine();
            }
        }

        // Pie
        else if($scope.graphTab == 3)
        {
            valueField = $('#valueField').val();
            countField = $('#countField').val();

            if(valueField != '')
            {
                console.log('plotPie()');
                plotPie();
            }
        }

        // Choropleth map
        else if($scope.graphTab == 4)
        {
            locationField = $('#locationField').val();
            choroplethValueField = $('#choroplethValueField').val();

            if(locationField != '' && choroplethValueField != '')
            {
                console.log('plotChoroplethMap()');
                plotChoroplethMap();
            }
        }

        // Metrics
        else if($scope.graphTab == 5)
        {
            // if metrics tab is selected
        }

        // console.log('xAxis: ' + xAxis);
        // console.log('yAxis: ' + yAxis);
        // console.log('valueField: ' + valueField);
        // console.log('countField: ' + countField);
        // console.log('locationField: ' + locationField);
        // console.log('choroplethValueField: ' + choroplethValueField);
    }

    var chartData;

    // ---------------------------------BAR-----------------------------------------
    function plotBar()
    {
        // var svg = document.createElement("svg");
        // svg.setAttribute("id", "barGraph");
        // svg.setAttribute('width', '500');
        // svg.setAttribute('height', '500');

        // $('#chart1').append(svg);

        $('#barGraph').empty();
        //console.log(JSON.stringify(dataObjectArray));

        var values = new Array();

        for(var i = 0; i < dataObjectArray.length; i++)
        {
            values.push({'label': dataObjectArray[i][xAxis].toString(), 'value': parseFloat(dataObjectArray[i][yAxis])});
        }

        chartData = new Array();
        chartData[0] = {key: yAxis, values: values};

        //console.log(JSON.stringify(chartData));

        nv.addGraph(function()
        {
            var chart = nv.models.discreteBarChart()
                    .x(function(d) { return d.label })    //Specify the data accessors.
                    .y(function(d) { return d.value })
                    .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
                    .tooltips(false )        //Don't show tooltips
                    .showValues(true)       //...instead, show the bar value right on top of each bar.
                    .transitionDuration(350);

            d3.select('#barGraph')
            .datum(chartData)
            .call(chart);

            nv.utils.windowResize(chart.update);

            return(chart);
        });
    }

    // ----------------------------------------------Line------------------------------------------
    // Converts a string to a date object
    // List of date formats supported:
    // MM/DD/YYYY
    // MM-DD-YYYY
    // MM/DD/YYYY HH:mm:SS
    // MM-DD-YYYY HH:mm:SS

    function parseDateTime(value)
    {
        value = value.trim();

        var dateArray;
        var timeArray;
        var split = value.split(" ");
        var date;
        var time;

        if(split.length == 1)
            date = split[0];
        else if(split.length == 2)
        {
            date = split[0];
            time = split[1];
        }

        if(date.indexOf('/') != -1)
            dateArray = date.split('/');
        else if(date.indexOf('-') != -1)
            dateArray = date.split('-');
        else
            return(parseFloat(value));

        if(time != undefined && time.indexOf(':') != -1)
            timeArray = time.split(':');
        else
            return(new Date(dateArray[2], dateArray[0] - 1, dateArray[1]));

        return(new Date(dateArray[2], dateArray[0] - 1, dateArray[1], timeArray[0], timeArray[1], timeArray[2], 0));
    }

    var isDateTime;

    function plotLine()
    {
        $('#lineGraph').empty();
        $('#chart2').append(lineGraph);

        //$('#title').remove();
        //chartTitle = $('#chartTitle').val();

        var value;
        var colors = ['#FF0000', '#0000FF', '#00FF00', '#6600FF', '#FF00FF', '#663300', '#666699'];     // Different colors used for multiple series
        var colorsIndex = 0;
        var individualData;
        var group;
        var groupExists = false;
        var xValueString;
        var yValueString;
        var xValue;
        var yValue;
        var limit = 65;
        isDateTime = false;
        chartData = new Array();
        var temp;
        var max = 0;

        /*  Determines if x-values are date/time based on x-value field label
            May need another way to determine that
            Alternative method: try to create Date objects from all x values and use insstanceof or typeof to check
            Comment: this would not work for numbers, 0 would be come Jan 1, 1970   */
        if(xAxis == 'date' || xAxis == 'time' || xAxis == 'Date' || xAxis == 'Time' || xAxis == 'Field1')
            isDateTime = true;
        else
            isDateTime = false;

        // If a grouping field exists
        if (grouping != '')
        {
            for (var i = 0; i < dataObjectArray.length; i++)
            {
                group = dataObjectArray[i][grouping];
                xValueString = dataObjectArray[i][xAxis];
                yValueString = dataObjectArray[i][yAxis];

                // If current element did not specify group or x-value, it will be skipped
                if (group == '' || xValueString == '')
                    continue;
                // Y-value is usually quantitative, so blank y-values will become 0
                // Change this option if necessary
                else if (yValueString == '')
                    yValueString = '0';

                // console.log(group);

                // If x-value is date/time
                if (isDateTime == true)
                {
                    //xValue = parseDateTime(xValue.toString());
                    var format = d3.time.format('%m/%d/%Y');
                    xValue = format.parse(xValueString.toString());

                    if (xValue == null)
                    {
                        format = d3.time.format('%m/%d/%Y %H:%M:%S');
                        xValue = format.parse(xValueString.toString());
                    }

                    if(xValue instanceof Date == true)
                        value = {x: xValue.getTime(), y: parseFloat(yValueString)};

                    else
                    {
                        value = {x: xValueString, y: parseFloat(yValueString)};
                        isDateTime = false;
                    }
                }
                else
                    value = {x: xValueString, y: parseFloat(yValueString)};

                if (parseFloat(yValueString) > max)
                    max = parseFloat(yValueString);

                //console.log(JSON.stringify(value));

                // Adding first element
                if (chartData.length == 0)
                {
                    temp = new Array ();
                    temp.push(value);

                    chartData[0] = {values: temp, key: group.substr(0, limit), color: colors[colorsIndex]};
                    colorsIndex = (colorsIndex + 1) % colors.length;
                    //console.log(JSON.stringify(chartData));
                }
                else
                {
                    // If group already exists, appends data
                    for (var j = 0; j < chartData.length; j++)
                    {
                        if (chartData[j].key.substr(0, limit) == group.substr(0, limit))
                        {
                            chartData[j].values.push(value);

                            // var values = chartData[j].values;
                            //console.log(chartData[j].values.length);

                            // for (var k = 0; k < chartData[j].values.length; k++)
                            // {
                            //  console.log("value.x: " + value.x + "\nchartData[j].values[k].x: " + chartData[j].values[k].x);
                            //  if (value.x < chartData[j].values[k].x || k == chartData[j].values.length - 1)
                            //  {
                            //      chartData[j].values.splice(k, 0, value);
                            //      // console.log(JSON.stringify(chartData[j].values));
                            //      // console.log("**************************************************************************");
                            //      break;
                            //  }
                            // }

                            //chartData[j].values = values;
                            groupExists = true;
                            break;
                        }
                    }

                    // If current element's group does not exist in chartData
                    if (groupExists == false)
                    {
                        temp = new Array ();
                        temp.push(value);

                        chartData.push({values: temp, key: group.substr(0, limit), color: colors[colorsIndex]});
                        colorsIndex = (colorsIndex + 1) % colors.length;
                    }

                    groupExists = false;
                }
            }
        }

        /*  If no grouping field is specified
            A lot of this code looks similar to the block above
            when the grouping field is specified
            Could maybe separate some blocks into functions for
            better orgnization/less condense*/
        else
        {
            for (var i = 0; i < dataObjectArray.length; i++)
            {
                xValueString = dataObjectArray[i][xAxis];
                yValueString = dataObjectArray[i][yAxis];

                if (xValueString == '')
                    continue;
                else if (yValueString == '')
                    yValueString = '0';

                if (isDateTime == true)
                {
                    //xValue = parseDateTime(xValue.toString());
                    var format = d3.time.format('%m/%d/%Y');
                    xValue = format.parse(xValueString.toString());

                    if (xValue == null)
                    {
                        format = d3.time.format('%m/%d/%Y %H:%M:%S');
                        xValue = format.parse(xValueString.toString());
                    }

                    if(xValue instanceof Date == true)
                        value = {x: xValue.getTime(), y: parseFloat(yValueString)};
                    else
                    {
                        value = {x: xValueString, y: parseFloat(yValueString)};
                        isDateTime = false;
                    }
                }
                else
                    value = {x: xValueString, y: parseFloat(yValueString)};

                if (parseFloat(yValueString) > max)
                    max = parseFloat(yValueString);

                if (chartData.length == 0)
                {
                    temp = new Array();
                    temp.push(value);

                    chartData[0] = {values: temp, key: yAxis, color: colors[colorsIndex]};
                    colorsIndex = (colorsIndex + 1) % colors.length;
                }
                else
                    chartData[0].values.push(value);
            }
        }

        nv.addGraph(function()
        {
            var chart = nv.models.lineChart()
            .useInteractiveGuideline(true)
            .transitionDuration(350)
            .showYAxis(true)
            .showXAxis(true);

            chart.xAxis.rotateLabels(-65);
            chart.xAxis.showMaxMin(true);
            chart.xAxis.axisLabel(xAxis);

            if(isDateTime == true)
            {
                chart.xAxis.tickFormat(function(d)
                {
                    return d3.time.format('%c')(new Date(d));
                });
                chart.margin({left: 80, right: 80, bottom: 180});
            }
            else
            {
                chart.xAxis.tickFormat(d3.format(',g'));
                chart.margin({left: 100, right: 80, bottom: 80});
            }

            chart.yAxis.axisLabel(yAxis);
            chart.yAxis.tickFormat(d3.format(',g'));
            chart.lines.forceY([0, max]);


            d3.select('#lineGraph').datum(chartData).call(chart);
            nv.utils.windowResize(chart.update);

            return(chart);
        });
    }

    //-------------------------- PIE ------------------------------------------
    function addToArray(array, element)
    {
        for(var i = 0; i < array.length; i++)
        {
            if(array[i]['label'] == element)
            {
                array[i]['value']++;
                return(array);
            }
        }

        array.push({'label': element, 'value': 1});
        return(array);
    }

    function plotPie()
    {
        $('#pieChart').empty();
        //$('#title').remove();
        //chartTitle = $('#chartTitle').val();

        var cumulativeArray = new Array();
        var valueLabel = $('#valueField').val();
        var countField = $('#countField').val();
        chartData = new Array();

        if(countField == '')
        {
            for(var i = 0; i < dataObjectArray.length; i++)
            {
                var value = dataObjectArray[i][valueLabel];

                if(value != '')
                    chartData = addToArray(chartData, value);
            }
        }
        else
        {
            for(var i = 0; i < dataObjectArray.length; i++)
            {
                chartData.push({'label': dataObjectArray[i][valueLabel], 'value': dataObjectArray[i][countField]});
            }
        }
        console.log(JSON.stringify(chartData));

        //$('#chart').prepend('<div id = "title" style = "font-size: 30px; margin-top: 1%;">' + chartTitle + '</div>');

        nv.addGraph(function()
        {
            var chart = nv.models.pieChart()
            .x(function(d) { return d.label; })
            .y(function(d) { return d.value; })
            .showLabels(true);

            d3.select('#pieChart')
            .datum(chartData)
            .transition().duration(350)
            .call(chart);

            nv.utils.windowResize(chart.update);

            return(chart);
        });
    }

    /*  -------------------------- MAP GRAPHING ----------------------------------
        More functions/code than other types of visualization
        There may be a way to condense all this */
    var map;
    var popup;
    var closeTooltip;
    var statesLayer;

    /*  Determines the color based on population value
        based on statesData */
    function getColor(d)
    {
        return d > 1000 ? '#8c2d04' :
            d > 500  ? '#cc4c02' :
            d > 200  ? '#ec7014' :
            d > 100  ? '#fe9929' :
            d > 50   ? '#fec44f' :
            d > 20   ? '#fee391' :
            d > 10   ? '#fff7bc' :
            '#ffffe5';
    }

    function getStyle(feature)
    {
        return {
            weight: 2,
            opacity: 0.1,
            color: 'black',
            fillOpacity: 0.7,
            fillColor: getColor(feature.properties.density)
        };
    }

    // Manages the tooltips
    function mousemove(e)
    {
        var layer = e.target;

        popup.setLatLng(e.latlng);
        popup.setContent('<div class="marker-title">' + layer.feature.properties.name + '</div>' +
        layer.feature.properties.density + ' people per square mile');

        if(!popup._map)
            popup.openOn(map);
        window.clearTimeout(closeTooltip);

        // Highlight feature
        layer.setStyle({
            weight: 3,
            opacity: 0.3,
            fillOpacity: 0.9
        });

        if(!L.Browser.ie && !L.Browser.opera)
            layer.bringToFront();
    }

    function mouseout(e)
    {
        statesLayer.resetStyle(e.target);
        closeTooltip = window.setTimeout(function() {
            map.closePopup();
        }, 100);
    }

    function zoomToFeature(e)
    {
        map.fitBounds(e.target.getBounds());
    }

    // Calls the previous three functions and adds them to the layer
    function onEachFeature(feature, layer)
    {
        layer.on({
            mousemove: mousemove,
            mouseout: mouseout,
            click: zoomToFeature
        });
    }

    // Legend
    function getLegendHTML()
    {
        var grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        labels = [],
        from, to;

        for(var i = 0; i < grades.length; i++)
        {
            from = grades[i];
            to = grades[i + 1];

            labels.push(
            '<li><span class="swatch" style="background:' + getColor(from + 1) + '"></span> ' +
            from +(to ? '&ndash;' + to : '+')) + '</li>';
        }

        return '<span>People per square mile</span><ul>' + labels.join('') + '</ul>';
    }

    function plotChoroplethMap()
    {
        $('#mapWell').append('<div id="map" style = "position: absolute; top: 150px; bottom: 10px; width: 95%;"></div>');

        var locationField = $('#locationField').val();
        var valueField = $('#valueField'). val();

        $('#map').css('height', ($('#mapWell').outerHeight(true) * 3.7) + 'px');

        L.mapbox.accessToken = 'pk.eyJ1IjoiaHVtcGhyZXk4MTQ2IiwiYSI6Im9RTi1Nem8ifQ.LTyEXsadU42usXI8O4k2tg';

        map = L.mapbox.map('map', 'examples.map-i86nkdio').setView([37.8, -96], 4);

        popup = new L.Popup({ autoPan: false });

        statesLayer = L.geoJson(statesData,  {
            style: getStyle,
            onEachFeature: onEachFeature
        }).addTo(map);

        map.legendControl.addLegend(getLegendHTML());

        $('#mapWell').css('height', ($('#mapWell').outerHeight(true) + $('#map').outerHeight()) + 'px');
    }

    /*  Sends visualization data to redis and
        is retrieved and used in dashboard.js(dashboard creation)   */
    function sendGraphToRedis(title, canvas)
    {
        client.getSavedGraphs(function(graphObjects)
        {
            for (var i = 0; i < graphObjects.length; i++)
            {
                if (graphObjects[i].title == title)
                {
                    removeLoader();
                    var r = window.confirm('A graph with title "' + title + '" already exists.  Do you still want to save?');

                    if (r == true)
                    {
                        var counter = 0;

                        for (var j = 0; j < graphObjects.length; j++)
                        {
                            if (graphObjects[j].title.indexOf(title) != -1)
                                counter++;
                        }

                        if (graphTypes[$scope.graphTab - 1] == "line")
                            client.saveGraph({'chart_data': chartData, 'title': title + '(' + counter + ')', 'type': graphTypes[$scope.graphTab - 1], 'png': canvas.toDataURL(), 'xAxis': xAxis, 'yAxis': yAxis, 'is_date_time': isDateTime});
                        else if (graphTypes[$scope.graphTab - 1] == "choropleth")
                            client.saveGraph({'chart_data': statesData, 'title': title + '(' + counter + ')', 'type': graphTypes[$scope.graphTab - 1], 'png': canvas.toDataURL()});
                        else
                            client.saveGraph({'chart_data': chartData, 'title': title + '(' + counter + ')', 'type': graphTypes[$scope.graphTab - 1], 'png': canvas.toDataURL()});


                        alert(title + '(' + counter + ')' + " graph saved.");
                    }

                    exit();
                }
            }

            if (graphTypes[$scope.graphTab - 1] == "line")
                client.saveGraph({'chart_data': chartData, 'title': title, 'type': graphTypes[$scope.graphTab - 1], 'png': canvas.toDataURL(), 'xAxis': xAxis, 'yAxis': yAxis, 'is_date_time': isDateTime});
            else if (graphTypes[$scope.graphTab - 1] == "choropleth")
                client.saveGraph({'chart_data': statesData , 'title': title, 'type': graphTypes[$scope.graphTab - 1], 'png': canvas.toDataURL()});
            else
                client.saveGraph({'chart_data': chartData, 'title': title, 'type': graphTypes[$scope.graphTab - 1], 'png': canvas.toDataURL()});

            removeLoader();
            alert(title + " graph saved.");
        });
    }

    // Saving chart to local drive/server
    $scope.saveFigure = function()
    {
        var canvas;
        var image;
        var ctx;
        var graph;
        var title;

        addLoader();

        /*  To save <svg> elements, I first converted/placed it to a canvas
            and then it can be loaded onto an <img> element and viewed
            Savings choropleth maps are a little different than saving
            nvd3 graphs     */

        if($scope.graphTab == 1)
        {
            graph = document.getElementById('barGraph');
            canvas = document.getElementById('barCanvas');
            // image = document.getElementById('barImage');
            title = $('#titleBar').val();

            ctx = canvas.getContext('2d');
            ctx.drawSvg('<svg>' + graph.innerHTML + '</svg>', 0, 0, 800, 500);
            // image.src = canvas.toDataURL();

            sendGraphToRedis(title, canvas);
            // var download = document.createElement('a');
            // download.href = canvas.toDataURL();
            // download.download = 'asdf';
            // download.click();
        }
        else if($scope.graphTab == 2)
        {
            graph = document.getElementById('lineGraph');
            canvas = document.getElementById('lineCanvas');
            // image = document.getElementById('lineImage');
            title = $('#titleLine').val();

            ctx = canvas.getContext('2d');
            ctx.drawSvg('<svg>' + graph.innerHTML + '</svg>', 0, 0, 1050, 850);
            // image.src = canvas.toDataURL();

            sendGraphToRedis(title, canvas);

            // var download = document.createElement('a');
            // download.href = canvas.toDataURL();
            // download.download = 'asdf';
            // download.click();
        }

        else if($scope.graphTab == 3)
        {
            graph = document.getElementById('pieChart');
            canvas = document.getElementById('pieCanvas');
            // image = document.getElementById('pieImage');
            title = $('#titlePie').val();

            ctx = canvas.getContext('2d');
            ctx.drawSvg('<svg>' + graph.innerHTML + '/<svg>', 0, 0, 800, 470);
            // image.src = canvas.toDataURL();

            sendGraphToRedis(title, canvas);

            // var download = document.createElement('a');
            // download.href = canvas.toDataURL();
            // download.download = 'asdf';
            // download.click();
        }

        else if($scope.graphTab == 4)
        {
            leafletImage(map, function(err, canvas)
            {
                // image = document.getElementById('choroplethMapImage');
                // var dimensions = map.getSize();
                // image.width = dimensions.x;
                // image.height = dimensions.y;
                // image.src = canvas.toDataURL();

                title = $('#titleChoroplethMap').val();
                sendGraphToRedis(title, canvas);
            });
        }
    };
  });
