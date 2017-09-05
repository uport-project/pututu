import pgModel from './_pg_model'

module.exports = {
  tableName:'messages',

  add (messageId, senderId, recipientId, message, callback ) {
    let data={
      id: "'"+messageId+"'",
      sender: "'"+senderId+"'",
      recipient: "'"+recipientId+"'",
      message: "'"+message+"'"
    }
    pgModel._add(this.tableName, data, callback)
  },

  get(messageId, callback){
    pgModel._get(this.tableName,'*',"id='"+messageId+"'",callback)
  },

  findByRecipient(recipientId,callback){
    pgModel._get(this.tableName,'*',"recipient='"+recipientId+"' ORDER BY created ASC",callback)
  },

  delete(messageId, recipientId, callback){
    let where="id='"+messageId+"' AND recipient='"+recipientId+"'";
    pgModel._delete(this.tableName,where,callback)
  },

}
