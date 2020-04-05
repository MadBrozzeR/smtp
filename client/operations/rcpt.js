const common = require('./common.js');

module.exports = {
  init: function () {
    const {session, recipient} = this.params;

    session.send('RCPT TO:<' + recipient + '>');
  },

  data: common.data,
  error: common.error,
  success: common.success
};
