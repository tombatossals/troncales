var map;
_.templateSettings = {
	  interpolate : /\{\{(.+?)\}\}/g
};

(function($) {
  $(document).ready(function() {
    	var mapView = new MapView({ el: $("#map_canvas") });
    	var enlaces = new ListaEnlaces();

    	$(".modal .modal-footer .btn-primary").click(function() {
    		$("#modal").modal("hide");
    	});

    	$("a.close").click(function(e) {
	    event.stopPropagation();
	    $(this).parent().hide();
    	});
  });
})(jQuery);
