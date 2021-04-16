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

let tokens = [];
hasHeaderToken = false;

chrome.tabs.executeScript({ file: 'tab.js' }, ([metaTokens]) => {
  console.log('meta tokens:', metaTokens);
  tokens = tokens.concat(metaTokens);
})

chrome.tabs.reload();

chrome.webRequest.onHeadersReceived.addListener((details) => {
  const originTrialHeader = details.responseHeaders.find(header => header.name === 'origin-trial')
  if (originTrialHeader) {
    console.log('originTrialHeader.value:', originTrialHeader.value); 
    // Only record one origin trial header. There may be an origin trial header for every response.
    if (!hasHeaderToken) {
      tokens.push({
        type: 'header', 
        value: originTrialHeader.value,
      });
      hasHeaderToken = true; 
    } 
  }
}, {urls: ['<all_urls>']}, ['responseHeaders']);

setTimeout(() => {
  if (tokens.length === 0) {
    $('#no-token').classList.remove('hidden');
  } else {
    displayTokens(tokens);
  }
}, 500);

function displayTokens(tokens) {
  tokens.forEach((token) => {
    console.log('token.value', token.value);
    const decoded_token = decodeToken(token.value)
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

    $clone.querySelector('.type  + dd').textContent = token.type
    $clone.querySelector('.subdomain  + dd').textContent = !!payload.isSubdomain
    $clone.querySelector('.thirdparty + dd').textContent = !!payload.isThirdParty

    $('#tokens').appendChild($clone)
  })
}

