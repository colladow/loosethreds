var userModel = require('../models/user'),
    fs        = require('fs'),
    path      = require('path'),
    http      = require('http'),
    url       = require('url');

exports.index = function(req, res, next){
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

    res.render('users/show.jade', {
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

exports.images = {
  index: function(req, res){},
  create: function(req, res, next){
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
            path: path.join(midPath, fname)
          };

          user.images[user.imageId] = image;
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
  },
  delete: function(req, res, next){
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
  }
};

exports.urls = {
  index: function(){},
  create: function(req, res, next){
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

    if(typeof user.urls === 'undefined'){
      user.urls = {};
      user.urlId = 0;
    }

    fname = user.urlId + '.' + options.path.split('/').pop();
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

          imageUrl = {
            path: path.join(midPath, fname)
          };

          user.urls[user.urlId] = imageUrl;
          user.urlId += 1;

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
  },
  delete: function(req, res, next){
    var user  = userModel.buildUser(req.session.currentUser),
        urlId = req.param('urlid'),
        imageUrl = user.urls[urlId],
        change = {};

    change['urls.' + urlId] = 1;

    userModel.update({ path: user.path }, { $unset: change }, {}, function(err){
      if(err){
        next(err);
        return;
      }

      fs.unlink(path.join(req.app.settings.imagedir, imageUrl.path), function(err){
        if(err){
          next(err);
          return;
        }

        req.flash('info', 'The image has been removed successfully.');
        res.redirect('/users/' + user.path);
      });
    });
  }
};
