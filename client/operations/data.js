const common = require('./common.js');

const OK_CODE = '250';
const DATA_CODE = '354'

module.exports = {
  init: function () {
    const {session} = this.params;

    session.send('DATA');
  },

  data: function (response) {
    const {session, data} = this.params;

    if (response.isError) {
      this.queue.trigger('error', new Error(response.message));
    } else {
      const code = response.message.substring(0, 3);

      switch (code) {
        case DATA_CODE:
          session.send(data);
          break;
        case OK_CODE:
          this.queue.trigger('success', response.message);
          break;
        default:
          this.queue.trigger('error', new Error('Unexpected response: ' + response.message));
          break;
      }
    }
  },
  error: common.error,
  success: common.success
};
