define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/help.html',
  'depend!libs/bootstrap/bootstrap-modal[order!jquery]'
], function($, _, Backbone, templateHelp) {

  var HelpView = Backbone.View.extend({
  	template: _.template(templateHelp),
        events: {
        	"click .help .close": "close"
    	},
  	initialize: function(options) {
                _.bindAll( this, "close" );
	},	
        render: function() {
      		$(this.el).html(this.template());
		$(this.el).modal();
        	return this;
    	},
        close: function(event) {
        	$(this.el).modal("hide");
    	}
  });

  return HelpView;
});
