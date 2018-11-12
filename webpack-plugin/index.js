const webpack = require('webpack')

module.exports = class MicroverseWebpackPlugin {
  constructor({ config }) {
    if (typeof config === 'string') {
      this.config = require(config)
    } else if (typeof config === 'object') {
      this.config = config
    } else {
      throw new Error('config must be provided')
    }
  }

  apply(compiler) {
    const plugins = [
      new webpack.DefinePlugin({
        'process.env': {
          MICROVERSE_CONFIG: JSON.stringify(this.config),
        },
      }),
    ]

    plugins.forEach(plugin => plugin.apply(compiler))
  }
}
