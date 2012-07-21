define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/viewenlace.html',
  'depend!libs/bootstrap/bootstrap-modal[order!jquery]'
], function($, _, Backbone, templateViewEnlace) {

  var ViewEnlaceView = Backbone.View.extend({
  	    template: _.template(templateViewEnlace),

        events: {
                "click .viewenlace .delete-enlace": "delete",
                "click .viewenlace .btn-close": "close"
        },

  	    initialize: function(options) {
                _.bindAll( this, "close", "delete" );
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

	    delete: function() {
		    if (!this.model.get("validated")) {
			    this.model.destroy();
			    this.collection.fetch();
			    this.close();
		    }
	    }
  });

  return ViewEnlaceView;
});
