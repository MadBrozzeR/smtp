const index = require('./index.js');
const {MESSAGE} = require('../../constants.js');

const listeners = {
  init: function () {
    const {session, args} = this.params;
    const commands = index.COMMANDS;

    if (args.length === 0) {
      session.send(211, Object.keys(commands));
      this.queue.next();
    } else {
      const command = args[0];
      if (commands[command]) {
        const help = commands[command].help;

        if (help) {
          const result = [
            help.syntax,
            help.desc
          ];
          help.example && result.push(help.example);
          this.queue.trigger('success', result);
        } else {
          this.queue.trigger('success', MESSAGE.NO_HELP);
        }
      } else {
        this.queue.trigger('success', MESSAGE.UNKNOWN_COMMAND);
      }
    }
  },

  success: function (message) {
    this.params.session.send(214, message);
    this.queue.next();
  }
};

const help = {
  syntax: 'HELP [command]',
  desc: 'This help system. Use `command` argument to see certain command description.',
  example: 'HELP DATA'
};

module.exports = {listeners, help};
