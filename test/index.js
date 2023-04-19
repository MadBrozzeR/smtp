const { TestSuit } = require('./suit/index.js');
const { Server } = require('../index.js');

const Events = {
  list: [],
  collect: function () {
    const data = this.list;
    this.list = [];

    return data;
  },
  put: function (event) {
    this.list.push(event);
  },
  /*
  last: function () {
    return this.list[this.list.length - 1];
  }
  */
  find: function (type) {
    for (let index = 0 ; index < this.list.length ; ++index) {
      if (this.list[index].type === type) {
        return this.list[index];
      }
    }

    return null;
  }
}

const server = Server({
  port: 7766,
  name: 'test.smtp.server',
  size: 64,
  timeout: 500,
}, {
  start: startTests,
  error: function (error) {
    console.log(error);
  },
  connect: function () {
    Events.put({ type: 's:connect', context: this });
    return true;
  },
  timeout: function () {
    Events.put({ type: 's:timeout', context: this });
    return true;
  },
  message: function (message) {
    Events.put({ type: 's:message', data: message, context: this });
    return true;
  },
  response: function (message) {
    Events.put({ type: 's:response', data: message, context: this });
    return true;
  },
  dataChunk: function (chunk) {
    Events.put({ type: 's:dataChunk', data: chunk, context: this });
    return true;
  }
}).start();

function startTests () {
  new TestSuit({ events: Events })
    .test({
      'SMTP': require('./smtp.js'),
    }).result(function (failed) {
      server.stop();

      if (failed) {
        process.exit(1);
      }
    });
}
