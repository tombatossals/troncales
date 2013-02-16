var api = require('mikronode'),
    logger = require('./log'),
    util = require('util');

function getips(ip, username, password, callback) {

    //process.on('uncaughtException', function(err) {
    process.on('error', function(err) {
        logger.error(err, ip);
        logger.error(util.format("FATAL: Can't connect to the API: %s %s %s", ip, username, password));
        //process.exit(0);
    });

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
