const {getHelloMessage} = require('../utils.js');
const {MESSAGE} = require('../constants.js');

const ERROR = {
  '501': MESSAGE[501]
}

const listeners = {
  init: function () {
    const session = this.params.session;
    const args = this.params.args;
    session.isDataReceived = false;

    if (args[0]) {
      this.params.origin = args[0];
      session.smtp.listeners.helo instanceof Function
        ? session.smtp.listeners.helo.call(session, args[0])
        : this.trigger('success');
    } else {
      this.trigger('error', 501);
    }
  },

  error: function (code) {
    this.params.session.send(code, ERROR[code]);
    this.next();
  },

  success: function (message) {
    const {session, origin} = this.params;
    session.data.origin = origin;

    message || (message = getHelloMessage(session));

    session.ok(message);
    this.next();
  }
};

const help = {
  syntax: 'HELO {domain}',
  desc: 'Greetings command. Use `domain` as an argument to introduce your server.',
  example: 'HELO example.com'
};

module.exports = {listeners, help};
