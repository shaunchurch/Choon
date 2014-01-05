/**
* 	Choon
*   -----
*
*	Set your last.fm usename, we'll grab your top 100 - 1000 artists
* 	We'll display a list of all the albums released by those artists in chronological order.
* 	Once you've been once we remember and notify you if anything changes. etc.

*	v0.1 goals
*	- Get all users artists from last.fm
*	- Request all artist ids !!! Comes with last.fm data
*	- Request all releases by all artists using id (cache musicbrainz in redis!)
*	- Show all releases in chronological order
**/

var _ = require('underscore');
var q = require('q');
var config = require('./config');
var cache = require('./cache');
var mb = require('./musicbrainz.js');
var lastfm = require('./lastfm.js');
mb.init();

var Choon = {

	username: 'gigglesticks',

	getUsername: function() {
		return this.username;
	},

	setUsername: function(username) {
		this.username = username;
	},

	getDataForUser: function(username, noOfArtists) {

		var defer = q.defer();

		this.setUsername(username);

		lastfm.getLibraryArtists(username, noOfArtists)
		.then(this.getReleases)
		.then(this.filterFulfilledPromises)
		.then(this.sortReleases)
		.then(this.getCoverArt)
		.then(this.filterFulfilledPromises)
		.then(function(result) {
			defer.resolve(result.reverse());
		})
		// .then(logReleases)
		.catch(function(error) {
			console.log(error);
			// defer.reject(error);
		});

		return defer.promise;
	},


	getReleases: function(artists) {
		var requests = [];
		_.each(artists.artists.artist, function(artist) {
			requests.push(mb.getReleasesByArtist(artist.mbid));
		});
		return q.allSettled(requests);
	},

	sortReleases: function(artists) {
		var defer = q.defer();
		var allReleases = [];

		console.log('Sorting releases by date…');

		// // check cache for sorted list
		// cache.check('sorted:' + Choon.getUsername())
		// 	.then(function(result) {

		// 			defer.resolve(result);
		// 	})
			// .fail(function(result) {
				_.each(artists, function(artist) {
					_.each(artist.releases, function(release) {
						allReleases.push({ mbid: release.id, title: release.title, artist: artist.name, date: release.date });
					});
				});

				// sort by date object from release date
				allReleases = _.sortBy(allReleases, function(release) {
					return new Date(release.date);
				});

				// cache releases for user
				cache.save('sorted:' + Choon.getUsername(), allReleases);

				defer.resolve(allReleases);
			// });
		
		return defer.promise;
	},

	logReleases: function(releases) {
		console.log('Log releases…');
		_.each(releases, function(release) {
			console.log(release.date + ' : ' + release.title + ' by ' + release.artist + ' #:'+release.mbid);
			console.log(release.image);
		});
	},

	filterFulfilledPromises: function(results) {
		var fulfilled = [];
		_.each(results, function(result) {
			(result.state === 'fulfilled') ? fulfilled.push(result.value) : '';
		});
		return fulfilled;
	},

	getCoverArt: function(results) {
		var requests = [];
		console.log('Adding cover art…');
		_.each(results, function(result) {
			requests.push(mb.addCoverArt(result));
		});
		return q.allSettled(requests);
	}
}

module.exports = Choon;