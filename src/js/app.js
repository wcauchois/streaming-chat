var AppendOnly = require('append-only'),
    websocket = require('websocket-stream'),
    MuxDemux = require('mux-demux'),
    dnode = require('dnode');

var chatModel = AppendOnly();
var websocketPath = 'ws' + (location.protocol === 'https:' ? 's' : '') + '://' +
  location.hostname + (location.port ? (':' + location.port) : '');
var ws = websocket(websocketPath);

var mx = MuxDemux();
ws.pipe(mx).pipe(ws);

var modelStream = mx.createStream('model');
modelStream.pipe(chatModel.createStream()).pipe(modelStream);

var d = dnode();
d.on('remote', function(remote) {
  window.remote = remote;
});

var rpcStream = mx.createStream('rpc');
rpcStream.pipe(d).pipe(rpcStream);

window.chatModel = chatModel;

var HelloMessage = React.createClass({
  render: function() {
    return <div>Hello {this.props.name}</div>;
  }
});

React.render(<HelloMessage name="Bill" />, document.getElementById('container'));
