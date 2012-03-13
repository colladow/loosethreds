
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index');
};

exports.login = function(req, res){
  res.render('login');
};

exports.register = function(req, res){
  res.render('register');
};

exports.users = require('./users');
