define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/editenlace.html'
], function($, _, Backbone, templateEditEnlace){

  var EditEnlaceView = Backbone.View.extend({
        template: _.template(templateEditEnlace),
        events: {
                "click .editenlace .save-enlace": "save",
                "click .btn-close": "close"
        },
            initialize: function(options) {
                _.bindAll( this, "save", "close" );
            },
        render: function() {
                $(this.el).html(this.template(this.model.toJSON()));
                $(this.el).modal();
                return this;
        },
        close: function(event) {
            $(this.el).modal("hide");
            this.trigger("closeall");
        },
        save: function() {
            var attributes = {
                name: $("#editEnlaceName").val(),
                rrdtool_bandwidth_graph_id: $("#editEnlaceBandwidthGraph").val(),
                rrdtool_traffic_graph_id: $("#editEnlaceTrafficGraph").val(),
                rrdtool_bandwidth_id: $("#editEnlaceBandwidth").val(),
                rrdtool_traffic_id: $("#editEnlaceTraffic").val()
            }
            this.model.save(attributes);
            this.close();
        }
  });

  return EditEnlaceView;
});
