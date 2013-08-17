
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
var hash = require('pwd').hash;

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

// session-persisted session middleware
app.use(function(req, res, next) {
	var err = req.session.error,
		msg = req.session.success;
	delete req.session.error;
	delete req.session.success;
	res.locals.message = '';
	if(err) res.locals.message = '<p class="msg_error">' + err + '</p>';
	if(msg) res.locals.message = '<p class="msg_success">' + msg + '</p>';
	next();
});

// dummy database
var users = {
	tj: { name: 'tj' }
}

function authenticate(name, pass, fn) {
	if(!module.parent) console.log('authenticating %s %s', name, pass);
	var user = users[name]
	if(!user) fn(new Error('could not find user named ' + name));
	hash(pass, user.salt, function(err, hash) {
		if(err) return fn(err);
		console.log('hash     : ' + hash)
		console.log('user.hash: ' + user.hash)
		console.log('hash.length:      ' + hash.length)
		console.log('user.hash.length: ' + user.hash.length)
		console.log(hash == users[name].hash)
		if(hash == user.hash) {
				console.log('hash == user.hash')
				return fn(null, user);
		} else {
			fn(new Error('invalid password'));
		}
	});
}


function restrict(req, res, next) {
	if(req.session.user) {
		next();
	} else {
		req.session.error = "Access Denied";
		res.redirect('/login');
	}
}

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));



// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/login', user.login);
app.post('/login', function(req, res) {
	authenticate(req.body.username, req.body.password, function(err, user) {
		console.log('user: ' + user)
		console.log('username: ' + req.body.username)
		console.log('password: ' + req.body.password)
		if(user) {
			// Regenerate session when signing in
			// to prevent fixation 
			req.session.regenerate(function(){
				// Store the user's primary key 
				// in the session store to be retrieved,
				// or in this case the entire user object
				req.session.user = user;
				req.session.success = 'Authenticated as ' + user.name
				  + ' click to <a href="/logout">logout</a>. '
				  + ' You may now access <a href="/restricted">/restricted</a>.';
				res.redirect('back');
			});
		} else {
			console.log('err:' + err)
      		req.session.error = 'Authentication failed, please check your '
        		+ ' username and password.'
        		+ ' (use "tj" and "foobar")';
      		res.redirect('login');
    	}
	})
});
app.get('/logout', user.logout);
app.get('/restricted', restrict, user.restricted);
app.get('/users', user.list);
app.get('/create', function(req, res) {
	// when you create a user, generate a salt
	// and hash the password, 'foobar' is the password here
	hash('foobar', function(err, salt, hash) {
		if(err) throw(err);
		// store the salt and hash in the database
		users.tj.salt = salt
		users.tj.hash = hash
		res.send('user tj now has a salt: ' + salt + ' and hash: ' + hash)
	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
