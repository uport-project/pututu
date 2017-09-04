import redisModel from './_redis_model'

module.exports = {

  add (key, value, callback) {
    let v = JSON.stringify(value)
    redisModel._add(this.prefix, key, v, callback)
  },

  addAndExpire (key, value, expireSec, callback) {
    let v = JSON.stringify(value)
    redisModel._addAndExpire(this.prefix, key, v, expireSec, callback)
  },

  get (key, callback) {
    redisModel._get(this.prefix, key, (_err, _value) => {
      if (_err) callback(_err)
      else {
        let v = JSON.parse(_value)
        callback(null, v)
      }
    })
  },

  delete (key, callback) {
    redisModel._delete(this.prefix, key, callback)
  }

}
