(function() {
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

  const metas  = document.querySelectorAll('meta[http-equiv="origin-trial"]')
  const tokens = Array.from(metas).map((meta) => decodeToken(meta.content))
  return tokens
})()
