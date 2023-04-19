const Session = require('./session.js');

const DOT_RE = /(^|\n)\.([^\r\n])/g;

function prepare (data) {
  return data.replace(DOT_RE, '$1..$2') + '\r\n.';
}

module.exports = {
  prepare,
  Session,
};
