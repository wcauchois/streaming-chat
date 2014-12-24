var express = require('express'),
    morgan = require('morgan'),
    config = require('config'),
    path = require('path'),
    jade = require('jade'),
    util = require('util'),
    WebSocketServer = require('ws').Server,
    websocket = require('websocket-stream'),
    _ = require('underscore'),
    AppendOnly = require('append-only'),
    http = require('http'),
    MuxDemux = require('mux-demux'),
    dnode = require('dnode');

function detectDebug() {
  return process.env.NODE_ENV !== 'production';
}

var app = express();

app.use(morgan('common'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'build')));

app.engine('jade', jade.__express);

app.get('/', function(req, res) {
  res.render('index.jade', {debugMode: detectDebug()});
});

var server = http.createServer(app);
server.listen(config.port, function() {
  util.log('Listening on port ' + config.port);
});

var chatModel = AppendOnly();
chatModel.on('item', function(item) {
  util.log('Got chat item: ' + JSON.stringify(item));
});

var rpcs = {
  testRpc: function() {
    util.log("Got a call to testRpc");
  }
};

var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
  util.log('Connected WebSocket');
  var websocketStream = websocket(ws);
  var modelStream, rpcStream, mx;

  websocketStream.pipe(mx = MuxDemux(function(stream) {
    if (stream.meta === 'model') {
      modelStream = chatModel.createStream();
      stream.pipe(modelStream).pipe(stream);
    } else if (stream.meta === 'rpc') {
      rpcStream = dnode(rpcs);
      stream.pipe(rpcStream).pipe(stream);
    }
  })).pipe(websocketStream);

  ws.on('close', function() {
    util.log('Disconnected WebSocket');
  });
});

