const dns = require('dns');
const {mxSorter, mxMapper} = require('../../utils.js');
const common = require('./common.js');

module.exports = {
  init: function () {
    const queue = this.queue;
    const params = this.params;
    const data = this.data = { current: 0 };

    if (params.host === 'localhost') {
      params.servers = ['localhost'];

      queue.trigger('continue');
    } else {
      dns.resolveMx(params.host, function (error, servers) {
        if (error) {
          queue.trigger('error', error);
        } else {
          params.servers = servers.sort(mxSorter).map(mxMapper);

          queue.trigger('continue');
        }
      });
    }
  },

  continue: function (error) {
    const {session, servers, port} = this.params;
    const server = servers && servers[this.data.current++];
    this.data.server = server;

    if (server) {
      session.socket.connect(port, server);
    } else {
      this.queue.trigger('error', error);
    }
  },

  connect: function () {
    const {session, servers} = this.params;
    session.server = this.data.server;
  },

  data: common.data,

  error: function (error) {
    const {session} = this.params;

    session.emit(session, 'error', error);

    this.queue.next();
  },

  success: function (message) {
    const { session, resolve } = this.params;

    session.emit(session, 'connect', session.server);
    resolve(message);

    this.queue.next();
  }
}
