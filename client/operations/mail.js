const common = require('./common.js');

module.exports = {
  init: function () {
    const {session, from, size} = this.params;

    let command = 'MAIL FROM:<' + from + '>';
    if (size) {
      command += ' SIZE=' + size;
    }
    session.send(command);
  },

  data: common.data,
  error: common.error,
  success: common.success
};
