const fs = require('fs')
const path = require('path')
const { runLoaders } = require('loader-runner')

runLoaders(
  {
    resource: './test/input.js',
    loaders: [path.join(__dirname, '../index.js')],
    readResource: fs.readFile.bind(fs),
  },
  (err, result) => (err ? console.error(err) : console.log(result.result[0]))
)
