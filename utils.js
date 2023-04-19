const {MESSAGE} = require('./constants.js');

const KEY = /\{\{(\w+)\}\}/g;

function useTemplate (template, substitutions) {
  return template.replace(KEY, function (original, key) {
    return substitutions[key] || original;
  });
}

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

function generateString (length = 32, symbols = SYMBOLS) {
  let result = '';

  while (length--) {
    result += symbols[Math.floor(Math.random() * symbols.length)];
  }

  return result;
}

function mxSorter (item1, item2) {
  return item1.priority - item2.priority;
}
function mxMapper (server) {
  return server.exchange;
}

const NEWLINE_RE = /\r?\n/g;

const errorCodeGroup = {
  '4': null,
  '5': null
}

function checkMessageIsComplete (message) {
  const newLinePos = message.lastIndexOf('\r\n');

  if (newLinePos > -1) {
    return message[newLinePos + 2 + 3] !== '-';
  }

  return message[3] !== '-';
}

function parseResponse (response) {
// Do we really need this all? Let's simplify.
/*
  const result = {
    message: response.toString().trim(),
    code: null,
    data: [],
    isError: false
  };

  const lines = result.message.split(NEWLINE_RE);

  for (let line in lines) {
    result.code || (result.code = parseInt(lines[line].substring(0, 3), 10));
    result.data.push(lines[line].substring(4));
  }

  if (result.code >= 400) {
    result.isError = true;
  }
*/
  const message = response.toString().trim();

  return {
    message: message,
    isError: message[0] in errorCodeGroup,
    isComplete: checkMessageIsComplete(message),
  };
}

module.exports = {};

module.exports = {
  useTemplate,
  getHelloMessage,
  replaceDDot,
  checkSize,
  generateString,
  mxSorter,
  mxMapper,
  parseResponse
};
