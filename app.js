require('./models/db');
var app = require('express')();
var https = require('https');
var fs = require('fs');
const mongoose = require('mongoose');
const Chat = mongoose.model('Chat');
// 
var options = {
  key: fs.readFileSync('/etc/ssl/private/private.key'),
  cert: fs.readFileSync('/etc/ssl/private/certificate.crt'),
  ca: fs.readFileSync('/etc/ssl/private/ca_bundle.crt')

};

// Loading the index file . html displayed to the client
var server = http.createServer(options,function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Loading socket.io
var io = require('socket.io').listen(server);

users = [];
var clients = {};
// When a client connects, we note it in the console
io.sockets.on('connection', function (socket) {
    var handshakeData = socket.request;
    // console.log("middleware:", handshakeData._query['foo']);
    clients[socket.id] = socket;

    console.log("soc.id-"+socket.id);
    unique_id=clients[socket.id]['id'];
    console.log("uid-"+unique_id);
    
    socket.on('join', function(data){
        console.log(">>"+data.uid);
        console.log("<<"+data.uname);
        // Remove all chats from collection
        // datauid=data.uid;
        socket.join(data.uid);

        // // users[data.uid]=socket.id;
        // io.emit('reload', {});
    });

    socket.on('checkuname',function(data){
        if(users.includes(data.uset)){
            socket.emit('getnamestat','exists');
        }
        else{
            socket.emit('getnamestat','proceed');
            users.push(data.uset);

        }
        console.log(users);

    });


    console.log(users.length);

    var room_name;
    if(handshakeData._query['foo']){
        var room_name = handshakeData._query['foo']
    }
    console.log(room_name);
    // Create function to send status
    sendStatus = function(s){
        socket.emit('status', s);
    }
    
    // Get chats from mongo collection
    Chat.find({room:room_name},(err, res) => {
        // console.log(res);
        if (!err) {
            socket.emit('output', res);
        }
        else {
            console.log('Error in retrieving chat list :' + err);
        }
    });

    // Test  Function
    // socket.emit("receiveresponse", { description: 'A custom event named testerEvent!'});
    socket.on("receiveresponse", function (data){ 
        console.log(data.uid);
        // socket.emit('userExists', data.uid + ' is the user id.');
        io.to(data.uid).emit('userExists', ' is the user id.');
        console.log("Send Invite");
        if(data.uid==unique_id){
            // alert(data.uid);
            // io.to(data.uid).emit('userExists', ' is the user id.');
            // socket.emit('responded',{ abc: data });
        }
    });
	socket.on("and_receiveresponse", function (data){ 
		        console.log(data.uid);
		        // socket.emit('userExists', data.uid + ' is the user id.');
		//         // io.to(data.uid).emit('userExists', ' is the user id.');
		                 console.log("Send Invite from android");
		io.emit('and_userExists',data.uid);
		            });
    // io.to(unique_id).emit("receiveresponse", "I just met you");
    // message='message from avi';
    // socket.emit('message', message);

    // Handle input events
    socket.on('input', function(data){
        var chat = new Chat();
        chat.name = data.name;
        chat.message = data.message;
        chat.room = data.rname;
        chat.uid=data.uid;
        console.log("<>"+data.uid+"55"+users[data.uid]);
        // data.uid=users[data.uid];
        // Check for name and message
        if(chat.name == '' || chat.message == ''){
            // Send error status
            sendStatus('Please enter a name and message');
        } else {
            // Insert message
            console.log(chat.message);
            chat.save((err, doc) =>{
                io.emit('output', [data]);

                // Send status object
                sendStatus({
                    // message: 'Message sent',
                    clear: true
                });
            });
        }
    });
});


server.listen(3000);
