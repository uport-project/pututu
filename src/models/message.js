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


}
