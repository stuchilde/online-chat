var express = require('express');
var socket = require('socket.io');
var app = express();
var numUser = 0;
app.use(express.static('public'));
var server = app.listen(4000, function(){

});
var io = socket(server);
var numUsers = 0;
io.on('connection', function(socket){
  var addedUser = false;
  socket.on('new message', function(data){
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });
  socket.on('add user', function(data){
    if(addedUser) return ;
    socket.username = data;
    numUsers ++;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers,
    });
  });
  socket.on('typing', function(){
    socket.broadcast.emit('typing', {
      username: socket.username,
    });
  });
  socket.on('stop typing', function(){
    socket.broadcast.emit('stop typing', {
      username: socket.username,
    });
  });
  socket.on('disconnect', function(){
    if(addedUser) {
      numUsers--;
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers,
      });
    }
  });
});