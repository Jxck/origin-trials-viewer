const $  = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

function base64decode(str) {
  return new Uint8Array([...atob(str)].map(a => a.charCodeAt(0)));
}

function decodeToken(token) {
  const buf       = base64decode(token)
  const view      = new DataView(buf.buffer)
  const version   = view.getUint8()
  const signature = buf.slice(1, 65)
  const length    = view.getUint32(65, false)
  const payload   = JSON.parse((new TextDecoder()).decode(buf.slice(69, 69+length)))
  return {version, signature, length, payload}
}

chrome.tabs.executeScript({ file: 'tab.js' }, ([tokens]) => {
  if (tokens.length > 0) {
    $('#no-token').remove()
  }
  tokens.forEach((token) => {
    const decoded_token = decodeToken(token)
    const payload = decoded_token.payload

    const $clone = $('template').content.cloneNode(true)

    $clone.querySelector('.feature').textContent = payload.feature

    $clone.querySelector('.origin + dd > a').href        = payload.origin
    $clone.querySelector('.origin + dd > a').textContent = payload.origin

    const expiry = new Date(payload.expiry * 1000)

    $clone.querySelector('.expiry + dd > time').datetime    = expiry.toLocaleString()
    $clone.querySelector('.expiry + dd > time').textContent = expiry.toLocaleString()

    if (expiry < new Date()) {
      $clone.querySelector('.expiry + dd').classList.add('expired')
    }

    $clone.querySelector('.subdomain  + dd').textContent = !!payload.isSubdomain
    $clone.querySelector('.thirdparty + dd').textContent = !!payload.isThirdParty

    $('#tokens').appendChild($clone)
  })
})
