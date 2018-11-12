<div align="center">
  <h1>Microverse Webpack Plugin</h1>
  <p>Plugin that connects all users of your website.</p>
</div>

## Install

```bash
  npm i --save-dev @microverse-network/webpack-plugin babel-polyfill
```

```bash
  yarn add --dev @microverse-network/webpack-plugin babel-polyfill
```

<div align="center">
  <h1>Usage</h1>
</div>

The plugin will create a BrowserPeer, and it will expose it via `microverse` global to your bundles. Just add the plugin to your `webpack`
config as follows:

**webpack.config.js**

```js
const path = require('path')
const MicroverseWebpackPlugin = require('@microverse-network/webpack-plugin')

module.exports = {
  // babel-polyfill is required for microverse-core to work properly.
  entry: ['babel-polyfill', './index.js'],
  plugins: [
    new MicroverseWebpackPlugin({
      config: path.join(__dirname, './microverse.json'),
    }),
  ],
}
```

**microverse.json**

```json
{
  "node": {
    "transportOptions": {
      "webrtc": {},
      "websocket": {}
    }
  }
}
```
