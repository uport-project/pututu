import { Router } from 'express'
import BodyParser from 'body-parser'
import SNS from 'sns-mobile'
import config from 'config'
import uportUri from '../lib/uport-uri.js'
import log4js from 'log4js'


export default () => {
  let log = log4js.getLogger('pututu.api.sns');
  log.setLevel('INFO');

  let api = Router()

  const SNS_KEY_ID = (process.env.SNS_KEY_ID || config.get('SNS_KEY_ID'))
  if (SNS_KEY_ID === undefined) {
    log.error('SNS_KEY_ID not defined')
    process.exit(1)
  }
  const SNS_KEY_SECRET = (process.env.SNS_KEY_SECRET || config.get('SNS_KEY_SECRET'))
  if (SNS_KEY_SECRET === undefined) {
    log.error('SNS_KEY_SECRET not defined')
    process.exit(1)
  }
  const ANDROID_ARN = (process.env.ANDROID_ARN || config.get('ANDROID_ARN'))
  if (ANDROID_ARN === undefined) {
    log.error('ANDROID_ARN not defined')
    process.exit(1)
  }
  const IOS_ARN = (process.env.IOS_ARN || config.get('IOS_ARN'))
  if (IOS_ARN === undefined) {
    log.error('IOS_ARN not defined')
    process.exit(1)
  }
  const IOS_SANDBOX_ARN = (process.env.IOS_SANDBOX_ARN || config.get('IOS_SANDBOX_ARN'))
  if (IOS_SANDBOX_ARN === undefined) {
    log.error('IOS_SANDBOX_ARN not defined')
    process.exit(1)
  }

  let androidApp = new SNS({
    platform: SNS.SUPPORTED_PLATFORMS.ANDROID,
    region: 'us-west-2',
    apiVersion: '2010-03-31',
    accessKeyId: SNS_KEY_ID,
    secretAccessKey: SNS_KEY_SECRET,
    platformApplicationArn: ANDROID_ARN
  })

  let iosApp = new SNS({
    platform: SNS.SUPPORTED_PLATFORMS.IOS,
    region: 'us-west-2',
    apiVersion: '2010-03-31',
    accessKeyId: SNS_KEY_ID,
    secretAccessKey: SNS_KEY_SECRET,
    platformApplicationArn: IOS_ARN,
    sandbox: false
  });

  let iosSandboxApp = new SNS({
    platform: SNS.SUPPORTED_PLATFORMS.IOS,
    region: 'us-west-2',
    apiVersion: '2010-03-31',
    accessKeyId: SNS_KEY_ID,
    secretAccessKey: SNS_KEY_SECRET,
    platformApplicationArn: IOS_SANDBOX_ARN,
    sandbox: true
  });

  api.use(BodyParser.json({ type: '*/*' }))

  api.post('/', (req, res) => {
    let logData={
      id: req.id,
      body: req.body
    };

    if (req.authorization === undefined) {
      let resp = {
        status: 'fail',
        data: {authorization: 'Bearer missing'}
      }
      log.warn(JSON.stringify(resp))
      res.status(403).json(resp)
    } else if (req.authorization.type !== 'notifications') {
      let resp = {
        status: 'fail',
        data: {authorization: 'type is not notifications'}
      }
      log.warn(JSON.stringify(resp))
      res.status(403).json(resp)
    } else if (req.authorization.value === undefined) {
      let resp = {
        status: 'fail',
        data: {authorization: 'value  missing'}
      }
      log.warn(JSON.stringify(resp))
      res.status(403).json(resp)
    } else {
      let fullArn = req.authorization.value
      logData.fullArn=fullArn;

      let app
      let vsA = req.authorization.value.split('/')
      vsA[0] = vsA[0].replace('endpoint', 'app')
      let endpointArn = vsA.pop()
      let vs = vsA.join('/')

      if (vs === androidApp.platformApplicationArn) app = androidApp
      if (vs === iosApp.platformApplicationArn) app = iosApp
      if (vs === iosSandboxApp.platformApplicationArn) app = iosSandboxApp
      logData.platformApplicationArn=app.platformApplicationArn
      logData.platform=app.platform

      if (app === undefined) {
        let err = {authorization: 'endpointArn not supported'}
        logData.err=err;
        log.warn(JSON.stringify(logData))
        return res.status(400).json({status: 'fail', data: err})
      }

      app.getUser(fullArn, (err, user) => {
        if (err) {
          logData.err=err;
          log.error(JSON.stringify(logData))
          return res.status(500).json({status: 'error', data: err})
        }
        let customUserData = user.Attributes.CustomUserData
        logData.customUserData=customUserData;
        //console.log('endpointArn:' + endpointArn + ' customUserData:' + customUserData)

        // Check if customUserData == req.authorization.iss on AuthToken
        //console.log('req.authorization.iss:' + req.authorization.iss)
        /*
        if (customUserData !== req.authorization.iss) {
          let err = {authorization: 'token not signed by endpointArn user'}
          logData.err=err;
          log.warn(JSON.stringify(logData))
          return res.status(400).json({status: 'fail', data: err})
        }
        */

        // Message in all formats/for all platforms
        const senderId = req.authorization.aud
        const senderName = req.authorization.audName || `${req.authorization.aud.slice(12)}..`

        const url = req.body.url
        const message = req.body.message || `${senderName} ${uportUri.parse(url)}`

        const apnStr = JSON.stringify(
          {
            aps: {
              "content-available": 1
            },
            uport: {
              url: url,
              clientId: senderId
            }
          }
        )

        const payload = {
          "default": message,
          "APNS": apnStr,
          "APNS_SANDBOX": apnStr,
          "GCM": JSON.stringify(
            {
              data: {
                message: message,
                url: url,
                clientId: senderId,
                custom_notification: {
                  body: message,
                  title: "uPort",
                  url: url,
                  clientId: senderId,
                  icon: "notification_icon"
                }
              }
            }
          )
        }

        logData.payload=payload;
        /*
            APNS_SANDBOX:{  aps:{   alert: msg } },
            let message = {
            default: msg,
            APNS        :{  aps:{   alert: msg } },
            GCM         :{ data:{ message: msg } }
        }
        let message = {
            default: msg
        }
        */

        app.sendMessage(fullArn, payload, (err, messageId) => {
          if (err) {
            logData.err=err;
            log.error(JSON.stringify(logData));
            return res.status(500).json({status: 'error', data: err})
          } else {
            logData.messageId=messageId;
            log.info(JSON.stringify(logData));
            return res.json({status: 'success', message: messageId})
          }
        })
      })
    }
  })

  return api
}
