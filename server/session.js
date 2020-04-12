const Queue = require('mbr-queue').NetQueue;

const Message = require('./operations/message.js').listeners;
const {Connection} = require('./operations/index.js');
const {DEBUG_STATE, MESSAGE} = require('../constants.js');
const {generateString} = require('../utils.js');

const CRLF = '\r\n';

function Session (socket, smtp) {
  socket.setTimeout(smtp.config.timeout, function () {socket.end();});
  this.id = generateString();
  this.socket = socket;
  this.smtp = smtp;
  this.queue = new Queue();
  this.done = false;
  this.initialize();
}
Session.prototype.connection = function () {
  const session = this;

  session.queue.push(Connection.listeners, {session});

  return this;
}
Session.prototype.onData = function (chunk) {
  if (this.queue.isEmpty()) {
    this.queue.push(Message, {
      session: this,
      data: chunk
    });
  } else {
    this.debug(DEBUG_STATE.DATA, chunk);
    this.queue.trigger('continue', chunk);
  }

  return this;
}
Session.prototype.write = function (data) {
  if (this.done) {
    return;
  }

  this.debug(DEBUG_STATE.SERVER, data);
  this.socket.write(data + CRLF);
}
Session.prototype.send = function (code, message) {
  message || (message = MESSAGE[code] || MESSAGE.NOT_SET);

  if (message instanceof Array) {
    const lastLine = message.length - 1;

    for (let index = 0 ; index < message.length ; ++index) {
      this.write(code + (index < lastLine ? '-' : ' ') + message[index]);
    }
  } else {
    this.write(code + ' ' + message);
  }

  return this;
}
Session.prototype.ok = function (message) {
  this.send(250, message);

  return this;
}
Session.prototype.end = function () {
  this.done = true;
  this.socket.end();

  return this;
}
Session.prototype.success = function (message) {
  this.queue.trigger('success', message);

  return this;
}
Session.prototype.failure = function (code, message) {
  this.send(code, message);
  this.queue.next();

  return this;
}
Session.prototype.initialize = function () {
  this.data = {
    recipients: []
  };

  return this;
}
Session.prototype.debug = function (type, message) {
  const debug = this.smtp.config.debug;

  if (debug instanceof Function) {
    debug.call(this.smtp, type, message.toString(), this);
  }
}

module.exports = Session;
