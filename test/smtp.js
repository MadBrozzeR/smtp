const { Client } = require('../index.js');
const Session = require('../server/session.js');

function checkEvent (suit, event, params) {
  const prefix = params.prefix || '';
  if (!event) {
    throw prefix + 'Event is missing';
  }
  (params.type !== undefined) && suit.equals(event.type, params.type, prefix + 'Wrong event type');
  (params.context !== undefined) && suit.instanceOf(event.context, params.context, prefix + 'Wrong event context');
  (params.data !== undefined) && suit.equals(
    event.data instanceof Buffer
      ? event.data.toString()
      : event.data,
    params.data instanceof Buffer
      ? params.data.toString()
      : params.data,
    prefix + 'Wrong event data'
  );
}

module.exports = {
  'should connect and disconnect by timeout': function (resolve, reject) {
    const Events = this.data.events;
    const suit = this.suit;

    new Client.Session().on({
      error: reject,
      close: function () {
        const events = Events.collect();

        checkEvent(suit, events[0], { type: 's:connect', context: Session, prefix: '[connect] ' });

        checkEvent(suit, events[1], {
          type: 's:response',
          context: Session,
          data: '220 test.smtp.server at your service',
          prefix: '[response] ',
        });

        checkEvent(suit, events[2], { type: 's:timeout', context: Session, prefix: '[timeout] ', });

        resolve();
      }
    }).connect('localhost', 7766)
      .catch(reject);
  },
  'should issue helo, rset, ehlo and quit commands': function (resolve, reject) {
    const Events = this.data.events;
    const suit = this.suit;
    const { equals } = suit;

    const session = new Client.Session().on({
      message: function (message) {
        Events.put({ type: 'c:message', data: message, context: this });
      },
      response: function (message) {
        Events.put({ type: 'c:response', data: message, context: this });
      },
      error: reject,
      close: function () {
        const events = Events.collect();

        checkEvent(suit, events[0], { type: 's:connect', context: Session, prefix: '[connect] ', });

        checkEvent(suit, events[1], {
          type: 's:response',
          context: Session,
          data: '220 test.smtp.server at your service',
          prefix: '[s:response] ',
        });

        checkEvent(suit, events[2], {
          type: 'c:response',
          context: Client.Session,
          data: '220 test.smtp.server at your service',
          prefix: '[c:response] ',
        });

        checkEvent(suit, events[3], {
          type: 'c:message',
          context: Session,
          data: 'HELO client.helo.origin',
          prefix: '[c:HELO] ',
        });

        checkEvent(suit, events[4], {
          type: 's:message',
          context: Client.Session,
          data: 'HELO client.helo.origin',
          prefix: '[s:HELO] ',
        });

        checkEvent(suit, events[5], {
          type: 's:response',
          context: Session,
          data: '250 test.smtp.server greets client.helo.origin',
          prefix: '[s:HELO response] ',
        });

        checkEvent(suit, events[6], {
          type: 'c:response',
          context: Session,
          data: '250 test.smtp.server greets client.helo.origin',
          prefix: '[c:HELO response] ',
        });

        checkEvent(suit, events[7], {
          type: 'c:message',
          context: Session,
          data: 'RSET',
          prefix: '[c:RSET] ',
        });

        checkEvent(suit, events[8], {
          type: 's:message',
          context: Session,
          data: 'RSET',
          prefix: '[s:RSET] ',
        });

        checkEvent(suit, events[9], {
          type: 's:response',
          context: Session,
          data: '250 OK',
          prefix: '[s:RSET response] ',
        });

        checkEvent(suit, events[10], {
          type: 'c:response',
          context: Client.Session,
          data: '250 OK',
          prefix: '[c:RSET response] ',
        });

        checkEvent(suit, events[11], {
          type: 'c:message',
          context: Session,
          data: 'EHLO client.ehlo.origin',
          prefix: '[c:EHLO] ',
        });

        checkEvent(suit, events[12], {
          type: 's:message',
          context: Session,
          data: 'EHLO client.ehlo.origin',
          prefix: '[s:EHLO] ',
        });

        checkEvent(suit, events[13], {
          type: 's:response',
          context: Session,
          data: '250-test.smtp.server greets client.ehlo.origin',
          prefix: '[s:EHLO response1] ',
        });

        checkEvent(suit, events[14], {
          type: 's:response',
          context: Session,
          data: '250-HELP',
          prefix: '[s:EHLO response2] ',
        });

        checkEvent(suit, events[15], {
          type: 's:response',
          context: Session,
          data: '250 SIZE 64',
          prefix: '[s:EHLO response3] ',
        });

        checkEvent(suit, events[16], {
          type: 'c:response',
          context: Client.Session,
          data: '250-test.smtp.server greets client.ehlo.origin\r\n250-HELP\r\n250 SIZE 64',
          prefix: '[c:EHLO response] ',
        });

        checkEvent(suit, events[17], {
          type: 'c:message',
          context: Client.Session,
          data: 'QUIT',
          prefix: '[c:QUIT] ',
        });

        checkEvent(suit, events[18], {
          type: 's:message',
          context: Session,
          data: 'QUIT',
          prefix: '[s:QUIT] ',
        });

        checkEvent(suit, events[19], {
          type: 's:response',
          context: Session,
          data: '221 Connection is being closed. Hope to see you next time',
          prefix: '[s:QUIT response] ',
        });

        checkEvent(suit, events[20], {
          type: 'c:response',
          context: Client.Session,
          data: '221 Connection is being closed. Hope to see you next time',
          prefix: '[c:QUIT response] ',
        });

        resolve();
      }
    });
    session.connect('localhost', 7766).then(function (message) {
      equals(message, '220 test.smtp.server at your service', 'Wrong connection message');
    }).catch(reject);

    session.helo('client.helo.origin').then(function (message) {
      const event = Events.find('s:message');
      equals(message, '250 test.smtp.server greets client.helo.origin', 'Wrong HELO response')
      equals(event.context.data.origin, 'client.helo.origin', 'Wrong origin in session data');
    }).catch(reject);

    session.rset().then(function (message) {
      const event = Events.find('s:message');
      equals(message, '250 OK', 'Wrong RSET response');
      equals(event.context.origin, undefined, 'Wrong origin in session data after reset');
    }).catch(reject);

    session.ehlo('client.ehlo.origin').then(function (message) {
      const event = Events.find('s:message');
      equals(message, '250-test.smtp.server greets client.ehlo.origin\r\n250-HELP\r\n250 SIZE 64', 'Wrong EHLO response');
      equals(event.context.data.origin, 'client.ehlo.origin', 'Wrong origin in session data');
    }).catch(reject);

    session.quit().then(function (message) {
      equals(message, '221 Connection is being closed. Hope to see you next time', 'Wrong QUIT message');
    }).catch(reject);
  },
  'should issue ehlo, mail, rcpt and data commands': function (resolve, reject) {
    const suit = this.suit;
    const Events = this.data.events;

    const session = new Client.Session().on({
      close: function () {
        const events = Events.collect();

        try {
          checkEvent(suit, events[0], { prefix: '[CONNECT] ', type: 's:connect' });
          checkEvent(suit, events[1], { prefix: '[CONNECT] ', type: 's:response', data: '220 test.smtp.server at your service' });
          checkEvent(suit, events[2], { prefix: '[EHLO] ', type: 's:message', data: 'EHLO me' });
          checkEvent(suit, events[3], { prefix: '[EHLO1] ', type: 's:response', data: '250-test.smtp.server greets me' });
          checkEvent(suit, events[4], { prefix: '[EHLO2] ', type: 's:response', data: '250-HELP' });
          checkEvent(suit, events[5], { prefix: '[EHLO3] ', type: 's:response', data: '250 SIZE 64' });
          checkEvent(suit, events[6], { prefix: '[MAIL1] ', type: 's:message', data: 'MAIL FROM:<sender@sender.me> SIZE=65' });
          checkEvent(suit, events[7], { prefix: '[MAIL1] ', type: 's:response', data: '552 Message exceeded maximum message size' });
          checkEvent(suit, events[8], { prefix: '[MAIL2] ', type: 's:message', data: 'MAIL FROM:<sender@sender.me> SIZE=64' });
          checkEvent(suit, events[9], { prefix: '[MAIL2] ', type: 's:response', data: '250 OK' });
          checkEvent(suit, events[10], { prefix: '[RCPT1] ', type: 's:message', data: 'RCPT TO:<recipient1@recipient.me>' });
          checkEvent(suit, events[11], { prefix: '[RCPT1] ', type: 's:response', data: '250 OK' });
          checkEvent(suit, events[12], { prefix: '[RCPT2] ', type: 's:message', data: 'RCPT TO:<recipient2@recipient.me>' });
          checkEvent(suit, events[13], { prefix: '[RCPT2] ', type: 's:response', data: '250 OK' });
          checkEvent(suit, events[14], { prefix: '[DATA] ', type: 's:message', data: 'DATA' });
          checkEvent(suit, events[15], { prefix: '[DATA] ', type: 's:response', data: '354 Ready to take your message. Type single dot (.) as a separate line to indicate the end of your message' });
          checkEvent(suit, events[16], { prefix: '[DATACHUNK] ', type: 's:dataChunk', data: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\r\n' });
          checkEvent(suit, events[17], { prefix: '[DATACHUNK] ', type: 's:response', data: '552 Message exceeded maximum message size' });
          checkEvent(suit, events[18], { prefix: '[DATA2] ', type: 's:message', data: 'DATA' });
          checkEvent(suit, events[19], { prefix: '[DATA2] ', type: 's:response', data: '354 Ready to take your message. Type single dot (.) as a separate line to indicate the end of your message' });
          checkEvent(suit, events[20], { prefix: '[DATACHUNK2] ', type: 's:dataChunk', data: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\r\n.\r\n' });
          checkEvent(suit, events[21], { prefix: '[DATACHUNK2] ', type: 's:response', data: '250 OK' });
          checkEvent(suit, events[22], { prefix: '[QUIT] ', type: 's:message', data: 'QUIT' });
          checkEvent(suit, events[23], { prefix: '[QUIT] ', type: 's:response', data: '221 Connection is being closed. Hope to see you next time' });

          suit.fieldsEqual(events[23].context.data, {
            origin: 'me',
            from: 'sender@sender.me',
            recipients: ['recipient1@recipient.me', 'recipient2@recipient.me'],
            message: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\r\n',
            received: true,
            size: 64,
          }, 'Wrong ${field} field');

          resolve();
        } catch (error) {
          reject(error);
        }
      },
    });
    session.connect('localhost', 7766);

    session.ehlo('me').catch(reject);
    session.mail('sender@sender.me', 65).then(function (message) {
      reject('must be rejected by size limit');
    }).catch(function (error) {
      suit.equals(error.message, '552 Message exceeded maximum message size', 'Wrong error message');
    }).catch(reject);
    session.mail('sender@sender.me', 64).then(function (message) {
      suit.equals(message, '250 OK', 'Wrong MAIL response message');
    }).catch(reject);
    session.rcpt('recipient1@recipient.me').then(function (message) {
      suit.equals(message, '250 OK', 'Wrong RCPT response message');
    }).catch(reject);
    session.rcpt('recipient2@recipient.me').then(function (message) {
      suit.equals(message, '250 OK', 'Wrong RCPT response message');
    }).catch(reject);
    session.data('a'.repeat(65)).then(function () {
      reject('must be rejected by size limit');
    }).catch(function (error) {
      suit.equals(error.message, '552 Message exceeded maximum message size', 'Wrong error message')
    }).catch(reject);
    session.data('a'.repeat(59) + '\r\n.').then(function (message) {
      suit.equals(message, '250 OK', 'Wrong data response message');
    }).catch(reject);
    session.quit();
  }
};
