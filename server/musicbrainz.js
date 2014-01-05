var q = require('q');
var config = require('./config');
var cache = require('./cache');
var mb = require('musicbrainz');
var CA = require('coverart');

// Initialize Cover Art
var coverart = new CA({userAgent: config.lastfm.useragent });

var musicBrainz = {

	init: function() {
		mb.configure({
			// baseURI: 'http://myMusicBrainzServer.org/ws/2/',
			rateLimit: {
				requests: 1,
				interval: 1000
			}
		});
	},

	findArtistId: function(artist) {
		var defer = q.defer();

		mb.searchArtists(artist, {}, function(err, artists){

			if(err) defer.reject(err);
			if(artists.length === 0) {
				defer.reject('No artist found.');
				return false;
			}

			defer.resolve({ id: artists[0].id, name: artists[0].name });
		});

		return defer.promise;
	},

	getReleasesByArtist: function(mbid) {
		var defer = q.defer();

		// try cache.
		cache.check('releases:' + mbid)
			.then(function(result) {
				console.log('cache returned ' + mbid);
				defer.resolve(result);
			})
			.fail(function(result) {
				// do it the hard way
				console.log('fetching ' + mbid);
				mb.lookupArtist(mbid, ['releases'], function (err, releases) {
					if(err) {
						defer.reject(err);
					} else {
						console.log('fetched ' + mbid);
						// console.log(releases);
						// cache it
						cache.save('releases:' + mbid, releases);
						defer.resolve(releases);
					}
				});

			});

		return defer.promise;
	},

	addCoverArt: function(rel) {

		var defer = q.defer();

		console.log(rel.mbid);
		console.log('checking ' + rel.mbid);

		cache.check('coverart:' + rel.mbid)
			.then(function(result) {
				console.log('cache returned coverart ' + rel.mbid);
				console.log(result);
				defer.resolve(result);
			})
			.fail(function(result) {
				console.log('fetching coverart ' + rel.mbid);
				coverart.release(rel.mbid, function(err, response){
					console.log(err);
					if(err) {
						// save the error to cache as well :|
						rel.image = 'http://localhost:3001/images/noimage.jpg';
						cache.save('coverart:' + rel.mbid, rel)
						defer.reject(); 
					}
					else {
						console.log(response);
						console.log('gosh', response.images[0]);
						rel.image = response.images[0].image;
						console.log(rel.image);
						cache.save('coverart:' + rel.mbid, rel)
						.then(function() {
							defer.resolve(rel);
						});
					}
				});
			});

		return defer.promise;
	}
}

module.exports = musicBrainz;