const Queue = require('mbr-queue').NetQueue;
const net = require('net');
const operations = require('./operations/index.js');
const {parseResponse} = require('./utils.js');
const {generateString} = require('../utils.js');

const CRLF = '\r\n';

function Connection (host, port = 25) {
  const queue = this.queue = new Queue();
  this.id = generateString();
  this.socket = new net.Socket();
  this.listeners = {};

  this.socket
    .on('data', function (chunk) {
      queue.trigger('data', parseResponse(chunk));
    })
    .on('connect', function () {
      queue.trigger('success');
    })
    .on('error', function (error) {
      queue.trigger('continue', error);
    });

  this.queue.push(operations.connect, {
    name: 'CONNECT',
    session: this,
    host: host,
    port: port
  });
}
Connection.prototype.on = function (listeners) {
  listeners && (this.listeners = listeners);

  return this;
}
Connection.prototype.send = function (data) {
  this.socket.write(data + CRLF);
}

Connection.prototype.helo = function (origin, callback) {
  this.queue.push(operations.helo, {
    name: 'HELO',
    session: this,
    origin: origin,
    callback: callback
  });

  return this;
}
Connection.prototype.mail = function (from, size, callback) {
  this.queue.push(operations.mail, {
    name: 'MAIL',
    session: this,
    from: from,
    size: size,
    callback: callback
  });

  return this;
}
Connection.prototype.rcpt = function (recipint, callback) {
  this.queue.push(operations.rcpt, {
    name: 'RCPT',
    session: this,
    recipint: recipint,
    callback: callback
  });

  return this;
}
Connection.prototype.data = function (data, callback) {
  this.queue.push(operations.data, {
    name: 'DATA',
    session: this,
    data: data,
    callback: callback
  });

  return this;
}
Connection.prototype.quit = function (callback) {
  this.queue.push({
    name: 'QUIT',
    session: this,
    callback: callback
  });

  return this;
}
Connection.prototype.rset = function (callback) {
  this.queue.push({
    name: 'RSET',
    session: this,
    callback: callback
  });

  return this;
}

module.exports = Connection;
