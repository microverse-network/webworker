const WorkerStream = require('workerstream')

const Transport = require('@microverse-network/transport')
const Connection = require('./connection')

module.exports = class WebWorker extends Transport {
  constructor(id, options = {}) {
    super(id, options)
    setTimeout(() => this.emit('open'))
  }

  connect(node, options = {}) {
    options.id = options.id || this.id
    options.origin = this.id
    options.peer = node.id
    options.incoming = false
    options.outgoing = true
    return new Connection(new WorkerStream(node.worker), options)
  }
}
