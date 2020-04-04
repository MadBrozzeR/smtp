const listeners = {
  init: function () {
    this.params.session.send(221);
    this.params.session.end();

    this.next();
  }
};

const help = {
  syntax: 'QUIT',
  desc: 'End of the session. Client wants to disconnect from server.'
};

module.exports = {listeners, help};
