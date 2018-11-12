const WorkerStream = require('workerstream/parent')

const Transport = require('@microverse-network/transport')
const Connection = require('./connection')

module.exports = class WebWorker extends Transport {
  constructor(id, options = {}) {
    super(id, options)
    setTimeout(() => this.emit('open'))
  }

  connect(node, options = {}) {
    options.id = options.id || this.id
    options.origin = node.id
    options.peer = node.id
    options.incoming = true
    options.outgoing = false
    return new Connection(new WorkerStream(), options)
  }
}
