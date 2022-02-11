//require('./models/db');
var app = require('express')();
var http = require('http').Server(app);
//var server  = app.listen(3099);
//var io      = require('socket.io').listen(server);
var io = require('socket.io').listen();
const bodyParser = require('body-parser');
//let Chat = mongoose.model('Chat');


app.get('/', function(req, res) {
   res.sendFile('index.html', { root: 'views' });
});

users = [];
io.on('connection', function(socket) {
   console.log('A user connected');
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

//const HOST = "https://meetings.connectix.in";
const HOST = "139.59.29.40";
const PORT = 3099;

app.listen(PORT, HOST, function(err) {
    if (err) return console.log(err);
    console.log("Express server Listening at http://%s:%s", HOST, PORT);
});
