// For a full proxy solution, see https://github.com/nodejitsu/node-http-proxy
var http = require('http');
var request = require("request");
var express = require('express');
var app = express();
var server = require("http").createServer(app);
var url = require("url");

// middleware
//app.use(express.bodyParser());

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin',   "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.configure(function() {
    app.use(allowCrossDomain);
    app.use(express.static(__dirname));
    app.use(express.directory(__dirname));
});

// Get port number from command line option
var port = process.argv[2] || 8888;

function parsereq(req, res0) {

	urlx = "";
	// For case where url= is not specified.
	for (var name in req.query) {
	    var urlx = name + "=" + req.query[name] + "&";
	}
	urlx.replace(/\&$/,'');	
	
	urlx = req.query.url || req.body.url || urlx || res0.send("URL must be specified\n");
	if (!urlx.match(/^http\:\/\//)) {urlx = "http://" + urlx;}
	return url.parse(urlx);
}

// To implement POST, use https://github.com/nodejitsu/node-http-proxy

app.get('/proxy', function(req0, res0){

	parts = parsereq(req0);
	var options = {host: parts.host, port: 80, path: parts.path,agent:false};

	var req = http.request(options, function(res) {
		res0.writeHead(res.statusCode, res.headers)
		res.setEncoding('utf8');
		res.on('data', function (chunk) {res0.write(chunk);});
		res.on('end',function () {res0.end();});
		req.on('error', function(e) {console.log('Problem with request: ' + e.message);});
	});

	req.end();
	
});

server.listen(port);