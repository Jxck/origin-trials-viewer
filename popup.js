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

function displayToken(token) {
  try {
    const decoded_token = decodeToken(token.value)
    const payload = decoded_token.payload

    const $clone = $('template#token-item').content.cloneNode(true)

    $clone.querySelector('.feature').textContent = payload.feature

    $clone.querySelector('.origin + dd > a').href        = payload.origin
    $clone.querySelector('.origin + dd > a').textContent = payload.origin
    $clone.querySelector('.type  + dd').textContent = token.type

    const expiry = new Date(payload.expiry * 1000)

    $clone.querySelector('.expiry + dd > time').datetime    = expiry.toLocaleString()
    $clone.querySelector('.expiry + dd > time').textContent = expiry.toLocaleString()

    if (expiry < new Date()) {
      $clone.querySelector('.expiry + dd').classList.add('expired')
    }

    $clone.querySelector('.subdomain  + dd').textContent = !!payload.isSubdomain
    $clone.querySelector('.thirdparty + dd').textContent = !!payload.isThirdParty

    $('#tokens').appendChild($clone)
  } catch (error) {
    console.log('error', error);
    const $clone = $('template#error-item').content.cloneNode(true)
    $clone.querySelector('.feature').textContent = 'Malformed token'
    $clone.querySelector('.type  + dd').textContent = token.type
    $clone.querySelector('.raw-token + dd').textContent = token.value
    $('#tokens').appendChild($clone)
  }
}

let tokens = [];

chrome.tabs.executeScript({ file: 'tab.js' }, ([metaTokens]) => {
  tokens = tokens.concat(metaTokens);
})

chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
  chrome.webNavigation.getAllFrames({tabId: tabs[0].id}, function(framesInfo) {
    for (frameInfo of framesInfo) {
      const tabHeaders = chrome.extension.getBackgroundPage().headers[tabs[0].id];
      if (tabHeaders) {
        const frameHeaders = tabHeaders[frameInfo.frameId];
        if (frameHeaders.response && frameHeaders.response.responseHeaders) {
          const originTrialHeaders = frameHeaders.response.responseHeaders.filter((header) => header.name === 'origin-trial');
          const headerTokens = originTrialHeaders.map((header) => header.value
            .split(',')
            .map(item=>item.trim())
          ).flat()
          .map(value => ({
            value: value,
            type: 'header',
          }));
          tokens = tokens.concat(headerTokens);
        }
      }
    }
    tokens.forEach(displayToken)
    if (tokens.length > 0) {
      $('#no-token').remove()
    }
  });
});


