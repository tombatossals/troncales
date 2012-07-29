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
        this.timeout = null;
    },

    render: function(enlace, pos) {

        if (! enlace.get("rrdtool_bandwidth_graph_id") ) {
            return;
        }

        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        $(this.el).css("top", pos.y + "px");
        $(this.el).css("left", pos.x + "px");
        if ($(this.el).css('display') == 'none' || this.model != enlace) {
            this.model = enlace;
            $(this.el).html(this.template( { "graph_id": this.model.get("rrdtool_bandwidth_graph_id") } ));
            $(this.el).show(200);
            return this;
        }
    },

    move: function(pos) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        $("div#graph").css("top", pos.y + "px");
        $("div#graph").css("left", pos.x + "px");
    },

    showgraph: function() {
        this.tick = false;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        $(this.el).show(200);
    },

    hidegraph: function() {
        this.tick = true;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.close, 1000);
    },

    close: function() {
        if (this.tick) {
            $(this.el).hide(100);
        }
    }

  });

  return GraphView;
});
