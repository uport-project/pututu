import { decodeToken, TokenVerifier } from 'jsontokens'
import UportLite from 'uport-lite'
import log4js from 'log4js'

const LEGACY_MS = 1000000000000
const IAT_SKEW = 60

function JwtDecode (req, res, next) {
  let token
  let log = log4js.getLogger('pututu.middleware.jwt')
  log.setLevel('INFO')
  let logData = {
    id: req.id
  }

  if (
    req.method === 'OPTIONS' &&
    req.headers.hasOwnProperty('access-control-request-headers')
  ) {
    var hasAuthInAccessControl = !!~req.headers[
      'access-control-request-headers'
    ]
      .split(',')
      .map(function (header) {
        return header.trim()
      })
      .indexOf('authorization')

    if (hasAuthInAccessControl) {
      return next()
    }
  }

  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ')
    if (parts.length === 2) {
      var scheme = parts[0]
      var credentials = parts[1]

      if (/^Bearer$/i.test(scheme)) {
        token = credentials
      } else {
        let err = { message: 'Format is Authorization: Bearer [token]' }
        logData.err = err
        log.error(logData)
        return res.status(403).json(err)
      }
    } else {
      let err = { message: 'Format is Authorization: Bearer [token]' }
      logData.err = err
      log.error(logData)
      return res.status(403).json(err)
    }
  }

  if (token) {
    // console.log(token);
    let dtoken

    try {
      dtoken = decodeToken(token)
    } catch (decodeErr) {
      logData.decodeErr = decodeErr
      let err = { message: 'Invalid JWT token' }
      logData.err = err
      log.error(JSON.stringify(logData))
      return res.status(403).json(err)
    }

    logData.dtoken = dtoken

    // Check issuedAt
    if (
      dtoken.payload.iat &&
      ((dtoken.payload.iat >= LEGACY_MS &&
        dtoken.payload.iat > Date.now() + IAT_SKEW * 1000) ||
        (dtoken.payload.iat < LEGACY_MS &&
          dtoken.payload.iat > Date.now() / 1000 + IAT_SKEW))
    ) {
      // console.log("JWT issued in the future?. JWT:"+dtoken.payload.exp+" Now:"+new Date().getTime())
      let err = {
        message: `JWT not valid yet (issued in the future) : iat: ${dtoken.payload.iat} > now: ${Date.now() / 1000}`
      }
      logData.err = err
      log.error(JSON.stringify(logData))
      return res.status(403).json(err)
    }

    // Check expireAt
    if (
      dtoken.payload.exp &&
      ((dtoken.payload.exp >= LEGACY_MS && dtoken.payload.exp <= Date.now()) ||
        (dtoken.payload.iat < LEGACY_MS &&
          dtoken.payload.exp <= Date.now() / 1000))
    ) {
      // console.log("JWT expired. JWT:"+dtoken.payload.exp+" Now:"+new Date().getTime())
      let err = {
        message: `JWT has expired: exp: ${dtoken.payload.exp} < now: ${Date.now() / 1000}`
      }
      logData.err = err
      log.error(JSON.stringify(logData))
      return res.status(403).json(err)
    }

    // Get profile.publicKey from uport-registry for iss and validate token signature
    // TODO: Replace with JWT.verifyJWT() from uport-project
    const opts = {
      ipfsGw: 'https://example-gateway.com/ipfs/'
    }
    const registry = UportLite(opts)

    registry(dtoken.payload.iss, (registryErr, issProfile) => {
      if (Object.keys(registryErr).length > 0) {
        logData.registryErr = registryErr
        let err = { message: 'Error getting profile' }
        logData.err = err
        log.error(JSON.stringify(logData))
        return res.status(500).json(err)
      }
      console.log('issProfile', issProfile)
      if (!issProfile) {
        let err = { message: 'Profile not found, unable to verify token' }
        logData.err = err
        log.error(JSON.stringify(logData))
        return res.status(500).json(err)
      }
      const publicKey = issProfile.publicKey.match(/^0x/)
        ? issProfile.publicKey.slice(2)
        : issProfile.publicKey
      let verified = new TokenVerifier('ES256k', publicKey).verify(token)

      if (!verified) {
        let err = { message: 'Invalid signature in JWT token' }
        logData.err = err
        log.error(JSON.stringify(logData))
        return res.status(500).json(err)
      } else {
        if (dtoken.payload.aud) {
          // Search for aud data
          registry(dtoken.payload.aud, (audErr, audProfile) => {
            if (!audErr) {
              dtoken.payload.audName = audProfile.name
            } else {
              let err =
                'ERROR trying to get profile for aud:' + dtoken.payload.aud
              logData.err = err
              log.error(JSON.stringify(logData))
            }
            req.authorization = dtoken.payload
            return next()
          })
        } else {
          req.authorization = dtoken.payload
          return next()
        }
      }
    })
  } else {
    return next()
  }
}

module.exports = JwtDecode
