# watch-traverse

## Summary

This module lets you recursively watch files and its dependencies for change. It's a wrapper around [`fs.watchFile`](https://nodejs.org/docs/latest/api/fs.html#fs_fs_watchfile_filename_options_listener).

## Installation

```console
npm install --save watch-traverse
```

## Usage

```js
const path = require('path');
const watchFile = require('watch-traverse')
const resolved = path.resolve(__dirname, 'webpack.config.js')

watchFile(resolved, (contents) => {
    console.log("Changed")
})
```

## Need help or want to donate to help me make Open Source projects?

- Send me a message on [Twitter](https://twitter.com/evenstensberg)!
- [Donate to me!](https://github.com/sponsors/evenstensberg)