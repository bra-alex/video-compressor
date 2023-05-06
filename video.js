const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')

process.on('message', (payload) => {
    const { videoPath, name } = payload

    const endProcess = (endPayload) => {
        const { statusCode, text } = endPayload

        fs.unlink(videoPath, (err) => {
            if (err) console.log(err);
        })

        process.send({ statusCode, text })

        process.exit()
    }
    const withoutEXT = name.split('.')[0]
    ffmpeg(videoPath)
        .inputFormat('mov')
        .videoCodec('libx265')
        .audioBitrate(128)
        .outputFormat('mp4')
        .on('progress', function (progress) {
            console.log('Processing: ' + progress.percent + '% done');
        })
        .on('end', () => {
            endProcess({ statusCode: 200, text: 'Success' })
        })
        .on('error', () => {
            endProcess({ statusCode: 500, text: err.message })
        })
        .save(`./temp/${withoutEXT}.mp4`)

})