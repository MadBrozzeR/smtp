const {replaceDDot, checkSize} = require('../utils.js');
const {MESSAGE} = require('../constants.js');

const ERROR = {
  '503': MESSAGE.RCPT_WITHOUT_TO,
  '552': MESSAGE.MAIL_SIZE_EXCEEDED
};

const DATA_END_RE = /(^|\r\n)\.(?:\r|$)/;
const DDOT_RE = /(^|\r\n)\.\./g;

const listeners = {
  init: function () {
    const {session} = this.params;
    this.params.data = '';
    this.params.size = 0;

    if (session.recipients.length) {
      // Start.
      session.smtp.listeners.data instanceof Function
        ? session.smtp.listeners.data.call(session)
        : session.send(354, MESSAGE.DATA_INPUT);
    } else {
      // Deny if RCPT command has not been received.
      this.trigger('error', 503);
    }
  },

  continue: function (chunk) {
    const {session} = this.params;
    this.params.size += chunk.length;

    if (checkSize(this.params, session)) {
      const message = chunk.toString().trim();
      const messageEnd = DATA_END_RE.exec(message);

      if (messageEnd) {
        this.params.data += replaceDDot(message.substring(0, messageEnd.index));

        session.smtp.listeners.mail instanceof Function
          ? session.smtp.listeners.mail.call(session, this.params.data)
          : this.trigger('success')
      } else {
        this.params.data += replaceDDot(message);
      }
    } else {
      this.trigger('error', 552);
    }
  },

  error: function (code) {
    this.params.session.send(code, ERROR[code]);
    this.next();
  },

  success: function (message) {
    const {data, session} = this.params;

    session.data.message = data;
    session.ok(message);
    this.next();
  }
};

const help = {
  syntax: 'DATA',
  desc: 'Command determines start of the message itself. Every next message from client considered as part of a data, until single dot is been sent as a separate line. This dot means end of the data block.',
  example: 'DATA\r\nLine 1\r\nLine 2\r\n\.\r\n'
};

module.exports = {listeners, help};
