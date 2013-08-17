
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var redis = require('redis');
var db = redis.createClient();

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


// custome middleware
app.use(function(req, res, next) {
	var ua = req.headers['user-agent'];
	db.zadd('online', Date.now(), ua, next);
});

app.use(function(req, res, next) {
	var min = 60 * 1000;
	var ago = Date.now() - min;
	db.zrevrangebyscore('online', '+inf', ago, function(err, users) {
		if(err) return next(err);
		req.online = users;
		next();
	});
});

// standard middleware
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('A horse is a horse, of course, of course.  Unless, of course, that horse is the famous Mr. Ed.'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));



// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
