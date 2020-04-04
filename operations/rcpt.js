const TO_RE = /\bto:<(.*)>/i;
const {MESSAGE} = require('../constants.js');

const ERROR = {
  '501': MESSAGE.RCPT_WITHOUT_TO,
  '503': MESSAGE.MAIL_WITHOUT_FROM
}

const listeners = {
  init: function () {
    const {session, message} = this.params;

    if (session.data.from) {
      const regMatch = TO_RE.exec(message);

      if (regMatch) {
        this.params.recipient = regMatch[1];
        session.smtp.listeners.to instanceof Function
          ? session.smtp.listeners.to.call(session, recipient)
          : this.trigger('success');
      } else {
        // Deny if recipient has not been proveded.
        this.trigger('error', 501);
      }
    } else {
      // Deny if MAIL command has not been received.
      this.trigger('error', 503);
    }
  },

  error: function (code) {
    this.params.session.send(code, ERROR[code]);
    this.next();
  },

  success: function (message) {
    const {session, recipient} = this.params;

    session.data.recipients.push(recipient);
    this.next();
  }
};

const help = {
  syntax: 'RCPT TO:<{address}>',
  desc: 'Mail recipient.',
  example: 'RCPT TO:<example@example.com>'
};

module.exports = {listeners, help};
