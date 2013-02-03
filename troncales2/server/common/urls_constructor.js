"use strict";

var _und     = require('underscore');

function urlsConstructor(base_url, urls) {

  function mapurl(arr, baseurl) {
      var newarr = {};
      _und.map(arr, function(val, key) {
          if (typeof val === "string") {
              newarr[key] = base_url + val;
          } else {
              newarr[key] = mapurl(val, baseurl);
	  }
      });
      return newarr;
  }

  var newurls = mapurl(urls, base_url);

  newurls.base = base_url;
  return newurls;
}

module.exports = urlsConstructor;
