const listeners = {
  init: function () {
    this.params.session.ok();
    this.queue.next();
  }
};

const help = {
  syntax: 'NOOP [...arguments]',
  desc: 'Empty command. Server responses with OK message, but no action perfomed.'
};

module.exports = {listeners, help};
