const path = require('path');
const JavaScriptObfuscator = require('webpack-obfuscator');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const prod_mode = "production"
const jsc_filename = '[name].js'
const css_filename = '[name].css'

const plugin_jsobfuscator = new JavaScriptObfuscator({ rotateStringArray: true, disableConsoleOutput: true, }, [])
const plugin_compression_norma = new CompressionPlugin({ algorithm: 'gzip' })
const plugin_compression_small = new CompressionPlugin({ algorithm: 'gzip', threshold: 0, minRatio: 0.9 })
const plugin_compression_scsss = new CompressionPlugin({ filename: '[path][base].gz', algorithm: 'gzip', test: /\.css$/ })
const plugin_MiniCssExtractPlu = new MiniCssExtractPlugin({ filename: css_filename })

const jsc_dir = '../cjs/'
const jsc_out_path = path.resolve(__dirname, '../static/js')
const jsc_priv_path = path.resolve(__dirname, '../priv_files/js')
const css_dir = '../ccss/'
const css_out_path = path.resolve(__dirname, '../static/styles')

module.exports = (env, argv) => [
  //  Javascript with obfuscation
  {
    entry: {
      mainscript: [jsc_dir + 'base.js', jsc_dir + 'wsi.js', jsc_dir + 'search.js', jsc_dir + 'filespro.js'],
      imagescript: [jsc_dir + 'images.js'],
      sharedWorker: [jsc_dir + 'sharedWorker.js'],
    },
    output: { path: jsc_out_path, filename: jsc_filename },
    plugins: argv.mode === prod_mode ? [plugin_jsobfuscator, plugin_compression_norma, ] : [],
  },
  //  Javascript with obfuscation - priv js files
  {
    entry: {
      priv_monitor_script: [jsc_dir + 'monitor.js'],
    },
    output: { path: jsc_priv_path, filename: jsc_filename },
    plugins: argv.mode === prod_mode ? [plugin_jsobfuscator, plugin_compression_norma, ] : [],
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
    plugins: argv.mode === prod_mode ? [plugin_MiniCssExtractPlu, plugin_compression_scsss] : [plugin_MiniCssExtractPlu]
  }
];