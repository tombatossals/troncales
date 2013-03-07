var api = require('mikronode'),
    util = require('util');

function traceroute(ip, username, password, remoteip, callback) {

    var connection = new api(ip, username, password);
    connection.on('error', function(err) {
        console.log(err);
        callback();
    });

    connection.connect(function(conn) {
        var chan=conn.openChannel();
        chan.write([ '/tool/traceroute', '=address=' + remoteip ], function() {
            chan.on('done', function(data) {
                var parsed = api.parseItems(data);
                var path = [];
                var count = parsed.length;
                parsed.forEach(function(item) {
                    if (item.address.search("10.") == 0 || item.address.search("172.") == 0) {
                        path.push(item.address);
                    }
                    count--;
                    if (count === 0) {
                        callback(path);
                    }
                });
                chan.close();
                conn.close();
            });
        });
    });
}

module.exports.traceroute = traceroute;
