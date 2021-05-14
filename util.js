export function base64decode(str) {
    return new Uint8Array([...atob(str)].map(a => a.charCodeAt(0)))
}

export function base64encode(binary) {
    if (typeof window === `undefined`) {
        return Buffer.from(binary).toString(`base64`)
    } else {
        return btoa(String.fromCharCode(...binary))
    }
}

export function decodeToken(token) {
    const buf = base64decode(token)
    const view = new DataView(buf.buffer)
    const version = view.getUint8()
    const signature = buf.slice(1, 65)
    const length = view.getUint32(65, false)
    const payload = JSON.parse((new TextDecoder()).decode(buf.slice(69, 69 + length)))
    return { version, signature, length, payload }
}

export function encodeToken(token) {
    const payload = new TextEncoder().encode(JSON.stringify(token.payload))
    const buf = new Uint8Array(1 + 64 + 4 + payload.length)
    const view = new DataView(buf.buffer)
    view.setUint8(0, token.version)
    buf.set(token.signature, 1)
    view.setUint32(65, payload.length)
    buf.set(payload, 69)
    return base64encode(buf)
}

export function extractOT(responseHeaders = []) {
    return responseHeaders
        // filter 'Origin-Trial' header only
        .filter(({ name }) => name.toLowerCase() === 'origin-trial')
        // split multiple token to array
        .flatMap(({ value }) => value.split(',').map(item => item.trim()))
        // make each token to tuple with type
        .map((value) => ({ type: 'HTTP Header', value }))
}