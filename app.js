
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , fs = require('fs');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'adijd21ij212oe0d0wakdo;ja2j3u' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

  app.set('server-port', 80);
});

app.configure('development', function(){
  var hostname = require('os').hostname();

  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

  app.set('server-port', 3000);

  app.set('mongo-host', 'localhost');
  app.set('mongo-port', '27017');

  app.set('imagedir', __dirname + '/uploads');
  app.set('imagepath', 'http://' + hostname + ':' + app.settings['server-port']);

  app.use(express.static(app.settings.imagedir));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.dynamicHelpers({ messages: require('express-messages') });

// Routes

app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/authenticate', routes.authenticate);
app.get('/logout', routes.logout);
app.get('/register', routes.register);

app.get('/users', routes.users.index);
app.post('/users', routes.users.create);
app.get('/users/:id', routes.users.show);
app.put('/users/:id', routes.users.update);
app.delete('/users/:id', routes.users.delete);

app.post('/users/:id/images', routes.users.images.create);
app.delete('/users/:id/images/:imageid', routes.users.images.delete);

app.listen(app.settings['server-port']);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

exports.app = app;
