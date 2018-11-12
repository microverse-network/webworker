const Node = require('@microverse-network/core/node')
const Transport = require('./transport')

module.exports = class WebWorkerNode extends Node {
  constructor(options = {}) {
    options.transportOptions = {
      constructor: Transport,
    }
    super(options)
  }

  handleReady() {
    super.handleReady()
    this.connect({ id: 'browser-node', transport: { accepts: ['webworker'] } })
  }

  getTransportInfo() {
    return {
      accepts: ['webworker'],
      webworker: { id: 'webworker' },
    }
  }

  getRuntimeInfo() {
    return {
      type: 'webworker',
      id: this.id,
    }
  }
}
