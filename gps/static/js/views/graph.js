define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/graph.html'
], function($, _, Backbone, templateGraph){

  var GraphView = Backbone.View.extend({
    template: _.template(templateGraph),
    events: {
        "click .close": "close",
    },

    initialize: function(options) {
        _.bindAll( this, "close" );
    },

    render: function() {
        $(this.el).html(this.template( { "graph_id": this.model.get("rrdtool_bandwidth_graph_id") } ));
        $(this.el).show();
        return this;
    },

    close: function() {
        $(this.el).hide();
    }

  });

  return GraphView;
});
