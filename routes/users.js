var userModel = require('../models/user');

exports.index = function(req, res){
};

exports.create = function(req, res, next){
  if(typeof req.session.user !== 'undefined'){
    req.flash('info', 'You are already logged in.');
    res.redirect('/');
    return;
  }

  if(req.param('password') === '' ||
     req.param('username') === '' ||
     req.param('email') === ''    ||
     req.param('name') === ''){
    req.flash('error', 'Please fill in all required fields.');
    res.render('register');
    return;
  }

  if(req.param('password_confirmation') !== req.param('password')){
    req.flash('error', 'The password fields must match.');
    res.render('register');
    return;
  }

  userModel.where({ $or: [ { email: req.param('email') }, { username: req.param('username') } ] }, function(err, users){
    var user;
    if(err){
      next(err);
      return;
    }

    if(users.length > 0){
      req.flash('error', 'A user already exists with that email and/or username.');
      res.render('register');
      return;
    }

    user = {
      username: req.param('username'),
      name: req.param('name'),
      email: req.param('email'),
      password: req.param('password')
    };

    userModel.save(user, function(err, savedUser){
      if(err){
        next(err);
        return;
      }

      res.redirect('/users/' + savedUser.username.toLowerCase());
    });
  });
};

exports.view = function(req, res, next){
  res.render('view', { user: req.param('id') });
};

exports.update = function(req, res){
};

exports.delete = function(req, res){
};
