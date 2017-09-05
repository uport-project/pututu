import config from 'config'
import log4js from 'log4js'

const { Pool } = require('pg')

const connectionString = 'postgresql://root:fV4A5FGcPwoZ@uport-develop.cifu87g3rjso.us-west-2.rds.amazonaws.com:5432/pututu'

module.exports = {
  pool: null,
  debug: false,
  log: null,

  _getPool(){
    if(this.pool === null) {
      //process.env.REDIS_HOST || config.get('redis.host')
      this.pool = new Pool({
        connectionString: connectionString
      })

      this.debug = (process.env.PG_DEBUG || config.get('PG_DEBUG'))
      console.log("debug:"+this.debug)
      this.log = log4js.getLogger('pututu.models._pg_model');
      this.log.setLevel('DEBUG');
    }
    return this.pool;
  },

  _log(t){
    if(this.debug) this.log.debug(t)
  },

  _add(table,data, callback){
    this._log('adding:'+table+" => "+data)
    let keys = Object.keys(data)
    let values = Object.values(data)


    let sql="INSERT INTO "+table+"("+keys+") VALUES ("+values+");"
    this._log(sql);
    this._getPool().query(sql, (err, res) => {
      if (err) {
        callback(err)
      }else{
        callback(null,res)
      }
    })

  },

  _get(prefix, key, callback){
    this._log('getting:'+prefix+key)
    //this._getClient().get(prefix+key, callback)
  },

  _delete(prefix, key,callback){
    this._log('deleting:'+prefix+key)
    //this._getClient().del(prefix+key, callback)
  }

}
