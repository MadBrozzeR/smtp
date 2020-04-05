module.exports.COMMANDS = {
  QUIT: require('./quit.js'),
  HELO: require('./helo.js'),
  EHLO: require('./ehlo.js'),
  MAIL: require('./mail.js'),
  RCPT: require('./rcpt.js'),
  DATA: require('./data.js'),
  NOOP: require('./noop.js'),
  HELP: require('./help.js'),
  RSET: require('./rset.js')
};

module.exports.Connection = require('./connection.js');
