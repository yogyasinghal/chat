// entry point to app

////////////////
//const mongo = require('mongodb').MongoClient;
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/';
// const assert = require('assert');
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
app.use(express.urlencoded({extended : false}))
const io = socketio(server);
// mongoose.connect('mongodb://localhost:27017/database',{ useNewUrlParser: true },function(err,db){
//     if (err){
//         console.log(err);
//     }
//     else{
//         console.log("connected to db");
//     }
// });

mongoose.connect('mongodb+srv://yogya:yogya1083@cluster0.hkbcf.mongodb.net/Cluster0?retryWrites=true&w=majority',{ useNewUrlParser: true },function(err,db){
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
    date:String,
    flag:Boolean,
    room:String
    //created : {type : Date,default:Date.now} 
});

var Chat = mongoose.model('Message',ChatSchema);
// set static folder
app.use(express.static(path.join(__dirname,'public')));
const botName = "BOT";
// MongoClient.connect(url).then((client)=>{
    // if (err){
    //     throw err;
    // } 
    // console.log("MongoDb Connected....");
    // const db = client.db(dbname);
    

    /////////////////////
    // run wehn a client conects
io.on('connection',socket =>{
    socket.on('joinRoom',({username,room})=>{
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
        // format message from messages in util
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
        // console.log("........jj.....");
        console.log(msg);
        const user = getCurrentUser(socket.id);

        var d = new Date(); // for now
        console.log("date = " + d);
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
        if (m<10){
            var min = "0" + m.toString();
        }
        else{
            var min = m.toString();
        }

        console.log("m = " + m);
        var hour = h.toString();
        
        console.log(h,m);
        //d.getSeconds();

        var today = new Date();
        var dd = today.getDate();

        var mm = today.getMonth()+1; 
        var yyyy = today.getFullYear();
        if(dd<10) 
        {
            dd='0'+dd;
        } 

        if(mm<10) 
        {
            mm='0'+mm;
        } 
        today = dd+'-'+mm+'-'+yyyy;
        console.log(today);
        var newMsg = new Chat({username:user.username, 
                    msg:msg,time:hour + ":" +  min + zone,
                    date:today,flag:false,room:user.room});
        console.log("find = " + Chat.collection.find({}));
        console.log(newMsg);
        // Chat.bios.remove({});
        newMsg.save().then(res=>{
            console.log("saved");
            //if (err) throw err;
            //io.sockets.emit('message',formatMessage(user.username,msg));
            Chat.find({}).then(res=>{
            //console.log("res = " + res);
            // console.log("old msg",res);
            var prev = res[res.length - 2];
            var current = res[res.length - 1];
            console.log("prev,current = ",prev,current);
            // below cond need to !=
            if (prev.date!=current.date){
                current.flag = true;
            }
            console.log("cuurent msg = ",current);
            // console.log("cuurent message = ",current);
            io.to(user.room).emit('message',current);
            // socket.emit('load old msgs',res);
            });
            // io.to(user.room).emit('message',
            //     formatMessage(user.username,msg,today));
            
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
        console.log("in old msg");
        // console.log("old msg",res);
        socket.emit('load old msgs',res);
    });
   

    socket.on('typing',function(username){
        // console.log(username) ;
        //const user = userJoin(socket.id,username,room);
        const user = getCurrentUser(socket.id);
        console.log("user = ",user);
        if (user){
            socket.broadcast.to(user.room).emit('typing',username);
        }
         
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

