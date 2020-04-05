const common = require('./common.js');

module.exports = {
  init: function () {
    const {session} = this.params;

    session.send('RSET');
  },

  data: common.data,
  error: common.error,
  success: common.success
};
