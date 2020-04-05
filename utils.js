const {MESSAGE} = require('./constants.js');

const KEY = /\{\{(\w+)\}\}/g;

function useTemplate (template, substitutions) {
  return template.replace(KEY, function (original, key) {
    return substitutions[key] || original;
  });
}

function SMTPError (code, message) {
  Error.prototype.constructor.call(this);
  this.code = code;
  this.message = message;
}
SMTPError.prototype = Object.create(Error.prototype);
SMTPError.prototype.constructor = SMTPError;

module.exports.SMTPError = SMTPError;

function getHelloMessage (session) {
  return useTemplate(MESSAGE.GREETS, {name: session.smtp.config.name, domain: session.data.origin});
}

function checkSize (params, session) {
  return !(session.smtp.config.size && session.smtp.config.size < params.size);
}

const DDOT_RE = /(^|\r\n)\.\./g;

function replaceDDot (message) {
  return message.replace(DDOT_RE, '$1.');
}

const SYMBOLS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateString (length = 20, symbols = SYMBOLS) {
  let result = '';

  while (length--) {
    result += symbols[Math.floor(Math.random() * symbols.length)];
  }

  return result;
}

module.exports = {
  useTemplate,
  getHelloMessage,
  replaceDDot,
  checkSize,
  generateString
};
