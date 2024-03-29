
/**
 * Module dependencies.
 */

var express = require('express')
  , fs = require('fs')
  , stylus = require('stylus');

var app = module.exports = express.createServer();

app.configure(function(){
  // Configuration
  function compile(str, path) {
    return stylus(str)
      .set('filename', path)
  };
  app.use(stylus.middleware({
    src: __dirname + '/public',
    compile: compile
  }));

  app.set('views', __dirname + '/app/views');
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
require('./config/routes')(app);

app.listen(app.settings['server-port']);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

exports.app = app;
