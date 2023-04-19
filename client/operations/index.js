module.exports = {
  connect: require('./connect.js'),
  helo: require('./helo.js'),
  ehlo: require('./ehlo.js'),
  mail: require('./mail.js'),
  rcpt: require('./rcpt.js'),
  data: require('./data.js'),
  quit: require('./quit.js'),
  rset: require('./rset.js')
};
