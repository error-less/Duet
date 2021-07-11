// requiring express framework
const express = require('express')
// body parser to take content from page 
const bodyParser = require('body-parser')
// initialization of express  app
const app = express()
//  requiring http server to run app
const server = require('http').Server(app)
// requiring server to make connection
const io = require('socket.io')(server)

//requiring peer to add people
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

// uuid to create random room
const {
    v4: uuidV4
} = require('uuid')

// use app for peerjs server
app.use('/peerjs', peerServer);
// templating language is ejs so view engine set to be ejs
app.set('view engine', 'ejs')
// to serve static files
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended:true
}))

// home route
app.get('/', (req, res) => {
    res.render('home')
    
})

var name =""
app.post("/random",(req, res)=>{
    name=req.body.name
    console.log(name)
    res.redirect(`/${uuidV4()}`)
})

// render video call room
app.get('/:room', (req, res) => {
    res.render('room', {
        roomId: req.params.room,
        name:name
    })
})

// code for making socket connection
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
            // disconnecting room
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
            console.log("user disconnected")
        })
       
    })
})

// listening to server
server.listen(process.env.PORT || 3000, () => {
    console.log("server started on port");
})