var home = require('../../app/controllers/home'),
    auth = require('../../app/controllers/auth'),
    users = require('../../app/controllers/users');

module.exports = function(app){
  app.get('/', home.index);

  // auth
  app.get('/login', auth.login);
  app.post('/authenticate', auth.authenticate);
  app.get('/logout', auth.logout);
  app.get('/register', auth.register);

  // users
  app.get('/users', users.index);
  app.post('/users', users.create);
  app.get('/users/:id', users.show);
  app.put('/users/:id', users.update);
  app.delete('/users/:id', users.delete);

  app.post('/users/:id/images', users.images.create);
  app.delete('/users/:id/images/:imageid', users.images.delete);

  app.post('/users/:id/urls', users.urls.create);
  app.delete('/users/:id/urls/:urlid', users.urls.delete);
};
