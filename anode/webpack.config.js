const path = require('path');
const JavaScriptObfuscator = require('webpack-obfuscator');
const CompressionPlugin = require('compression-webpack-plugin');
const filename = '[name].js'
const prod_mode = "production"
const plugin_jsobfuscator = new JavaScriptObfuscator({ rotateStringArray: true }, [])
const plugin_compression = new CompressionPlugin({ algorithm: 'gzip' })
const pl_comp_small = new CompressionPlugin({ algorithm: 'gzip', threshold: 0, minRatio: 0.9 })

const dir = '../cjs/'
const out_path = path.resolve(__dirname, '../static/js')

module.exports = (env, argv) => [{
  entry: {
    mainscript: [dir + 'base.js', dir + 'wsi.js', dir + 'search.js'],
    filescript: [dir + 'filespro.js', dir + 'images.js'],
    sharedWorker: [dir + 'sharedWorker.js'],
  },
  output: { path: out_path, filename: filename },
  plugins: argv.mode === prod_mode ? [plugin_jsobfuscator, plugin_compression, ] : [],
}, {
  entry: { init_page: [dir + 'init_page.js'], },
  output: { path: out_path, filename: filename },
  plugins: argv.mode === prod_mode ? [pl_comp_small, ] : [],
}];