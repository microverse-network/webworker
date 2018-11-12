const { random } = require('lodash')

const once = fn => {
  const handler = event => {
    fn(event)
    self.removeEventListener('message', handler)
  }
  self.addEventListener('message', handler)
}

const defaultExport = (...args) => {
  return {
    args: args,
    random: random(9999),
  }
}

module.exports = (...args) => {
  return new Promise((resolve, reject) => {
    once(event => {
      self.postMessage(defaultExport(...args))
    })
  })
}
