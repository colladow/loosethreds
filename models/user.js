var mongo = require('mongojs'),
    bcrypt = require('bcrypt');

module.exports = function(){
  var self = {},
      db = mongo.connect('loosethreds', ['users']),
      generateHash = function(password, salt){
        return bcrypt.hashSync(password, salt);
      },
      dehydrateUser = function(user){
        var data = {};

        for(field in user){
          if(user.hasOwnProperty(field) && typeof user[field] !== 'function'){
            data[field] = user[field];
          }
        }

        return data;
      };
      
  self.buildUser = function(user){
    if(typeof user === 'undefined'){ return; }

    user.save = function(callback){
      var changes = dehydrateUser(user);

      self.update({ _id: user._id }, changes, {}, callback);
    };

    user.setPassword = function(password, callback){
      user.salt = bcrypt.genSaltSync(10);
      user.hash = generateHash(password, user.salt);

      user.save(callback);
    };

    user.checkPassword = function(password){
      var testHash = generateHash(password, user.salt);

      return user.hash === testHash;
    };

    user.destroy = function(callback){
      self.destroy(user, callback);
    };

    user.path = function(){
      return user.username.toLowerCase();
    };

    return user;
  };
  
  self.all = function(callback){
    db.users.find(callback);
  };

  self.find = function(id, callback){
    db.users.find({ _id: mongo.ObjectId }, function(err, user){
      if(err){
        callback(err);
        return;
      }

      if(user.length === 0){
        callback(new Error('User not found.'));
        return;
      }

      callback(null, self.buildUser(user[0]));
    });
  };

  self.where = function(query, callback){
    db.users.find(query, function(err, docs){
      var users = [];

      if(err){
        callback(err);
        return;
      }

      for(var i = 0, l = docs.length; i < l; i++){
        users.push(self.buildUser(docs[i]));
      }

      callback(null, users);
    });
  };

  self.update = function(query, changes, options, callback){
    db.users.update(query, changes, options, function(err, user){
      debugger;
      if(err){
        callback(err);
        return;
      }

      callback(null, true);
    });
  };

  self.save = function(user, callback){
    var data = dehydrateUser(user);

    if(typeof data.password !== 'undefined'){
      data.salt = bcrypt.genSaltSync(10);
      data.hash = generateHash(data.password, data.salt);

      delete data.password;
    }

    db.users.save(data, function(err, user){
      if(err){
        callback(err);
        return;
      }

      callback(null, self.buildUser(user));
    });
  };

  self.destroy = function(user, callback){
    db.users.remove(user, callback);
  };

  return self;
}();
