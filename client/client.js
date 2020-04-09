const Connection = require('./connection.js');

const DOT_RE = /(^|\n)\.([^\r\n])/g;

function prepare (data) {
  return data.replace(DOT_RE, '$1..$2') + '\r\n.';
}

function useCallback (context, callback, error, data) {
  if (callback instanceof Function) {
    callback.call(context, error, data);
  }
}

function send (params, data, callback) {
  const origin = params.origin;
  const recipients = params.to;
  const from = params.from || '';
  const host = params.host;
  const port = params.port;
  const onWarning = params.onWarning instanceof Function ? params.onWarning : null;

  const isValid = !!(
    params.origin &&
    params.to instanceof Array && params.to.length &&
    data &&
    host
  );

  if (!isValid) {
    return;
  }

  const connection = new Connection(host, port).on({
    error: function (error) {
      switch (this.name) {
        case undefined:
          useCallback(this, callback, error);
          connection.queue.clear();
          break;

        case 'QUIT':
          useCallback(this, callback, error);
          connection.queue.clear();
          connection.close();
          break;

        case 'RCPT':
          onWarning && onWarning.call(this, error);
          break;

        default:
          useCallback(this, callback, error);
          connection.queue.clear();
          connection.quit();
          break;
      }
    },
    success: function (message) {
      if (this.name === 'DATA') {
        useCallback(connection, callback, null, message);
      }
    }
  })
    .helo(origin)
    .mail(from, Buffer.byteLength(data));

  for (let index = 0 ; index < recipients.length ; ++index) {
    connection.rcpt(recipients[index]);
  }

  connection.data(data).quit();
}

module.exports = {
  prepare,
  Connection,
  send
};
