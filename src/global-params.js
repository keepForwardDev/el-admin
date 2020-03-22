export default {
  install(Vue, options) {
    Vue.prototype.uploadUrl = function() {
      if (process.env.NODE_ENV !== 'production') {
        return '/api/tool/upload'
      } else {
        return '/tool/upload'
      }
    }
  }
}
