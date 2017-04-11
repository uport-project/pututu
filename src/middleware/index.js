import { Router } from 'express'
import JwtDecode from './jwt'

export default () => {
  let api = Router()

  // add middleware here
  api.use(JwtDecode)

  return api
}
