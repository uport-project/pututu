import { Router } from 'express'
import BodyParser from 'body-parser'
import config from 'config'
import log4js from 'log4js'

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

    if (req.authorization === undefined) {
      let resp = {
        status: 'fail',
        data: {authorization: 'Bearer missing'}
      }
      log.warn(JSON.stringify(resp))
      res.status(403).json(resp)
    } else {
      let recipientId=req.authorization.iss

      //TODO: Retrieve message
      //(messsageId,recipientId)
    }
  })


  return api
}
