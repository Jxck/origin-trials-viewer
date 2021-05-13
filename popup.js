const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

function base64decode(str) {
  return new Uint8Array([...atob(str)].map(a => a.charCodeAt(0)))
}

function decodeToken(token) {
  const buf = base64decode(token)
  const view = new DataView(buf.buffer)
  const version = view.getUint8()
  const signature = buf.slice(1, 65)
  const length = view.getUint32(65, false)
  const payload = JSON.parse((new TextDecoder()).decode(buf.slice(69, 69 + length)))
  return { version, signature, length, payload }
}

function displayToken(token) {
  try {
    const decoded_token = decodeToken(token.value)
    const payload = decoded_token.payload

    const $token = $('template#token').content.cloneNode(true)

    $token.querySelector('.feature').textContent = payload.feature

    $token.querySelector('.origin + dd > a').href = payload.origin
    $token.querySelector('.origin + dd > a').textContent = payload.origin
    $token.querySelector('.type  + dd').textContent = token.type

    const expiry = new Date(payload.expiry * 1000)

    $token.querySelector('.expiry + dd > time').datetime = expiry.toLocaleString()
    $token.querySelector('.expiry + dd > time').textContent = expiry.toLocaleString()

    if (expiry < new Date()) {
      $token.querySelector('.expiry + dd').classList.add('expired')
    }

    $token.querySelector('.subdomain  + dd').textContent = !!payload.isSubdomain
    $token.querySelector('.thirdparty + dd').textContent = !!payload.isThirdParty

    $('#tokens').appendChild($token)
  } catch (error) {
    console.log('error', error)
    const $error = $('template#error').content.cloneNode(true)
    $error.querySelector('.feature').textContent = 'Malformed token'
    $error.querySelector('.type  + dd').textContent = token.type
    $error.querySelector('.raw-token + dd').textContent = token.value
    $('#tokens').appendChild($error)
  }
}

chrome.tabs.executeScript({ file: 'tab.js' }, ([metaTokens]) => {
  metaTokens.forEach(displayToken)
  if (metaTokens.length > 0) {
    $('#no-token').remove()
  }
})

function extractOT(responseHeaders = []) {
  return responseHeaders
    // filter 'Origin-Trial' header only
    .filter(({ name }) => name.toLowerCase() === 'origin-trial')
    // split multiple token to array
    .flatMap(({ value }) => value.split(',').map(item => item.trim()))
    // make each token to tuple with type
    .map((value) => ({ type: 'header', value }))
}

chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  const tabId = tabs[0].id
  const tabHeaders = chrome.extension.getBackgroundPage().headers[tabId]
  chrome.webNavigation.getAllFrames({ tabId }, function (framesInfo) {
    framesInfo.flatMap(({ frameId }) => {
      const frameHeaders = tabHeaders[frameId]
      return extractOT(frameHeaders?.response?.responseHeaders)
    }).forEach((token) => {
      displayToken(token)
    })
  })
})