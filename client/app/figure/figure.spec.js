'use strict';

describe('Utility: Figure', function() {

  it('should format the x-axis for time', function() {
    var mockChart = {
      xAxis: {
        tickFormat: function() {}
      }
    };

    formatXAxisForTime(mockChart);
    expect(mockChart.xAxis.tickFormat).not.toBe(null);
  });

  describe('Utility: Figure: nvd3', function () {

    beforeEach(function () {
      spyOn(nv, 'addGraph');
    });

    afterEach(function() {
      expect(nv.addGraph).toHaveBeenCalled();
    });

    it('should add a bar chart', function () {
      window.plot_discreteBar();
    });

    it('should add a line chart', function () {
      window.plot_line();
    });

    it('should add a pie chart', function () {
      window.plot_pie();
    });

    it('should add a scatter chart', function () {
      window.plot_scatter();
    });
  });
});