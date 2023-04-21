const Queue = require('mbr-queue').NetQueue;
const net = require('net');
const operations = require('./operations/index.js');
const {generateString, parseResponse} = require('../utils.js');

const CRLF = '\r\n';

function Session () {
  if (this.constructor !== Session) {
    return new Session();
  }

  const queue = this.queue = new Queue();
  this.id = generateString();
  this.socket = new net.Socket();
  this.listeners = {};
  this.transmittingData = false;

  const session = this;

  this.socket
    .on('data', function (chunk) {
      const data = parseResponse(chunk);
      session.emit(session, 'response', data.message);
      queue.trigger('data', data);
    })
    .on('connect', function () {
      queue.trigger('connect');
    })
    .on('error', function (error) {
      queue.trigger('continue', error);
    })
    .on('close', function () {
      session.emit(session, 'close');
    });
}
Session.prototype.connect = function (host, port = 25) {
  const session = this;

  return new Promise(function (resolve, reject) {
    session.queue.push(operations.connect, {
      name: 'CONNECT',
      session: session,
      host: host,
      port: port,
      resolve: resolve,
      reject: reject,
    });
  });
}
Session.prototype.on = function (listeners) {
  listeners && (this.listeners = listeners);

  return this;
}
Session.prototype.send = function (data) {
  try {
    const eventType = this.transmittingData
      ? 'dataChunk'
      : 'message';

    this.emit(this, eventType, data);
    this.socket.write(data + CRLF);
  } catch (error) {
    this.listeners.error instanceof Function && this.listeners.error.call({session: this}, error);
  }
}
Session.prototype.close = function () {
  try {
    this.socket.end();
  } catch (error) {
    this.listeners.error instanceof Function && this.listeners.error.call({session: this}, error);
  }
}

Session.prototype.helo = function (origin) {
  const session = this;

  return new Promise(function (resolve, reject) {
    session.queue.push(operations.helo, {
      name: 'HELO',
      session: session,
      origin: origin,
      resolve: resolve,
      reject: reject,
    });
  });
}
Session.prototype.ehlo = function (origin) {
  const session = this;

  return new Promise(function (resolve, reject) {
    session.queue.push(operations.ehlo, {
      name: 'EHLO',
      session: session,
      origin: origin,
      resolve: resolve,
      reject: reject,
    });
  });
}
Session.prototype.mail = function (from, size) {
  const session = this;

  return new Promise(function (resolve, reject) {
    session.queue.push(operations.mail, {
      name: 'MAIL',
      session: session,
      from: from,
      size: size,
      resolve: resolve,
      reject: reject,
    });
  });
}
Session.prototype.rcpt = function (recipient) {
  const session = this;

  return new Promise(function (resolve, reject) {
    session.queue.push(operations.rcpt, {
      name: 'RCPT',
      session: session,
      recipient: recipient,
      resolve: resolve,
      reject: reject,
    });
  });
}
Session.prototype.data = function (data) {
  const session = this;

  return new Promise(function (resolve, reject) {
    session.queue.push(operations.data, {
      name: 'DATA',
      session: session,
      data: data,
      resolve: resolve,
      reject: reject,
    });
  });
}
Session.prototype.quit = function () {
  const session = this;

  return new Promise(function (resolve, reject) {
    session.queue.push(operations.quit, {
      name: 'QUIT',
      session: session,
      resolve: resolve,
      reject: reject,
    });
  });
}
Session.prototype.rset = function () {
  const session = this;

  return new Promise(function (resolve, reject) {
    session.queue.push(operations.rset, {
      name: 'RSET',
      session: session,
      resolve: resolve,
      reject: reject,
    });
  });
}
Session.prototype.emit = function (context, type, param) {
  try {
    if (this.listeners[type] instanceof Function) {
      return this.listeners[type].call(context, param);
    }

    return true;
  } catch (error) {
    if (type !== 'error') {
      return this.emit(context, 'error', error);
    }
  }
}

module.exports = Session;
