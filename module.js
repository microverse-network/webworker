const RPC = require('@microverse-network/module/rpc')

module.exports = class WebWorker extends RPC {
  constructor(options = {}) {
    options.environment = { tracker: false }
    super(options)
    this.handler = options.handler
  }

  execute(call) {
    this.debug(`execute %s(%s)`, call.method, call.args.join(', '))
    let method = this.handler
    if (call.method !== 'default') {
      method = this.handler[call.method]
    }
    const { args, resolve, reject } = call
    const p = method(...args)
    p.then(resolve)
    p.catch(reject)
    return p
  }

  getProtocol(methods = {}) {
    methods.execute = (...args) => this.execute(...args)
    return super.getProtocol(methods)
  }

  get streamName() {
    return this.id ? `worker:${this.id}` : 'worker'
  }
}
