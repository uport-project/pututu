import { Router } from 'express'
import BodyParser from 'body-parser'
import config from 'config'
import log4js from 'log4js'
import messageModel from '../models/message'


export default () => {
  let log = log4js.getLogger('pututu.api-v2.sns');
  log.setLevel('INFO');

  let api = Router()
  api.use(BodyParser.json({ type: '*/*' }))

  api.get('/:messageId', (req, res) => {
    let messageId = req.params.messageId
    let logData={
      id: req.id,
      messageId: messageId
    };

    if (1==0 && req.authorization === undefined) {
      let resp = {
        status: 'fail',
        data: {authorization: 'Bearer missing'}
      }
      log.warn(JSON.stringify(resp))
      res.status(403).json(resp)
    } else {
      //let recipientId=req.authorization.iss
      let recipientId='2ormzvNA16Ci4KZukBngtaMfoc3GTnhuYhE';

      messageModel.get(messageId, (err,rs) =>{
        if (err) {
          logData.err=err;
          log.error(JSON.stringify(logData));
          return res.status(500).json({status: 'error', message: err.toString()})
        }
        if (rs.rowCount == 0 ) {
          logData.err="Message not found";
          log.error(JSON.stringify(logData));
          return res.status(404).json({status: 'fail', data: logData.err})
        }

        let messageObj=rs.rows[0];
        if (messageObj.recipient != recipientId ) {
          logData.err="Access to message Forbidden";
          log.error(JSON.stringify(logData));
          return res.status(403).json({status: 'fail', data: logData.err})
        }

        logData.message=messageObj
        log.info(JSON.stringify(logData));
        return res.json({status: 'success', data: messageObj})
      })
    }
  })

  api.get('/', (req, res) => {
    let logData={
      id: req.id
    };

    if (1==0 && req.authorization === undefined) {
      let resp = {
        status: 'fail',
        data: {authorization: 'Bearer missing'}
      }
      log.warn(JSON.stringify(resp))
      res.status(403).json(resp)
    } else {
      //let recipientId=req.authorization.iss
      let recipientId='2ormzvNA16Ci4KZukBngtaMfoc3GTnhuYhE';

      messageModel.findByRecipient(recipientId, (err,rs) =>{
        if (err) {
          logData.err=err;
          log.error(JSON.stringify(logData));
          return res.status(500).json({status: 'error', message: err.toString()})
        }
        let messages=rs.rows;

        logData.message=messages;
        log.info(JSON.stringify(logData));
        return res.json({status: 'success', data: messages})
      })
    }
  })

  api.delete('/:messageId', (req, res) => {
    let messageId = req.params.messageId
    let logData={
      id: req.id,
      messageId: messageId
    };

    if (1==0 && req.authorization === undefined) {
      let resp = {
        status: 'fail',
        data: {authorization: 'Bearer missing'}
      }
      log.warn(JSON.stringify(resp))
      res.status(403).json(resp)
    } else {
      //let recipientId=req.authorization.iss
      let recipientId='2ormzvNA16Ci4KZukBngtaMfoc3GTnhuYhE';

      messageModel.delete(messageId, recipientId, (err,rs) =>{
        if (err) {
          logData.err=err;
          log.error(JSON.stringify(logData));
          return res.status(500).json({status: 'error', message: err.toString()})
        }

        if (rs.rowCount == 0 ) {
          logData.err="Message not found";
          log.error(JSON.stringify(logData));
          return res.status(404).json({status: 'fail', data: logData.err})
        }


        log.info(JSON.stringify(logData));
        return res.json({status: 'success', data: 'deleted'})
      })
    }
  })


  return api
}
