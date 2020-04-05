const Server = require('./server.js');

new Server({
  port: 2500,
  name: 'mbr.serv',
  size: 10,
  debug: function (type, message, session) {
    console.log(type, message, session.data);
  }
}, {
  connect: function (socket) {
    console.log('Connected:', this.id, this.data);
    this.success('Hello!!!');
  },

  helo: function (origin) {
    if (origin === 'forbidden') {
      this.failure(403, 'Your origin is forbidden');
    } else {
      this.success('Nice to meet you, ' + origin);
    }
  },

  from: function (from, size) {
    if (from === 'forbidden') {
      this.failure(403, 'This email is forbiden');
    } else {
      this.success('Done');
    }
  },

  to: function (recipient) {
    if (recipient === 'forbidden') {
      this.failure(412, 'Forbidden recipient');
    } else {
      this.success('This one is fine');
    }
  },

  mail: function (data) {
    if (data === 'forbiden') {
      this.failure(403, 'Forbidden data');
    } else {
      this.success('Yay!');
    }
  }
}).start();
