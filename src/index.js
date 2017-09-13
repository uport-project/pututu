import http from 'http'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import middleware from './middleware'
import apiV1 from './api-v1'
import apiV2 from './api-v2'

import config from 'config'
import expressRequestId from 'express-request-id'
import log4js from 'log4js'


log4js.configure({ appenders: [ { type: "console", layout: { type: "basic" } } ] })
var log = log4js.getLogger('pututu.index');
log.setLevel('INFO');


let app = express()
app.server = http.createServer(app)

// health
app.get('/health', (req, res) => {
  res.send('alive')
})

// 3rd party middleware
app.use(cors({
  exposedHeaders: config.get('corsHeaders')
}))

//console.log(addRequestId);
let addRequestId=expressRequestId();
app.use(addRequestId);

// don't show the log when it is test
if (config.util.getEnv('NODE_ENV') !== 'test') {
  let format=':res[X-Request-Id] :req[X-Forwarded-For] :remote-addr ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
  app.use(log4js.connectLogger(log,  { level: 'auto', format: format}));
}

app.use(bodyParser.json({
  limit: config.get('bodyLimit')
}))

// internal middleware
app.use(middleware())

// api router
app.use('/api/v1', apiV1())
app.use('/api/v2', apiV2())

app.server.listen(process.env.PORT || config.get('port'))

log.info(`Started on port ${app.server.address().port}`)

// export default app
module.exports = app // for testing
