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

if (window == top) {
  chrome.extension.sendRequest({msg : "showAction"})

  chrome.extension.onRequest.addListener((req, sender, sendResponse) => {
    switch (req.msg) {
      case "getTokens":
        const metas  = document.querySelectorAll('meta[http-equiv="origin-trial"]')
        const tokens = Array.from(metas).map((meta) => decodeToken(meta.content))
        sendResponse(tokens)
        break
      default:
        break
    }
  })
}
