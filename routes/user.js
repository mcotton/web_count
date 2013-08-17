
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.login = function(req, res) {
	res.render('login');
};

exports.logout = function(req, res) {
	// destroy the user's session to log them out
	// will be re-created next request
	req.session.destroy(function(){
		res.redirect('/');
	});
};

exports.restricted = function(req, res) {
	res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>');
};