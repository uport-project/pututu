import config from 'config'
import log4js from 'log4js'

var RedisClustr = require('redis-clustr');

module.exports = {
  map: [],
  client: null,
  debug: false,
  log: null,

  _getClient(){
    if(this.client === null) {
      this.client = new RedisClustr({
        servers: [{
          host: (process.env.REDIS_HOST || config.get('redis.host')),
          port: (process.env.REDIS_PORT || config.get('redis.port')),
        }]
      });
      this.debug = (process.env.REDIS_DEBUG || config.get('redis.debug'))
      this.log = log4js.getLogger('chasqui.models._redis_model');
      this.log.setLevel('DEBUG');
    }
    return this.client;
  },

  _log(t){
    if(this.debug) this.log.debug(t)
  },

  _add(prefix,key,value, callback){
    this._log('adding:'+prefix+key+" => "+value)
    this._getClient().set(prefix+key,value, callback)
  },

  _addAndExpire(prefix,key,value,expireSec,callback){
    this._add(prefix,key,value, callback)
    this._log('setting expire for:'+prefix+key+" to:"+expireSec+" sec")
    this._getClient().expire(prefix+key,expireSec)
  },

  _get(prefix, key, callback){
    this._log('getting:'+prefix+key)
    this._getClient().get(prefix+key, callback)
  },

  _delete(prefix, key,callback){
    this._log('deleting:'+prefix+key)
    this._getClient().del(prefix+key, callback)
  }

}
