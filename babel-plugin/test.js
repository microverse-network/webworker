const test = require('tape')
const babel = require('babel-core')
const plugin = require('./')

test('fails with unknown bundler', t => {
  const example = `
const microverse = require('@microverse-network/core');
const randomNumber = microverse.require('./randomNumber');`

  t.throws(() => {
    babel.transform(example, {
      plugins: [[plugin, { bundler: 'AwesomeBundler' }]],
    })
  }, /Trying to run @microverse-network\/babel-plugin with unknown bundler: AwesomeBundler/)

  t.end()
})

test('imports with webpack', t => {
  const example = `
import microverse from '@microverse-network/core';
const randomNumber = microverse.require('./randomNumber');`

  const expected = `
import microverse from '@microverse-network/core';
const randomNumber = microverse.require(require('${require.resolve(
    '@microverse-network/webworker-loader',
  )}?{}!./randomNumber'));`

  const { code } = babel.transform(example, {
    plugins: [[plugin, { bundler: 'webpack' }]],
  })

  t.is(code, expected)

  t.end()
})

test('requires with webpack', t => {
  const example = `
const microverse = require('@microverse-network/core');
const randomNumber = microverse.require('./randomNumber');`

  const expected = `
const microverse = require('@microverse-network/core');
const randomNumber = microverse.require(require('${require.resolve(
    '@microverse-network/webworker-loader',
  )}?{}!./randomNumber'));`

  const { code } = babel.transform(example, {
    plugins: [[plugin, { bundler: 'webpack' }]],
  })

  t.is(code, expected)

  t.end()
})
