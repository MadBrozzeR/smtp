const common = require('./common.js');

module.exports = {
  init: function () {
    const {session, origin} = this.params;

    session.send('EHLO ' + origin);
  },

  data: common.data,
  error: common.error,
  success: common.success
};
