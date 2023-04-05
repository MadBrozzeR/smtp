const {getHelloMessage} = require('../../utils.js');
const helo = require('./helo.js');

const listeners = {
  init: helo.listeners.init,

  error: helo.listeners.error,

  success: function (message) {
    const {session, origin} = this.params;
    session.data.origin = origin;

    if (!message) {
      message = [
        getHelloMessage(session),
        'HELP'
      ];
      session.smtp.config.size && message.push('SIZE ' + session.smtp.config.size);
    }

    session.ok(message);
  }
};

const help = {
  syntax: 'EHLO {domain}',
  desc: 'Greetings command with ESMTP support. Use `domain` as an argument to introduce your server.',
  example: 'EHLO example.com'
};

module.exports = {listeners, help};
