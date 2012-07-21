define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/graph.html',
  'qtip'
], function($, _, Backbone, templateGraph){

  var GraphView = Backbone.View.extend({
    template: _.template(templateGraph),
    events: {
        "click .close": "close",
        "mouseover img": "showgraph",
        "mouseout img": "hidegraph"
    },

    initialize: function(options) {
        _.bindAll( this, "close", "hidegraph", "move" );
        this.tick = false;
    },

    render: function(enlace, pos) {
        $(this.el).css("top", pos.y + "px");
        $(this.el).css("left", pos.x + "px");
        if ($(this.el).css('display') == 'none' || this.model != enlace) {
            this.model = enlace;
            $(this.el).html(this.template( { "graph_id": this.model.get("rrdtool_bandwidth_graph_id") } ));
            $(this.el).show();
            return this;
        }
    },

    move: function(pos) {
        $("div#graph").css("top", pos.y + "px");
        $("div#graph").css("left", pos.x + "px");
    },

    showgraph: function() {
        this.tick = false;
        $(this.el).show();
    },

    hidegraph: function() {
        this.tick = true;
        setTimeout(this.close, 4000);
    },

    close: function() {
        if (this.tick) {
            $(this.el).hide();
        }
    }

  });

  return GraphView;
});
