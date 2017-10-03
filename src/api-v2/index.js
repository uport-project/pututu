import { version } from '../../package.json'
import { Router } from 'express'
import sns from './sns'
import message from './message'
import log4js from 'log4js'


export default () => {
  let log = log4js.getLogger('pututu.api-v2');
  log.setLevel('INFO');

  let api = Router()

  api.use('/sns', sns())
  api.use('/message', message())

  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    res.json({ version })
  })

  return api
}
