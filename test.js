import { base64decode, base64encode, decodeToken, encodeToken, extractOT } from "./util.js"

function assert(a, b) {
    console.log(a, b)
    console.assert(a === b)
}

function test_base64decode() {
    const base64 = "QUJDREVGRw=="
    assert(base64encode(base64decode(base64)), base64)
}

function test_decodeToken() {
    const token = "ArSxvrfZ5EuQwmLLygXLeOO+U8YwgKmylzybnDThaDjzKW/3X98oWOCjtLmNm4Ea6a83sFRlzl9pyYovLr+fsw4AAABkeyJvcmlnaW4iOiJodHRwczovL2xhYnMuanhjay5pbzo0NDMiLCJmZWF0dXJlIjoiVHJ1c3RUb2tlbnMiLCJleHBpcnkiOjE2MDg4NzgyOTcsImlzU3ViZG9tYWluIjp0cnVlfQ=="
    const { version, signature, length, payload } = decodeToken(token)
    assert(version, 2)
    assert(length, 100)
    assert(signature instanceof Uint8Array, true)
    assert(signature.length, 64)

    const { origin, feature, expiry, isSubdomain } = payload
    assert(origin, 'https://labs.jxck.io:443')
    assert(feature, 'TrustTokens')
    assert(expiry, 1608878297)
    assert(isSubdomain, true)
}

function test_encodeToken() {
    const expected = "ArSxvrfZ5EuQwmLLygXLeOO+U8YwgKmylzybnDThaDjzKW/3X98oWOCjtLmNm4Ea6a83sFRlzl9pyYovLr+fsw4AAABkeyJvcmlnaW4iOiJodHRwczovL2xhYnMuanhjay5pbzo0NDMiLCJmZWF0dXJlIjoiVHJ1c3RUb2tlbnMiLCJleHBpcnkiOjE2MDg4NzgyOTcsImlzU3ViZG9tYWluIjp0cnVlfQ=="
    const actual = encodeToken(decodeToken(expected))
    assert(actual, expected)
}

function test_extractOT() {
    const result = extractOT([
        { name: 'origin-trial', value: 'token-a' },
        { name: 'origin-trial', value: 'token-b, token-c' },
        { name: 'foo', value: 'bar' },
    ])

    result.forEach(({ type, value }) => {
        assert(type, 'HTTP Header')
        assert(['token-a', 'token-b', 'token-c'].includes(value), true)
    })

    assert(extractOT([]).length, 0)
}

;[
    test_base64decode,
    test_decodeToken,
    test_encodeToken,
    test_extractOT,
].forEach((test_case) => test_case())
