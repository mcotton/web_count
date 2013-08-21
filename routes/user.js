
/*
 * GET users listing.
 */

var redis = require('redis');
var db = redis.createClient();

exports.list = function(req, res){
  db.smembers('set:usernames', function(err, data) { 
  	if(err)  res.json(400, { 'error': err })
  	if(data) res.json({ 'users': data }) 
  });
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