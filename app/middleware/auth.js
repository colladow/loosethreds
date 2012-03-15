exports.restrict = function(req, res, next){
  if(typeof req.session.currentUser === 'undefined'){
    req.flash('error', 'You must login to view this page.');
    res.redirect('/login');
  }else{
    next();
  }
};
