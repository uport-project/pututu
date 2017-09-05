import config from 'config'
import log4js from 'log4js'

const { Pool } = require('pg')

module.exports = {
  pool: null,
  debug: false,
  log: null,

  _getPool(){
    if(this.pool === null) {
      this.pool = new Pool({
        connectionString: (process.env.PG_URL || config.get('PG_URL'))
      })

      this.debug = (process.env.PG_DEBUG || config.get('PG_DEBUG'))
      this.log = log4js.getLogger('pututu.models._pg_model');
      this.log.setLevel('DEBUG');
    }
    return this.pool;
  },

  _log(t){
    if(this.debug) this.log.debug(t)
  },

  _add(table,data, callback){
    this._log('adding:'+table+" => "+JSON.stringify(data))
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

  _get(table, fields, where, callback){
    this._log('getting:'+table+" => "+JSON.stringify(fields) + " :: "+where)
    let sql="SELECT "+fields+" FROM "+table;
    if (where !=null){
      sql+= " WHERE "+where;
    }
    this._log(sql);
    this._getPool().query(sql, (err, res) => {
      if (err) {
        callback(err)
      }else{
        callback(null,res)
      }
    })
  },

  _delete(table, where,callback){
    this._log('deleting:'+table+" :: "+where)
    let sql="DELETE FROM "+table+" WHERE "+where;
    this._log(sql);
    this._getPool().query(sql, (err, res) => {
      if (err) {
        callback(err)
      }else{
        callback(null,res)
      }
    })
  }

}
