const JSON5 = require('json5')

const builders = {
  webpack: (path, { types: t }) => {
    const [workerPath, workerOptions = {}] = path.node.arguments

    const query = `${require.resolve(
      '@microverse-network/webworker-loader',
    )}?${JSON5.stringify(workerOptions)}!${workerPath.value}`

    path.node.arguments[0] = t.callExpression(t.identifier('require'), [
      t.stringLiteral(query),
    ])
  },
}

module.exports = function microversePlugin(babel) {
  return {
    pre(state) {
      this.state = {
        identifier: null,
        workers: [],
      }
    },
    visitor: {
      ImportDeclaration(path, state) {
        const { node } = path
        if (node.source.value === '@microverse-network/core') {
          const filtered = node.specifiers.filter(
            specifier => specifier.type === 'ImportDefaultSpecifier',
          )

          if (filtered.length) {
            this.state.identifier = filtered[0].local
          }
        }
      },
      CallExpression(path, state) {
        const { bundler = 'webpack' } = state.opts
        if (this.state.identifier) {
          if (isMicroverseRequire(this.state.identifier, path)) {
            const build = builders[bundler]

            if (build) {
              build(path, babel)
            } else {
              throw new Error(`
Trying to run @microverse-network/babel-plugin with unknown bundler: ${bundler}.
Make sure you are using a supported bundler by microverse.`)
            }
          }
        } else if (isRequire(path)) {
          this.state.identifier = path.parent.id
        }
      },
    },
  }
}

const isMicroverseRequire = (identifier, { node, parent }) => {
  return (
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === identifier.name &&
    node.callee.property.name === 'require' &&
    parent &&
    parent.type === 'VariableDeclarator'
  )
}

const isRequire = ({ node, parent }) => {
  return (
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    parent &&
    parent.id &&
    parent.id.type === 'Identifier'
  )
}
