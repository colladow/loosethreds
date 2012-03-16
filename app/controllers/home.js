var userModel = require('../models/user');

exports.index = function(req, res){
  userModel.all(function(err, users){
    if(err){
      next(err);
      return;
    }

    res.render('users/index', {
      users: users,
      currentUser: req.session.currentUser,
      imagepath: req.app.settings.imagepath
    });
  });
};
