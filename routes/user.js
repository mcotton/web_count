
/*
 * GET users listing.
 */

var redis = require('redis');
var db = redis.createClient();

exports.list = function(req, res){
  db.smembers('set:usernames', function(err, data) { 
  	if(err)  res.json(400, { 'error': err })
  	if(data) res.json(200, data) 
  });
};

exports.curr_user = function(req, res){
	if(req.session.user.id && db.exists('users:' + req.session.user.id)) {	
	  console.log('looking up users:' + req.session.user.name)
	  db.get('users:' + req.session.user.name, function(err, data) { 
	  	if(err)  res.json(400, { 'error': err })
	  	if(data) res.json(200, data) 
	  });
	} else {
		res.json(404, { 'error': 'user not found' });
	}
};

exports.userById = function(req, res){
	if(req.params.id && db.exists('users:' + req.params.id)) {	
	  console.log('looking up users:' + req.params.id)
	  db.get('users:' + req.params.id, function(err, data) { 
	  	if(err)  res.json(400, { 'error': err })
	  	if(data) res.json(200, data) 
	  });
	} else {
		res.json(404, { 'error': 'user not found' });
	}
};

exports.login = function(req, res) {
	res.render('login');
};

exports.logout = function(req, res) {
	// destroy the user's session to log them out
	// will be re-created next request
	req.session.destroy(function(){
		res.redirect('/login');
	});
};

exports.restricted = function(req, res) {
	res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>');
};

exports.create = function(req, res) {
	res.render('create')
};