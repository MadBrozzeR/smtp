const {MESSAGE, DEBUG_STATE} = require('../../constants.js');
const {COMMANDS} = require('./index.js');

const ERROR = {
  '500': MESSAGE.UNKNOWN_COMMAND
};

const listeners = {
  init: function () {
    const { session, data } = this.params;
    const message = this.params.message = data.toString().trim();

    session.debug(DEBUG_STATE.CLIENT, message);

    session.smtp.listeners.message instanceof Function
      ? session.smtp.listeners.message.call(session, message)
      : this.queue.trigger('success');
  },

  success: function () {
    const {session, message} = this.params;
    const args = message.split(' ');
    const command = args.shift().toUpperCase();

    if (COMMANDS[command]) {
      session.queue.push(COMMANDS[command].listeners, {session, args, message});
      this.queue.next();
    } else {
      this.queue.trigger('error', 500);
    }
  },

  error: function (code) {
    this.params.session.send(code, ERROR[code]);
    this.queue.next();
  }
};

module.exports = {listeners};
