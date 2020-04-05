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
  const result = {
    message: response.toString().trim()
  }
  result.isError = resul.message[0] in errorCodeGroup;

  return result;
}

module.exports = {mxSorter, mxMapper, parseResponse};
