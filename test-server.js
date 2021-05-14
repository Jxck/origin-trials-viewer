import path from 'path'
import express from 'express'
import { encodeToken } from "./util.js"

const app = express()

const dirname = path.dirname(new URL(import.meta.url).pathname)

const origin_trial = "ArSxvrfZ5EuQwmLLygXLeOO+U8YwgKmylzybnDThaDjzKW/3X98oWOCjtLmNm4Ea6a83sFRlzl9pyYovLr+fsw4AAABkeyJvcmlnaW4iOiJodHRwczovL2xhYnMuanhjay5pbzo0NDMiLCJmZWF0dXJlIjoiVHJ1c3RUb2tlbnMiLCJleHBpcnkiOjE2MDg4NzgyOTcsImlzU3ViZG9tYWluIjp0cnVlfQ=="

app.get('/', (req, res) => {
    res.redirect(302, '/test.html')
})

app.get('/test.html', (req, res) => {
    const token = {
        version: 2,
        signature: new Uint8Array(64).fill(0),
        payload: {
            origin: 'https://example.com',
            feature: 'Valid 3rd Header',
            expiry: (new Date().getTime() / 1000) + 3000,
            isSubdomain: false,
            isThirdParty: true,
        }
    }
    res.setHeader('origin-trial', encodeToken(token))
    res.sendFile(path.join(dirname, '/test.html'))
})

app.get('/test-frame.html', (req, res) => {
    const token = {
        version: 2,
        signature: new Uint8Array(64).fill(0),
        payload: {
            origin: 'https://example.com',
            feature: 'Expired 3rd Header',
            expiry: (new Date().getTime() / 1000) - 3000,
            isSubdomain: false,
            isThirdParty: true,
        }
    }
    res.setHeader('origin-trial', encodeToken(token))
     res.sendFile(path.join(dirname, '/test-frame.html'))
})

app.get('/util.js', (req, res) => {
    res.sendFile(path.join(dirname, '/util.js'))
})

app.listen(3000)