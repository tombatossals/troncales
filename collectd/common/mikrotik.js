var api = require('mikronode');

function getips(ip, username, password, callback) {
    var connection = new api(ip, username, password);
    connection.connect(function(conn) {
        var chan=conn.openChannel();
        chan.write('/ip/address/print',function() {
            chan.on('done',function(data) {
                var parsed = api.parseItems(data);
                var interfaces = [];
                var count = parsed.length;
                parsed.forEach(function(item) {
                    var iface = { name: item.interface, address: item.address };
                    interfaces.push(iface);
                    count--;
                    if (count === 0) {
                        callback(interfaces);
                    }
                });
                chan.close();
                conn.close();
            });
        });
    });
}

module.exports.getips = getips;
