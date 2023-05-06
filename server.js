const fs = require('fs')
const cors = require('cors')
const multer = require('multer')
const express = require('express')
const { fork } = require('child_process')

const app = express()

app.use(cors())
app.use(express.json())

const storage = multer.diskStorage({
    destination: (
        req,
        file,
        callback
    ) => {
        const path = `public/uploads/users/`
        if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true })
        callback(null, path)
    },
    filename: (_req, file, callback) => {
        callback(null, new Date().toISOString() + '-' + file.originalname)
    },
})


app.get('/', (req, res) => {
    res.send('Hello word!')
})

app.post('/compress-video', multer({ storage }).single('video'), (req, res) => {
    const video = req.file
    const videoPath = video.path

    if (video && videoPath) {
        const child = fork('video.js')
        child.send({ videoPath, name: video.filename })

        child.on('message', (message) => {
            console.log(message);
            res.status(message.statusCode).send(message.text)
        })
    } else res.status(400).send('No file uploaded')


})

app.listen(3000, console.log('Connected'))