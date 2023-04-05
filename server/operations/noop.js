const listeners = {
  init: function () {
    this.params.session.ok();
  }
};

const help = {
  syntax: 'NOOP [...arguments]',
  desc: 'Empty command. Server responses with OK message, but no action perfomed.'
};

module.exports = {listeners, help};
