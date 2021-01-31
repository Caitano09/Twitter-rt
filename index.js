const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000
const Twit = require('twit')
const T = new Twit({
    consumer_key: 'nUgo2JE3gr5lmvYpbyrX2KMub',
    consumer_secret: 'tacfisblyuMBEjlW271KQ1ZZr1w0h3ShSTn3Gt9REWCq3EnP8z',
    access_token: '1251697614741004288-SDe4r2kQJQBHedSNtNxV4cqbLhYbTq',
    access_token_secret: 'tAzQks7aIc83P8vlPYDcCDSOojJ3pjhzgMNFCBMrMVc0W',
    timeout_ms: 60*1000
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