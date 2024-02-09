const path = require('path');
const JavaScriptObfuscator = require('webpack-obfuscator');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const prod_mode = "production"
const jsc_filename = '[name].js'
const css_filename = '[name].css'
const plugin_jsobfuscator = new JavaScriptObfuscator({ rotateStringArray: true }, [])
const plugin_compression = new CompressionPlugin({ algorithm: 'gzip' })
const plugin_compression_small = new CompressionPlugin({ algorithm: 'gzip', threshold: 0, minRatio: 0.9 })
const plugin_MiniCssExtractPlugin = new MiniCssExtractPlugin({ filename: css_filename })
const plugin_compressionCss = new CompressionPlugin({ filename: '[path][base].gz', algorithm: 'gzip', test: /\.css$/ })

const jsc_dir = '../cjs/'
const jsc_out_path = path.resolve(__dirname, '../static/js')
const css_dir = '../ccss/'
const css_out_path = path.resolve(__dirname, '../static/styles')

module.exports = (env, argv) => [
  //  Javascript with obfuscation
  {
    entry: {
      mainscript: [jsc_dir + 'base.js', jsc_dir + 'wsi.js', jsc_dir + 'search.js'],
      filescript: [jsc_dir + 'filespro.js', jsc_dir + 'images.js'],
      sharedWorker: [jsc_dir + 'sharedWorker.js'],
    },
    output: { path: jsc_out_path, filename: jsc_filename },
    plugins: argv.mode === prod_mode ? [plugin_jsobfuscator, plugin_compression, ] : [],
  },
  //  Javascript without obfuscation
  {
    entry: {
      init_page: [jsc_dir + 'init_page.js'],
    },
    output: { path: jsc_out_path, filename: jsc_filename },
    plugins: argv.mode === prod_mode ? [plugin_compression_small, ] : [],
  },
  //  Sass scss
  {
    entry: {
      style: [css_dir + 'style.scss'],
    },
    output: { path: css_out_path, filename: jsc_filename },
    module: {
      rules: [{
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          { loader: 'sass-loader', options: { sassOptions: { outputStyle: 'compressed' }, } }
        ],
      }],
    },
    plugins: argv.mode === prod_mode ? [plugin_MiniCssExtractPlugin, plugin_compressionCss] : [plugin_MiniCssExtractPlugin]
  }
];