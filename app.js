
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
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('mongo-host', 'localhost');
  app.set('mongo-port', '27017');
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/register', routes.register);

app.get('/users', routes.users.index);
app.post('/users', routes.users.create);
app.get('/users/:id', routes.users.view);
app.put('/users/:id', routes.users.update);
app.delete('/users/:id', routes.users.delete);

//app.post('/upload', function(req, res){
//  fs.readFile(req.files.newImage.path, function (err, data) {
//    var newPath = __dirname + '/public/uploads/' + req.files.newImage.name;
//    fs.writeFile(newPath, data, function (err) {
//      res.redirect("back");
//    });
//  });
//});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
