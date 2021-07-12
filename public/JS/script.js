// initialization of socket in client side
const socket = io()

// getting user name to display during chat
const user = prompt("Enter your name");
const videoGrid = document.getElementById('video-grid')
const endcall= document.getElementById('end-call')

// running peer server to client side
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
})
// creating video element to show on screen
const myVideo = document.createElement('video')
myVideo.muted = true


const peers = {}
let myVideoStream;

// webRTC asking permision for audio and video**********************************************
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  // passing video stream to client side
  addVideoStream(myVideo, stream)

  // answering to call when new user joined
  myPeer.on('call', call => {
    call.answer(stream)
    // creating video elements 
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })
  // **********************************************************************************************

  // user connected-----------------------------------------------
  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
    // time delay for video display
    // setTimeout(connectToNewUser, 1000, userId, stream)
  })

})

// user disconnected to client side------------------------------------------
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

// ending the call from client side-----------------------------------------
endcall.addEventListener("click", ()=>{
  location.href='/'
})


myPeer.on('open', id => {
  // joining room to server
  socket.emit('join-room', ROOM_ID, id,user)
})

// connecting to new user--------------------------------------------------------------
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)

    console.log("logg");
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

// adding stream and display----------------------------------------------------------------
function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  // adding new video to screen
  videoGrid.append(video)
}

// message portion #################################################################################################################

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

// send messages 
send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

// send message on enter button
text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

// message portion ends ##############################################################################################

// working with buttons--------------------------------------------------------------------------------------------------
const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");

// mute the audio during call--------------------------

muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

// mute button ends ---------------------------------------------

// to stop the video on clicking mute video-------------------------------------------
stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});
// stop video ends ---------------------------------------------------

// to add more people in meeting---------------------
inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});

// working with buttons closed ------------------------------------------------------------------------------------------------

// getting message in client side @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

socket.on("createMessage", (message,userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
});
// message to client ends @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
