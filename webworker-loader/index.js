const schema = require('./options.json')
const loaderUtils = require('loader-utils')
const validateOptions = require('schema-utils')
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin')
const LibraryTemplatePlugin = require('webpack/lib/LibraryTemplatePlugin')
const MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin')
const WebWorkerTemplatePlugin = require('webpack/lib/webworker/WebWorkerTemplatePlugin')
const getWorker = require('./getWorker')
const LoaderError = require('./LoaderError')

require('babel-register')({
  presets: [require.resolve('babel-preset-env')],
  plugins: [require.resolve('babel-plugin-add-module-exports')],
})

module.exports = function loader() {}
const cache = {}

module.exports.pitch = function pitch(request) {
  const options = loaderUtils.getOptions(this) || {}

  validateOptions(schema, options, 'Worker Loader')

  if (!this.webpack) {
    throw new LoaderError({
      name: 'Worker Loader',
      message: 'This loader is only usable with webpack',
    })
  }

  this.cacheable(false)

  const cb = this.async()

  const filename = loaderUtils.interpolateName(
    this,
    options.name || '[name].microverse.js',
    {
      context: options.context || this.context,
      regExp: options.regExp,
    },
  )

  const worker = {}

  worker.options = {
    filename,
    chunkFilename: `[id].${filename}`,
    namedChunkFilename: null,
  }

  worker.compiler = this._compilation.createChildCompiler(
    'worker',
    worker.options,
  )

  new WebWorkerTemplatePlugin(worker.options).apply(worker.compiler)

  if (this.target !== 'webworker' && this.target !== 'web') {
    new NodeTargetPlugin().apply(worker.compiler)
  }

  // this line is gonna add a statement to the bundle which will attach the
  // exported module to the scope (in most cases global scope). In the script
  // the handler will be available as `this[filename]`.
  new LibraryTemplatePlugin(filename, 'this').apply(worker.compiler)

  new MultiEntryPlugin(
    this.context,
    [
      require.resolve('babel-polyfill'),
      `!!${require.resolve(
        './async-worker',
      )}?{filename:'${filename}'}!${request}`,
    ],
    'main',
  ).apply(worker.compiler)

  const subCache = `subcache ${__dirname} ${request}`

  worker.compilation = (compilation, data) => {
    if (compilation.cache) {
      if (!compilation.cache[subCache]) compilation.cache[subCache] = {}

      compilation.cache = compilation.cache[subCache]
    }

    data.normalModuleFactory.plugin('parser', (parser, options) => {
      parser.plugin('export declaration', expr => {
        const decl = expr.declaration || expr
        const { compilation, current } = parser.state
        const entry = compilation.entries[0].resource

        // only process entry exports
        if (current.resource !== entry) return

        const exports =
          compilation.__microverseExports ||
          (compilation.__microverseExports = {})

        if (decl.id) {
          exports[decl.id.name] = true
        } else if (decl.declarations) {
          for (let i = 0; i < decl.declarations.length; i++) {
            exports[decl.declarations[i].id.name] = true
          }
        } else {
          console.warn('[microverse] unknown export declaration: ', expr)
        }
      })
    })
  }

  if (worker.compiler.hooks) {
    const plugin = { name: 'MicroverseWebWorkerLoader' }
    worker.compiler.hooks.compilation.tap(plugin, worker.compilation)
  } else {
    worker.compiler.plugin('compilation', worker.compilation)
  }

  worker.compiler.runAsChild((err, entries, compilation) => {
    if (err) return cb(err)

    if (entries[0]) {
      worker.file = entries[0].files[0]

      const src = compilation.assets[worker.file].source()
      const exports = Object.keys(
        (cache[worker.file] =
          compilation.__microverseExports || cache[worker.file] || {}),
      )

      worker.factory = getWorker(worker.file, src, options)

      if (options.fallback === false) {
        delete this._compilation.assets[worker.file]
      }

      return cb(
        null,
        `// hello from microverse web worker
var _microverse = require('@microverse-network/browser')

var factory = function() {
  return {
    hash: '${compilation.hash}',
    filename: '${worker.file}',
    api: ${JSON.stringify(exports)},
    deploy: function() { return ${worker.factory} }
  }
}

module.exports = _microverse.require(factory)
`,
      )
    }

    return cb(null, null)
  })
}
