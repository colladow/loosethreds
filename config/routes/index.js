var home = require('../../app/controllers/home'),
    auth = require('../../app/controllers/auth'),
    users = require('../../app/controllers/users'),
    middleware = require('../../app/middleware');

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

  app.get('/users/:id/images/:imageid', users.images.show);
  app.post('/users/:id/images', middleware.auth.restrict, users.images.create);
  app.delete('/users/:id/images/:imageid', middleware.auth.restrict, users.images.delete);
};
