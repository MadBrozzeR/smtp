const {MESSAGE} = require('../../constants.js');

const FROM_RE = /\bfrom:<(.*)>/i;
const SIZE_RE = /\bsize=(\d+)/i;

const ERROR = {
  '501': MESSAGE.MAIL_WITHOUT_FROM,
  '503': MESSAGE.ORIGIN_NOT_SET,
  '552': MESSAGE.MAIL_SIZE_EXCEEDED
}

const listeners = {
  init: function () {
    const {session, message} = this.params;
    let error;
    let regMatch;

    if (session.data.origin) {
      if (regMatch = FROM_RE.exec(message)) {
        this.params.from = regMatch[1];

        if (regMatch = SIZE_RE.exec(message)) {
          this.params.size = parseInt(regMatch[1], 10);

          if (session.smtp.config.size && this.params.size > session.smtp.config.size) {
            // Message size exceeds maximum mail size
            error = 552;
          }
        }
      } else {
        // No sender address provided
        error = 501;
      }

    } else {
      // No origin provided yet
      error = 503;
    }

    if (error) {
      this.queue.trigger('error', error);
    } else {
      session.smtp.emit(session, 'mail', {
        from: this.params.from,
        size: this.params.size,
      }) && this.queue.trigger('success');
    }
  },

  error: function (code) {
    this.params.session.send(code, ERROR[code]);
    this.queue.next();
  },

  success: function (message) {
    const {session, from, size} = this.params;
    session.data.from = from;
    size && (session.data.size = size);

    session.ok(message);
  }
};

const help = {
  syntax: 'MAIL FROM:<[address]> [SIZE=N]',
  desc: 'Sender address to send error messages. `address` can be empty to avoid this behavior, but argument FROM:<> still need to be provided.',
  example: 'MAIL FROM:<example@example.com>'
};

module.exports = {listeners, help};
