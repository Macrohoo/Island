const { Success } = require('../../core/http-exception');

function success(msg, errCode) {
  throw new Success(msg, errCode);
}

module.exports = {
  success,
}