const path = require('path');
const watchFile = require('./index')
const resolved = path.resolve(__dirname, 'webpack.config.js')


watchFile(resolved, (contents) => {
    console.log("watching file has changed...")
})