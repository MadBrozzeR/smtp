const dns = require('dns');
const {mxSorter, mxMapper} = require('../../utils.js');
const common = require('./common.js');

module.exports = {
  init: function () {
    const queue = this.queue;
    const params = this.params;

    if (params.host === 'localhost') {
      params.servers = ['localhost'];
      params.current = -1;

      queue.trigger('continue');
    } else {
      dns.resolveMX(params.host, function (error, servers) {
        if (error) {
          queue.trigger('error', error);
        } else {
          params.servers = servers.sort(mxSorter).map(mxMapper);
          params.current = -1;

          queue.trigger('continue');
        }
      });
    }
  },

  continue: function (error) {
    const {session, servers, port} = this.params;
    const server = servers && servers[++this.params.current];

    if (server) {
      session.socket.connect(port, server);
    } else {
      this.queue.trigger('error', error);
    }
  },

  connect: function () {
    const {session, servers, current} = this.params;
    session.server = servers[current];

    if (session.listeners.connect instanceof Function) {
      session.listeners.connect.call(session, session.server);
    }
  },

  data: common.data,

  error: function (error) {
    const {session} = this.params;

    if (session.listeners.error instanceof Function) {
      session.listeners.error.call(session, error);
    }

    this.queue.next();
  },

  success: function (response) {
    this.queue.next();
  }
}
