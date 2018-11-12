const TransportConnection = require('@microverse-network/transport/connection')

module.exports = class WebWorkerConnection extends TransportConnection {
  constructor(connection, options) {
    options.type = 'webworker'
    super(connection, options)
    setTimeout(() => {
      this.debug('connection is open %s %O', this.id, this)
      this.emit('open')
    })
  }

  getUpstreamStream() {
    return this.upstream
  }

  get incoming() {
    return this.options.incoming
  }

  get outgoing() {
    return this.options.outgoing
  }
}
