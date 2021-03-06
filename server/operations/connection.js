const {useTemplate} = require('../../utils.js');
const {MESSAGE} = require('../../constants.js');

const listeners = {
  init: function () {
    const session = this.params.session;

    session.smtp.listeners.connect instanceof Function
      ? session.smtp.listeners.connect.call(session, session.socket)
      : this.queue.trigger('success');
  },

  success: function (message) {
    const session = this.params.session;
    message || (message = useTemplate(MESSAGE.GREETING, session.smtp.config));
    session.send(220, message);
    this.queue.next();
  }
};

module.exports = {listeners};
