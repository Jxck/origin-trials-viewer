import path from 'path'
import express from 'express'
const app = express()

const dirname = path.dirname(new URL(import.meta.url).pathname)

const origin_trial = "ArSxvrfZ5EuQwmLLygXLeOO+U8YwgKmylzybnDThaDjzKW/3X98oWOCjtLmNm4Ea6a83sFRlzl9pyYovLr+fsw4AAABkeyJvcmlnaW4iOiJodHRwczovL2xhYnMuanhjay5pbzo0NDMiLCJmZWF0dXJlIjoiVHJ1c3RUb2tlbnMiLCJleHBpcnkiOjE2MDg4NzgyOTcsImlzU3ViZG9tYWluIjp0cnVlfQ=="

app.get('/', (req, res) => {
    res.redirect(302, '/test.html')
})

app.get('/test.html', (req, res) => {
    res.setHeader('origin-trial', origin_trial)
    res.sendFile(path.join(dirname, '/test.html'))
})

app.get('/test-frame.html', (req, res) => {
    res.setHeader('origin-trial', origin_trial)
    res.sendFile(path.join(dirname, '/test-frame.html'))
})

app.listen(3000)