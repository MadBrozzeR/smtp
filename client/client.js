const Session = require('./session.js');

const DOT_RE = /(^|\n)\.([^\r\n])/g;

function prepare (data) {
  return data.replace(DOT_RE, '$1..$2') + '\r\n.';
}

function useCallback (context, callback, error, data) {
  if (callback instanceof Function) {
    callback.call(context, error, data);
  }
}

function send (params, data) {
  const origin = params.origin;
  const recipients = params.to;
  const from = params.from || '';
  const host = params.host;
  const port = params.port;
  const onWarning = params.onWarning instanceof Function ? params.onWarning : null;
  const callback = params.callback;

  const isValid = !!(
    params.origin &&
    params.to instanceof Array && params.to.length &&
    data &&
    host
  );

  if (!isValid) {
    return Promise.reject(new Error('`origin`, `to`, `data` and `host` parameters and at least one recipient are required'));
  }

  const session = new Session().on({
    error: function (error) {
      switch (this.name) {
        case undefined:
          useCallback(this, callback, error);
          break;

        case 'QUIT':
          useCallback(this, callback, error);
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
  });

  return session.connect(host, port)
    .then(function () {
      return session.ehlo(origin);
    })
    .then(function () {
      return session.mail(from, Buffer.byteLength(data));
    })
    .then(function () {
      for (let index = 0 ; index < recipients.length ; ++index) {
        session.rcpt(recipients[index]);
      }
    })
    .then(function () {
      return session.data(data);
    })
    .then(function () {
      return session.quit();
    });
}

module.exports = {
  prepare,
  Session,
  send
};
