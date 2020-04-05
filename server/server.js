const net = require('net');
const Session = require('./session.js');

const DEFAULT_CONFIG = {
  port: 25,
  host: '0.0.0.0',
  name: 'example.domain',
  timeout: 0,
  size: 30 * 1024 * 1024,
  debug: function () {}
};

function connectionListener (socket) {
  const smtp = this;
  const session = new Session(socket, this);

  socket.on('data', function (chunk) {
    session.onData(chunk);
  });
  socket.on('close', function () {
    (smtp.listeners.disconnect instanceof Function) && smtp.listeners.disconnect.call(session, socket);
  });
  socket.on('error', function (error) {
    (smtp.listeners.error instanceof Function) && smtp.listeners.error.call(session, error)
  });

  session.connection();
}

function Server (config = {}, listeners = {}) {
  this.config = Object.assign({}, DEFAULT_CONFIG, config);
  this.server = net.createServer(connectionListener.bind(this));
  this.listeners = listeners;
}
Server.prototype.start = function () {
  this.server.listen(this.config.port, this.config.host);
  return this;
}
Server.prototype.stop = function () {
  this.server.close();
  return this;
}

module.exports = Server;
