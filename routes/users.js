var userModel = require('../models/user'),
    fs = require('fs'),
    path = require('path');

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

      req.session.user = user;
      res.redirect('/');
    });
  });
};

exports.show = function(req, res, next){
  res.render('users/show', { user: userModel.buildUser(req.session.user) });
};

exports.update = function(req, res){
};

exports.delete = function(req, res){
};

exports.images = {
  index: function(req, res){},
  create: function(req, res, next){
    fs.readFile(req.files.image.path, function (err, data) {
      var user  = userModel.buildUser(req.session.user),
          dir   = path.join('/images', user.path()),
          fname = path.join(dir, req.files.image.name),
          dir   = path.join(req.app.settings.imagedir, dir);

      path.exists(dir, function(exists){
        if(!exists){
          fs.mkdirSync(dir);
        }

        fs.writeFile(path.join(dir, req.files.image.name), data, function (err) {
          var image;

          if(err){
            next(err);
            return;
          }

          if(typeof user.images === 'undefined'){
            user.images = [];
            user.imageId = 0;
          }

          image = {};
          image[user.imageId] = fname;

          user.images.push(image);
          user.imageId += 1;

          user.save(function(err){
            if(err){
              next(err);
              return;
            }

            res.redirect('/');
          });
        });
      });
    });
  }
};
