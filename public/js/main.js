// frontend js
// const Chat = require('../server.js');
// accessing form
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const msg = document.getElementById('msg');
const del = document.getElementById('delete');
const register = document.getElementById('register');
/////////////
const typingid = document.getElementById('typing');
const date = document.getElementById('date');
////////////
// get username and room from url
// username = 'yogya';
// roon ='php';
// register.addEventListener('submit',(e)=>{
//     e.preventDefault();
//     const uname = e.target.elements.username.value;
//     console.log("uname = ",uname);
// });

const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix :true
});
console.log(username,room);
// console.log("temp = ",temp);
// it is working as we put script src in html file
const socket = io();

socket.emit('joinRoom',{username,room});
// socket.emit('joinRoom',"helllo world");


// message from server
socket.on('message',message=>{
    console.log(message);
    console.log("msg username" + message.username);
    console.log("date = " + message.date);
    // console.log(message.room);
    //const currentTime = message.time;
    // now we put msg in chat instead of console log
    // we can use react js also 
    // but we are using basic/vannila js
    //Chat.append(message);
    outputMessage(message);
    //keypress.stopPropagation();
    // scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
});

socket.on('load old msgs',function(docs){

    for(var i = 0 ; i<docs.length ; i++)
    {
        // if (docs[i].flag === true){
        //     console.log("found trueeee");
        // }
        if (docs[i].room === room){
            console.log("hello");
            outputOldMessage(docs[i]);
        }
        else{
            console.log("new to this room ");
        }
        
    }
});

//////////////
msg.addEventListener('keypress',()=>{
    socket.emit('typing',username);
});
//////////////

//////////////////////////
socket.on('typing', (handle) =>{
    console.log(typing);
    typingid.innerHTML = '<p><em>' + handle + " is typing..."+ '<em></p>'
    console.log(".....................................");
    //typingid.innerHTML = typing
    //outputMessage(message)
    //io.emit('typing', 
    //{ 'message': msg.message, 'username': msg.username });
  
});
//////////////////////////

// get room and users
socket.on('roomUsers',({room,users})=>{
    // inbuilt fn or DOM function
    outputRoomName(room);
    outputUsers(users);
});



// message submit 
// e means emit parameter
chatForm.addEventListener('submit',(e)=>{
    // to stop saving to file which is default
    e.preventDefault();
    // text input
    // or get msg text
    const msg = e.target.elements.msg.value;
    // console.log(msg);
    // emitting the msg to server
    socket.emit('chatMessage',msg);
    // self code for clearing previous msg
    chatForm.msg.value = "";
    // no such usage
    chatForm.msg.focus();
});



// output msg to dom
function outputMessage(message) {
    const div = document.createElement('div');
    // adding class of message
    // console.log("username = " + username);
    // console.log("message.username = " + message.username);
    div.classList.add('message');
    console.log("flag = ",message.flag);
    if (message.flag){
        //show date 
        console.log("in if");
        div.innerHTML = "hello";
	    // `<p class="date">
		//     ${message.date}
	    // </p>`;
        document.querySelector('.chat-messages').appendChild(div);
    }
    // else{
    //     const div = document.createElement('div');
    //     div.classList.add('message');
    // }
    var name;
    if (username==message.username){
        name = "You";
        div.innerHTML = `<p class="meta2"> ${name} <span>${message.time}</span></p>
	    <p class="text2">
		    ${message.msg}
	    </p>`;
    }
    else{
        name = message.username;
        div.innerHTML = `<p class="meta"> ${name} <span>${message.time}</span></p>
	    <p class="text">
		    ${message.msg}
	    </p>`;
    }
    
    
    document.querySelector('.chat-messages').appendChild(div);
    //div.classList.add('type');
    // cartDiv = "<div id='typing'></div>"; // document.createElement('div');
    // div.body.appendChild(cartDiv);
    typingid.innerHTML = "";
}
function outputOldMessage(message) {
    const div = document.createElement('div');
    // adding class of message
    div.classList.add('message');
    div.innerHTML = `<p class="meta"> ${message.username} <span> ${message.time}</span></p>
	<p class="text">
		${message.msg}
	</p>`;
    document.querySelector('.chat-messages').appendChild(div);
    typingid.innerHTML = ""
}

// add room name to DOM 
function outputRoomName(room){
    roomName.innerText = room;
}
// ADD USER TO dom
function outputUsers(users){
    userList.innerHTML = `
        ${users.map(user => `<li> ${user.username} </li>`).join('')}
    `;
}



