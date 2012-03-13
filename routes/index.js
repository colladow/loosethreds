var userModel = require('../models/user');

exports.index = function(req, res){
  res.render('index', { user: userModel.buildUser(req.session.user) });
};

exports.login = function(req, res){
  if(typeof req.session.user !== 'undefined'){
    res.redirect('/');
    return;
  }

  res.render('login');
};

exports.logout = function(req, res){
  if(typeof req.session.user !== 'undefined'){
    delete req.session.user;
  }

  res.redirect('/');
};

exports.authenticate = function(req, res, next){
  if(typeof req.session.user !== 'undefined'){
    req.flash('info', 'You are already logged in.');
    res.redirect('/');
    return;
  }

  if(req.param('username') === '' || req.param('password') === ''){
    req.flash('error', 'Please fill in all required fields.');
    res.render('login');
    return;
  }

  userModel.where({ username: req.param('username') }, function(err, users){
    var user;

    if(err){
      next(err);
      return;
    }

    if(users.length === 0){
      req.flash('error', 'Your username/password combination is incorrect.');
      res.render('login');
      return;
    };

    user = users[0];

    if(!user.checkPassword(req.param('password'))){
      req.flash('error', 'Your username/password combination is incorrect.');
      res.render('login');
      return;
    }

    req.session.user = user;
    res.redirect('/');
  });
};

exports.register = function(req, res){
  if(typeof req.session.user !== 'undefined'){
    req.flash('info', 'You are already logged in.');
    res.redirect('/');
    return;
  }

  res.render('register');
};

exports.users = require('./users');
