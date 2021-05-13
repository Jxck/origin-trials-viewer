import path from 'path'
import express from 'express'
const app = express()

const dirname = path.dirname(new URL(import.meta.url).pathname)

app.get('/', (req, res) => {
    res.redirect(302, '/test.html')
})

app.get('/test.html', (req, res) => {
    res.sendFile(path.join(dirname, '/test.html'))
})

app.get('/test-frame.html', (req, res) => {
    res.sendFile(path.join(dirname, '/test-frame.html'))
})

app.listen(3000)