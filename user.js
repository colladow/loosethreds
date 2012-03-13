var mongo = require('mongojs'),
    bcrypt = require('bcrypt');

module.exports = function(){
  var self = {},
      db = mongo.connect('loosethreds', ['users']),
      buildUser = function(user){
        var user = user[0];

        user.save = function(callback){
          self.save(user, callback);
        };

        user.setPassword = function(password, callback){
          user.salt = bcrypt.genSaltSync(10);
          user.hash = bcrypt.hashSync(password, user.salt);

          user.save(callback);
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

      callback(null, buildUser(user));
    });
  };

  self.where = function(query, callback){
    db.users.find(query, callback);
  };

  self.save = function(user, callback){
    var data = {};

    for(field in user){
      if(user.hasOwnProperty(field) && typeof user[field] !== 'function'){
        data[field] = user[field]
      }
    }

    db.users.save(data, callback);
  };

  return self;
}();
