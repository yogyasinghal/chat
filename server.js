// entry point to app

////////////////
//const mongo = require('mongodb').MongoClient;
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017/';
// this dboper is written after operation.js file
const dboper = require('./operations');
const dbname = 'database';
///////////////




const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const formatMessage = require('./utils/messages')
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

mongoose.connect('mongodb://localhost:27017/database',function(err){
    if (err){
        console.log(err);
    }
    else{
        console.log("connected to db");
    }
});

var ChatSchema = mongoose.Schema({
    username: String,
    msg:String,
    time:String,
    room:String
    //created : {type : Date,default:Date.now} 
});

var Chat = mongoose.model('Message',ChatSchema);
// set static folder
app.use(express.static(path.join(__dirname,'public')));
const botName = "Thanos";
// MongoClient.connect(url).then((client)=>{
    // if (err){
    //     throw err;
    // } 
    // console.log("MongoDb Connected....");
    // const db = client.db(dbname);
    

    /////////////////////
    // run wehn a client conects
io.on('connection',socket =>{
    
    //let chat = db.collection(chats);
    socket.on('joinRoom',({username,room})=>{
        // console.log("new web socket connection");
        // catch emit on main.js
        // welcome cuurent user
        const user = userJoin(socket.id,username,room);
        // dboper.insertDocument(db,{name:username,description:room},'Chat')
        // .then((result)=>{

        //     console.log('Insert Document:\n',result.ops);

        //     return dboper.findDocuments(db,'Chat')
        // })
        // .catch((err) => console.log(err));
        socket.join(user.room);

        socket.emit('message',formatMessage(botName,'welcome to chat app'));
    
        // broadcast(to every body) when a user connects
        //socket.emit('message','hello ironman');

        socket.broadcast.to(user.room).emit(
            'message',
            formatMessage(botName,`${user.username} has Joined Chat`)
        );
        // send users and room info
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    });
    
    
    
    // listen for chatmessage 
    socket.on('chatMessage',(msg)=>{
        console.log("........jj.....");
        console.log(msg);
        const user = getCurrentUser(socket.id);

        var d = new Date(); // for now
        var h = d.getHours(); // => 9
        if (h>12){
            var h = h - 12;
            var zone = "pm";
            }
        else{
            var zone = "am" 
        }
        if (h==12){
            var zone = "pm"
        }
        var m = d.getMinutes(); // =>  30
        var hour = h.toString();
        var min = m.toString();
        console.log(h,m);
        //d.getSeconds();
        var newMsg = new Chat({username:user.username, 
        msg:msg,time:hour + ":" +  min + zone,room:user.room});
        // console.log(db.collection.find({}));
        console.log(newMsg);
        newMsg.save().then(res=>{
            console.log("saved");
            //if (err) throw err;
            //io.sockets.emit('message',formatMessage(user.username,msg));
            io.to(user.room).emit('message',formatMessage(user.username,msg));
        });
        // .catch((err) => console.log(err));

    
    });
    // Chat.find({},function(err,docs){
    //     console.log("llllll");
    //     if (err){
    //         console.log("error");
    //     }
    //     //console.log("sending old msg");
    //     socket.emit('load old msgs',docs);
    // });
    Chat.find({}).then(res=>{
        //console.log("res = " + res);
        socket.emit('load old msgs',res);
    });
    // Chat.find({}).toArray((err,docs)=>{
    //     console.log("found");

    // });


    // runs  when client disconnect

    socket.on('typing',function(username){
        // console.log(username) ;
        //const user = userJoin(socket.id,username,room);
        const user = getCurrentUser(socket.id);
        console.log("user = ",user);
        socket.broadcast.to(user.room).emit('typing',username); 
    });
    
   

    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);
        //check for user
        if (user){
            //below code also work same as broadcast
            io.to(user.room).emit('message',
            formatMessage(botName,`${user.username} has left the chat`)
        );
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });

        }
        
    });
});

//.catch((err) => console.log(err));
const PORT = 3000 || process.env.PORT;
server.listen(PORT,()=> console.log(`Server Running at ${PORT}`));

