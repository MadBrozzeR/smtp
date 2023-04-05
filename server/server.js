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
    smtp.emit(session, 'disconnect', socket);
  });
  socket.on('error', function (error) {
    smtp.emit(session, 'error', error);
  });

  session.connection();
}

function Server (config = {}, listeners = {}) {
  if (this.constructor !== Server) {
    return new Server(config, listeners);
  }

  this.config = Object.assign({}, DEFAULT_CONFIG, config);
  this.server = net.createServer(connectionListener.bind(this));
  this.listeners = listeners;

  const smtp = this;

  this.server.on('close', function () {
    smtp.emit(smtp, 'stop');
  });
  this.server.on('error', function (error) {
    smtp.emit(smtp, 'error', error);
  });
}
Server.prototype.on = function (listeners = {}) {
  if (listeners instanceof Function) {
    this.listeners = listeners;
  } else {
    this.listeners = Object.assign({}, this.listeners, listeners);
  }

  return this;
}
Server.prototype.start = function () {
  const server = this;

  this.server.listen(this.config.port, this.config.host, function () {
    server.emit(server, 'start');
  });

  return this;
}
Server.prototype.stop = function () {
  this.server.close();
  return this;
}
Server.prototype.emit = function (context, type, param) {
  if (this.listeners instanceof Function) {
    return this.listeners.call(context, type, param);
  }

  if (this.listeners[type] instanceof Function) {
    return this.listeners[type].call(context, param);
  }

  return true;
}

module.exports = Server;
