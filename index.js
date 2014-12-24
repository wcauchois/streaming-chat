var express = require('express'),
    morgan = require('morgan'),
    config = require('config'),
    path = require('path'),
    jade = require('jade'),
    util = require('util');

var app = express();

app.use(morgan('common'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'build')));

app.engine('jade', jade.__express);

app.get('/', function(req, res) {
  res.render('index.jade');
});

app.listen(config.port, function() {
  util.log('Listening on port ' + config.port);
});

