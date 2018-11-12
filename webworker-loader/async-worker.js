const loaderUtils = require('loader-utils')

module.exports = function(source) {
  const options = loaderUtils.getOptions(this)

  return `// transpiled source code from babel
${source}

if (global.self) {
  require('@microverse-network/environment')({
    Constructor: require('@microverse-network/webworker'),
    module: {
      id: '${options.filename}',
      handler: exports.default || module.exports
    }
  })
}
`
}
