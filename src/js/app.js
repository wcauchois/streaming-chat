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
chatModel.on('item', function(item) {
  console.log(item);
});

var ChatList = React.createClass({
  componentDidUpdate: function() {
    var node = this.getDOMNode();
    var messageList = node.querySelector('.message-list');
    messageList.scrollTop = messageList.scrollHeight;
  },

  render: function() {
    return (
      <div>
        <div className="row" style={{"margin-top": "10%"}}>
          <ul className="message-list">
            {this.props.lines.map(function(line) {
              return (
                <li key={line.__id}>
                  <span className="nick">{line.nick || 'unknown'}:</span>
                  {"\u00a0"}
                  <span className="message">{line.message || ''}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <InputSection sendMessage={this.props.sendMessage} />
      </div>
    );
  }
});

var InputSection = React.createClass({
  getInitialState: function() {
    return {
      value: '',
      nickValue: window.localStorage.getItem('nickname') || ''
    };
  },

  handleNickChange: function(event) {
    this.setState({nickValue: event.target.value});
    window.localStorage.setItem('nickname', event.target.value);
  },

  handleChange: function(event) {
    this.setState({value: event.target.value});
  },

  doSend: function() {
    this.props.sendMessage({
      message: this.state.value,
      nick: this.state.nickValue
    });
    this.setState({value: ''});
  },

  handleKeyDown: function(event) {
    if (event.key === 'Enter') {
      this.doSend();
    }
  },

  render: function() {
    return (
      <div className="row">
        <div className="two columns">
          <input className="u-full-width" type="text" value={this.state.nickValue}
            onChange={this.handleNickChange} placeholder="Nickname" />
        </div>
        <div className="eight columns">
          <input className="u-full-width" type="text" value={this.state.value}
            onChange={this.handleChange} onKeyPress={this.handleKeyDown} />
        </div>
        <div className="two columns">
          <button className="button-primary" onClick={this.doSend}>Send</button>
        </div>
      </div>
    );
  }
});

function sendMessage(message) {
  chatModel.push(message);
}
window.sendMessage = sendMessage;

var allMessages = [];
function renderMessages() {
  React.render(
    <ChatList lines={allMessages} sendMessage={sendMessage} />,
    document.getElementById('container')
  );
}
renderMessages();
chatModel.on('item', function(message) {
  allMessages.push(message);
  renderMessages();
});


