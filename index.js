const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000
const Twit = require('twit')
const T = new Twit({
    consumer_key: '7Hc7CE442iaBaf1hWjxNcmrgL',
    consumer_secret: 'fVdigUXcEWdJyZXWityHlqj0BYSr8Eb6PuONtQk0D3ScpMoOMt',
    access_token: '1251697614741004288-41JdZIFDFcKOcfdhh7u11C0YtKntC8',
    access_token_secret: 'MR3TjHDJnTbD7CydhyzFsC5bfaBNchzqG9xb0HwL7ShHv',
    timeout_ms: 60 * 1000
})

const streams = {}

const createStream = term => {
    var stream = T.stream('statuses/filter', { track: term })
    stream.on('tweet', function (tweet) {
        io.to(term).emit('tweet', {
            username: tweet.user.name,
            text: tweet.text,
            term
        })
    })
    streams[term] = stream
}

const checkStreams = () =>{
    const terms = Object.keys(streams)
    terms
        .filter(t => (!(t in io.sockets.adapter.rooms)))
        .map(t =>{
            streams[t].stop()
            delete streams[t]
        })
    
}

io.on('connection', socket => {

    socket.on('startStream', term => {
        if (!(term in streams)) {
            createStream(term)
        }
        socket.join(term)
    })

    socket.on('disconnect', reason =>{
        checkStreams()
        console.log(streams)
    })
})

app.set('view engine', 'ejs')

app.get('/', (req, res) => res.render('index'))

http.listen(port, err => {
    if (err) {
        console.log(err)
    } else {
        console.log('Server running...')
    }
})