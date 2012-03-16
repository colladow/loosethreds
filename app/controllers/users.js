var userModel = require('../models/user'),
    fs        = require('fs'),
    path      = require('path'),
    http      = require('http'),
    url       = require('url');

exports.index = function(req, res, next){
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

exports.create = function(req, res, next){
  if(typeof req.session.currentUser !== 'undefined'){
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
      password: req.param('password'),
      path: req.param('username').toLowerCase()
    };

    userModel.save(user, function(err, savedUser){
      if(err){
        next(err);
        return;
      }

      req.session.currentUser = user;
      res.redirect('/');
    });
  });
};

exports.show = function(req, res, next){
  userModel.where({ path: req.param('id') }, function(err, users){
    var user;

    if(err){
      next(err);
      return;
    }

    if(users.length === 0){
      next(new Error('User not found.'));
      return;
    }

    user = userModel.buildUser(users[0]);

    res.render('users/show', {
      user: user,
      currentUser: req.session.currentUser,
      imagepath: req.app.settings.imagepath
    });
  });
};

exports.update = function(req, res){
};

exports.delete = function(req, res){
};

exports.images = function(){
  var self = {},
      handleFileUpload = function(req, res, next){
        fs.readFile(req.files.image.path, function (err, data) {
          var user    = userModel.buildUser(req.session.currentUser),
              midPath = path.join('/images', user.path),
              dir     = path.join(req.app.settings.imagedir, midPath),
              fname, filePath;
              
          if(typeof user.images === 'undefined'){
            user.images = {};
            user.imageId = 0;
          }
          
          fname    = user.imageId + '.' + req.files.image.name;
          filePath = path.join(dir, fname)

          path.exists(dir, function(exists){
            if(!exists){
              fs.mkdirSync(dir);
            }

            fs.writeFile(filePath, data, function (err) {
              var image;

              if(err){
                next(err);
                return;
              }

              image = {
                path: path.join(midPath, fname),
                created: new Date()
              };

              user.addImage(image);

              user.save(function(err){
                if(err){
                  next(err);
                  return;
                }

                res.redirect('/users/' + user.path);
              });
            });
          });
        });
      },
      handleUrlFile = function(req, res, next){
        var user = userModel.buildUser(req.session.currentUser),
            fileUrl = req.param('url'),
            midPath = path.join('/images', user.path),
            dir     = path.join(req.app.settings.imagedir, midPath),
            options = {
              host: url.parse(fileUrl).host,
              port: 80,
              path: url.parse(fileUrl).pathname
            },
            imageUrl, fname, file;

        if(typeof user.images === 'undefined'){
          user.images = {};
          user.imageId = 0;
        }

        fname = user.imageId + '.' + options.path.split('/').pop();
        file = fs.createWriteStream(path.join(dir, fname));

        path.exists(dir, function(exists){
          if(!exists){
            fs.mkdirSync(dir);
          }

          http.get(options, function(imageRes){
            imageRes.on('data', function(data){
              file.write(data);
            }).on('end', function(){
              file.end();

              image = {
                path: path.join(midPath, fname),
                created: new Date()
              };

              user.addImage(image);

              user.save(function(err){
                if(err){
                  next(err);
                  return;
                }

                res.redirect('/users/' + user.path);
              });
            });
          });
        });
      };

  self.index = function(req, res){},

  self.create = function(req, res, next){
    if(typeof req.param('url') !== 'undefined'){
      handleUrlFile(req, res, next);
      return;
    }
    if(typeof req.files.image.path !== 'undefined'){
      handleFileUpload(req, res, next);
      return;
    }
  };

  self.delete = function(req, res, next){
    var user  = userModel.buildUser(req.session.currentUser),
        imageId = req.param('imageid'),
        image = user.images[imageId],
        change = {};

    change['images.' + imageId] = 1;

    userModel.update({ path: user.path }, { $unset: change }, {}, function(err){
      if(err){
        next(err);
        return;
      }

      fs.unlink(path.join(req.app.settings.imagedir, image.path), function(err){
        if(err){
          next(err);
          return;
        }

        req.flash('info', 'The image has been removed successfully.');
        res.redirect('/users/' + user.path);
      });
    });
  };

  return self;
}();
