
/*
 * GET home page.
 */

exports.index = function(req, res){
  //res.render('index', { title: 'Express' });
  //res.send((req.online.length || 0) + ' users online');
  res.redirect('login');
};