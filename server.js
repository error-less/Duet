const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)


const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

const {
    v4: uuidV4
} = require('uuid')
app.use('/peerjs', peerServer);
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended:true
}))

app.get('/', (req, res) => {
    res.render('home')
    
})

var name =""
app.post("/random",(req, res)=>{
    name=req.body.name
    console.log(name)
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', {
        roomId: req.params.room,
        name:name
    })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId,userName) => {
        console.log("user joined")
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)
        console.log("user:", userId);

        socket.on('message', (message) => {
            //send message to the same room
            io.to(roomId).emit('createMessage', message,userName)
        }); 
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
            console.log("user disconnected")
        })
       
    })
})

server.listen(process.env.PORT || 3000, () => {
    console.log("server started on port");
})