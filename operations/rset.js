const listeners = {
  init: function () {
    this.params.session.initialize();
    this.params.session.ok();
    this.next();
  }
};

const help = {
  syntax: 'RSET',
  desc: 'Clear all data sent before this command. All procedure should be started from greetings (EHLO | HELO)'
};

module.exports = {listeners, help};
