const {MESSAGE} = require('../../constants.js');

const TO_RE = /\bto:<(.*)>/i;

const ERROR = {
  '501': MESSAGE.RCPT_WITHOUT_TO,
  '503': MESSAGE.MAIL_WITHOUT_FROM
}

const listeners = {
  init: function () {
    const {session, message} = this.params;

    if (session.data.from === undefined) {
      // Deny if MAIL command has not been received.
      this.queue.trigger('error', 503);
    } else {
      const regMatch = TO_RE.exec(message);

      if (regMatch) {
        this.params.recipient = regMatch[1];
        session.smtp.listeners.rcpt instanceof Function
          ? session.smtp.listeners.rcpt.call(session, regMatch[1])
          : this.queue.trigger('success');
      } else {
        // Deny if recipient has not been proveded.
        this.queue.trigger('error', 501);
      }
    }
  },

  error: function (code) {
    this.params.session.send(code, ERROR[code]);
    this.queue.next();
  },

  success: function (message) {
    const {session, recipient} = this.params;

    session.data.recipients.push(recipient);
    session.ok(message);
    this.queue.next();
  }
};

const help = {
  syntax: 'RCPT TO:<{address}>',
  desc: 'Mail recipient.',
  example: 'RCPT TO:<example@example.com>'
};

module.exports = {listeners, help};
