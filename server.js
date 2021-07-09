const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const mongoose = require('mongoose')


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

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true,useUnifiedTopology: true});
const userSchema={
    email: String,
    password: String
}
const User=new mongoose.model("User",userSchema);

app.get('/', (req, res) => {
    res.render('home')
    
})
app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});
app.post("/register",(req, res)=>{
    const newUser =new User({
        email: req.body.username,
        password: req.body.password,
    });
    newUser.save(function(err){
        if(err){
            console.log(err)
        }
        else{
            res.redirect(`/${uuidV4()}`)
        }
    })
})

app.post("/login", function (req, res){
    const username = req.body.username
    const password = req.body.password

    User.findOne({email: username},function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                if(foundUser.password===password){
                    res.redirect(`/${uuidV4()}`)
                }
            }
        }
    })

})
app.get('/:room', (req, res) => {
    res.render('room', {
        roomId: req.params.room
    })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId,userName) => {
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)
        console.log("user:", userId);

        socket.on('message', (message) => {
            //send message to the same room
            io.to(roomId).emit('createMessage', message,userName)
        }); 
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
       
    })
})

server.listen(3000, () => {
    console.log("server started on port 3000");
})