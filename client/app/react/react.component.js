angular.module('fullstackGenApp')
  .value('HelloComponent', React.createClass({

    render: function() {
      if (!this.props.name || this.props.name === '') {
        return React.DOM.div(null, 'Try logging in!');
      }
      return React.DOM.div(null, 'Hello ', this.props.name, ' (', this.props.email, ').');
    }
  }))
  .value('ListView', React.createClass({

    render: function() {
      if (this.props.data.length < 1) {
        return React.DOM.div(null, 'Nothing here yet. D=');
      }

      var rows = this.props.data.map( function(datum) {
        return React.DOM.tr({'key': datum.id}, React.DOM.td(null, datum.val));
      });

      return React.DOM.table(null, rows);
    }
  }));