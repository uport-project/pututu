import { version } from '../../package.json'
import { Router } from 'express'
import sns from './sns'
import log4js from 'log4js'


export default () => {
  let log = log4js.getLogger('pututu.api');
  log.setLevel('INFO');

  let api = Router()

  api.use('/sns', sns())

  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    res.json({ version })
  })

  return api
}
