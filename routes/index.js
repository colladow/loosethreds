var userModel = require('../models/user');

exports.index = function(req, res){
  res.render('index');
};

exports.login = function(req, res){
  if(typeof req.session.user !== 'undefined'){
    res.redirect('/');
    return;
  }

  res.render('login');
};

exports.authenticate = function(req, res, next){
  if(typeof req.session.user !== 'undefined'){
    res.redirect('/');
    return;
  }

  if(req.param('username') === '' || req.param('password') === ''){
    next(new Error('Please fill in all required fields.'));
    return;
  }

  userModel.where({ username: req.param('username') }, function(err, users){
    var user;

    if(err){
      next(err);
      return;
    }

    if(users.length === 0){
      res.redirect('/login');
      return;
    };

    user = users[0];

    if(!user.checkPassword(req.param('password'))){
      res.redirect('/login');
      return;
    }

    req.session.user = user;
    res.redirect('/');
  });
};

exports.register = function(req, res){
  if(typeof req.session.user !== 'undefined'){
    res.redirect('/');
    return;
  }

  res.render('register');
};

exports.users = require('./users');
