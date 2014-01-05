var http = require('http');
var express = require('express');
var config = require('./config');
var app = express();
var server = http.createServer(app);
var choon = require('./choon');

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.cookieParser(config.server.cookieSecret));
app.use(express.cookieSession());
app.use('/', express.static(__dirname + '/../client/dist'));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.get('/albums/:username', getDataForUser);


function getDataForUser(req, res) {
	res.type('application/json');

  	choon.getDataForUser(req.params.username, 25)
		.then(function(result) {
			res.send(result);
		});
}

server.listen(config.server.listenPort, '0.0.0.0', 511, function() {
	console.log(config.app.name + ' server listening on port ' + config.server.listenPort);
});