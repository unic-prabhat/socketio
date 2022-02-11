require('./models/db');
var app = require('express')();
var https = require('https');
var fs = require('fs');
const mongoose = require('mongoose');
const Chat = mongoose.model('Chat');

var options = {
  key: fs.readFileSync('security/key.pem'),
  cert: fs.readFileSync('security/cert.pem')
};

// Loading the index file . html displayed to the client
var server = https.createServer(options,function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Loading socket.io
var io = require('socket.io').listen(server);

users = [];
// When a client connects, we note it in the console
io.sockets.on('connection', function (socket) {
    socket.emit('message', 'You are connected!');
     // The other clients are told that someone new has arrived
    socket.on('setUsername', function(data) {
      console.log(data);
      if(users.indexOf(data) > -1) {
         socket.emit('userExists', data + ' username is taken! Try some other username.');
      } else {
         users.push(data);
         socket.emit('userSet', {username: data});
      }
   });
   socket.on('msg', function(data) {
      //Send message to everyone
      io.sockets.emit('newmsg', data);
   })
});


server.listen(3098);
