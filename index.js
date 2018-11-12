const { Environment } = require('@microverse-network/environment')

const Node = require('./node')
const Module = require('./module')

module.exports = class WebWorkerEnvironment extends Environment {
  constructor(options = {}) {
    super(options)
    this.once('ready', () => {
      new Module(options.module)
    })
  }

  createNode() {
    return new Node({
      transport: {
        constructor: require('@microverse-network/transport/multi'),
        options: {
          webworker: {
            constructor: require('./transport'),
          },
        },
      },
    })
  }
}
