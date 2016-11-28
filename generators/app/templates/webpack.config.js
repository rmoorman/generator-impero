'use strict'

const fs = require('fs')
const webpack = require('webpack')<% if (jsLang !== 'vue') { %>
const browsersync = require('browser-sync-webpack-plugin')<% } %>
const autoprefixer = require('autoprefixer')<% if (cssLang === 'stylus') { %>
const rupture = require('rupture')<% } %>

if (fs.existsSync(`${__dirname}/.env`)) require('dotenv').load()
else {
  process.env.NODE_ENV = 'development'
  process.env.NODE_PORT = 5000
}

module.exports = {
  context: __dirname,
  devtool: 'source-map',
  entry: [
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
    './app/src/client.<%= jsExt %>'
  ],
  output: {
    path: `${__dirname}/app/static/dist`,
    publicPath: '/dev-assets',
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.<%= jsExt %>', <% if (jsLang === 'vue') { %>'.vue', '.pug', <% } %>'.<%= cssExt %>']
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      DEVMODE: process.env.NODE_ENV === 'development'
    }),
    new webpack.HotModuleReplacementPlugin(),<% if (jsLang !== 'vue') { %>
    new browsersync(
      // BrowserSync options
      {
        host: 'localhost',
        port: parseInt(process.env.NODE_PORT) + 1,
        proxy: `localhost:${process.env.NODE_PORT}`,
        ui: false,
        files: 'app/views/**/*.pug',
        open: false,
        notify: false,
        injectChanges: false
      },
      // Plugin options
      {
        reload: false
      }
    ),<% } %>
    // This is until these loaders are updated for the new config system
    new webpack.LoaderOptionsPlugin({
      options: {
        // Enables this workaround setup to work
        context: __dirname,
        // Actual options
        eslint: {
          configFile: './.eslintrc',
          emitError: true,
          emitWarning: true
        },
        postcss: () => [
          autoprefixer({
            browsers: <% if (browserSupport === 'legacy') { %>['last 3 versions', 'ie >= 9', '> 1%']<% } %><% if (browserSupport === 'modern') { %>['last 1 version']<% } %>
          })
        ]<% if (cssLang === 'stylus') { %>,
        stylus: {
          use: [rupture()]
        }<% } %>
      }
    })
  ],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.<%= jsExt %><% if (jsLang === 'vue') { %>|.vue<% } %>$/,
        loader: '<%= jsLinter %>',
        exclude: /node_modules/
      },
      {
        test: /\.<%= jsExt %>$/,
        loader: '<%= jsLoader %>',
        exclude: /node_modules/
      },<% if (jsLang === 'vue') { %>
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },<% } %>
      {
        test: /\.<%= cssExt %>$/,
        loaders: [
          'style-loader?fixUrls', // This is to fix sourcemaps breaking relative URLs in CSS
          'css-loader?sourceMap&-autoprefixer', // Disable css-loader's internal autoprefixer
          'postcss-loader',
          '<%= cssLoader %>?sourceMap'
        ]
      }
    ]
  }
}
