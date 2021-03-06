// TODO Make an actual tests
// const {test} = require('mbr-test');
const {Server, Client} = require('./index.js');

new Server({
  port: 2500,
  name: 'mbr.serv',
  size: 10,
  debug: function (type, message, session) {
    console.log(type, message, session.data);
  }
}).on({
  disconnect: function () {
    this.smtp.stop();
  },

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

  mail: function (from, size) {
    if (from === 'forbidden') {
      this.failure(403, 'This email is forbiden');
    } else {
      this.success('Done');
    }
  },

  rcpt: function (recipient) {
    if (recipient === 'forbidden') {
      this.failure(412, 'Forbidden recipient');
    } else {
      this.success('This one is fine');
    }
  },

  data: function (data) {
    if (data === 'forbiden') {
      this.failure(403, 'Forbidden data');
    } else {
      this.success('Yay!');
    }
  },

  start: function () {
    /*
    const connection = new Client.Connection('localhost', 2500);

    connection
      .mail('asd')
      .helo('my.origin')
      .mail('forbidden')
      .rcpt('asd@asd.d')
      .mail('allowed')
      .rcpt('forbidden')
      .rcpt('allowed')
      .data('Hello world!\r\n.')
      .data('Hello\r\n.')
      .quit();
    */

    Client.send({
      origin: 'my.domain',
      from: 'allowed',
      to: ['forbidden'],
      host: 'localhost',
      port: 2500,
      onWarning: function (warning) {
        console.log(this.recipient, warning);
      }
    }, 'Hello\r\n.', function (error, message) {
      console.log(error, message);
    });
  }
}).start();
