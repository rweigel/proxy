// For a full proxy solution, see https://github.com/nodejitsu/node-http-proxy
var http = require('http');
http.globalAgent.maxSockets = 100;  // Most Apache servers have this set at 100.
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
	console.log(req0.method + " " + parts.host + parts.path);
	var req = http.request(options, function(res) {
		//res0.header("Access-Control-Expose-Headers","X-Content-Length");
		//res0.header("Access-Control-Allow-Headers","Content-Length");
		//console.log(res.headers["content-length"]);
		// Browsers typically don't allow headers except Content-Type
		// and Last-Modified to be extracted through the XHR object.
		// So put the content length in the Content-Type header ....
		// TODO: Only do this for XHR requests.  How to determine this?
		// Adding this to .ajax request: headers: {"X-My-Headers": "Hello"}
		// gives Request header field X-My-Headers is not allowed by Access-Control-Allow-Headers. 
		// in Chrome
		res0.header("Content-Type","Content-Length: " + res.headers["content-length"]);
		//console.log(req0.headers);
		res0.writeHead(res.statusCode, res.headers)
		res.setEncoding('utf8');
		res.on('data', function (chunk) {res0.write(chunk);});
		res.on('end',function () {res0.end();});
		req.on('error', function(e) {console.log('Problem with request: ' + e.message);});
	});

	req.end();
	
});

server.listen(port);