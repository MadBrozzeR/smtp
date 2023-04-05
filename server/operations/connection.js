const {useTemplate} = require('../../utils.js');
const {MESSAGE} = require('../../constants.js');

const listeners = {
  init: function () {
    const session = this.params.session;

    session.smtp.emit(session, 'connect', session.socket) && this.queue.trigger('success');
  },

  success: function (message) {
    const session = this.params.session;
    message || (message = useTemplate(MESSAGE.GREETING, session.smtp.config));
    session.send(220, message);
    this.queue.next();
  }
};

module.exports = {listeners};
