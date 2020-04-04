module.exports = {
  DEBUG_STATE: {
    CLIENT: 'CLIENT',
    SERVER: 'SERVER',
    DATA: 'DATA'
  },

  MESSAGE: {
    '221': 'Connection is being closed. Hope to see you next time',
    '250': 'OK',
    '450': 'Mailbox unavailable',
    '550': 'Mailbox unavailable',
    '554': 'Transaction failed',
    '501': 'Introduce yourself, please (EHLO example.com)',

    DATA_INPUT: 'Ready to take your message. Type single dot (.) as a separate line to indicate the end of your message',
    MAIL_WITHOUT_FROM: 'Provide back address, please (MAIL FROM:<example@example.com> | MAIL FROM:<>)',
    MAIL_SIZE_EXCEEDED: 'Message exceeds maximum message size',
    ORIGIN_NOT_SET: 'Introduce yourself, please (EHLO example.com)',
    RCPT_WITHOUT_TO: 'Provide recipient address, please (RCPT TO:<example@example.com>)',
    MAIL_SIZE_EXCEEDED: 'Message exceeded maximum message size',
    UNKNOWN_COMMAND: 'Unknown command. Type HELP to see all available commands',
    GREETING: '{{name}} at your service',
    GREETS: '{{name}} greets {{domain}}',
    NOT_SET: 'Message not set',
    NO_HELP: 'No description available'
  }
};

