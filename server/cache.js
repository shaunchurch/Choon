var config = require('./config');
var q = require('q');
var redis = require('redis');
var client = redis.createClient();

client.on('error', function(err) {
	console.log('Redis Error');
	console.log(err);
});

var Cache = {

	save: function(key, data) {
		var defer = q.defer();

		client.set(key, JSON.stringify(data), function() {
			client.expire(key, config.cache.expiry, function() {
				defer.resolve();
			});
		});

		return defer.promise;
	},

	check: function(key) {

		var defer = q.defer();

		client.get(key, function(err, replies) {
			if(err || replies === null) {
				defer.reject();
			} else {
				defer.resolve(JSON.parse(replies));
			}
		});

		return defer.promise;
	}

};

module.exports  = Cache;