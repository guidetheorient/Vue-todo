module.exports = {
  entry: './app.js',
  output: {
    filename: 'bundle.js'
  },
  module: {
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js'
    }
  }
}