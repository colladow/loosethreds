exports.index = function(req, res){
  res.render('index', { currentUser: req.session.currentUser });
};
