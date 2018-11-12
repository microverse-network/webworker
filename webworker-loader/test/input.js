const { random } = require('lodash')

module.exports = async (...args) => {
  return {
    args,
    random: random(9999),
  }
}
