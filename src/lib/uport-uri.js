import URL from 'url-parse'

module.exports = {

  parse: (url) => {

    const parsed = URL(url,true)
    if (parsed.protocol === 'ethereum:') {
      return 'wants you to sign a transaction'
    } else if (parsed.protocol === 'me.uport:' || (parsed.protocol === 'https:' && parsed.host === 'id.uport.me')) {
      switch (parsed.pathname) {
        case 'me':
          return 'requested information'
        case 'add':
          return 'verified your credentials'
        default:
          if (parsed.pathname.match(/\/?(0x[0-9a-fA-F]{40})/)) {
            const params = parsed.query
            if (params && (params.value || params.function || params.bytecode)) {
              return 'wants you to sign a transaction'
            } else {
              return 'wants you to connect'
            }
          }
      }
    }

  }
}
