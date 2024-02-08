const path = require('path');
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = [{
    // entry: ['./sjs/imagescripts.js', './sjs/anotherScript.js'],
    entry: './sjs/imagescripts.js',
    output: {
      path: path.resolve(__dirname, '../cstatic/jso'),
      filename: 'imagescripts.js',
    },
    plugins: [
      new JavaScriptObfuscator({
        rotateStringArray: true
      }, [])
    ]
  },
  {
    entry: './sjs/init_page.js',
    output: {
      path: path.resolve(__dirname, '../cstatic/jso'),
      filename: 'init_page.js',
    },
    plugins: [
      new JavaScriptObfuscator({
        rotateStringArray: true
      }, [])
    ]
  },
];