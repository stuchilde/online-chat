var COLORS = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];
var socket = io();
var username;
var connected = false;
var typing = false;

$('.login.page').on('click', function(){
  $('usernameinput').focus();
});
$('.chat.page').on('click', function(){
  $('.inputmessage').focus();
});

$(window).keydown(function(event){
  if(!(event.ctrlkey || event.metakey || event.altkey)) {
    $('.usernameinput').focus();
  }
  if(event.which === 13) {
    if(username) {
      sendmessage();
      socket.emit('stop typing');
      typing = false;
    }else{
      setusername();
    }
  }
});

function setusername(){
  username = $('.usernameinput').val().trim();
  if(username) {
    $('.login.page').fadeOut();
    $('.chat.page').show();
    $('.inputmessage').focus();
    socket.emit('add user', username);
  }
}

//send a chat message
function sendmessage() {
  var message = $('.inputmessage').val();
  if(message && connected) {
    $('.inputmessage').val('');
    addchatmessage({
      username: username,
      message: message,
    });
    socket.emit('new message', message);
  }
}
//add chat message
function addchatmessage(data, options){
  var typingmessage = $('.inputmessage').val();
  var usernamediv = $('<span class="username" >').text(data.username).css('color', getUsernameColor(data.username));
  var messagebodydiv = $('<span class="messagebody" >').text(data.message);
  var typingclass = data.typing ? 'typing' : '';
  var messagediv = $('<li class="message" >').data('username', data.username).addClass(typingclass).append(usernamediv, messagebodydiv);
  addMessageElement(messagediv, options)
}

function updateTyping() {
  if(connected) {
    connected = true
    socket.emit('typing')
  }
}

//get username color
function getUsernameColor(username) {
  var sum = 0;
  for(let i=0; i<username.length; i++) {
    sum += username.charCodeAt(i)
  }
  return COLORS[sum%COLORS.length];
}
function log(message, options) {
  var el = $('<li>').addClass('log').text(message)
  addMessageElement(el, options)
}
function addMessageElement(el, options) {
  if(!options) {
    options = {}
  }
  if(typeof options.prepend === 'undefined') {
    options.prepend = false
  }
  // if(typeof options.fade === 'undefined') {
  //   options.fade = true
  // }
  // if(options.fade) {
  //   el.hide().fadeIn(150);
  // }
  if(options.prepend) {
    $('.messages').prepend(el)
  }else{
    $('.messages').append(el)
  }
  $('.messages')[0].scrollTop = $('.messages')[0].scrollHeight
}
function addParticipantsMessage(data, options) {
  var message = ''
  if(data.numUsers === 1) {
    message = "there's 1 participant"
  }else{
    message = 'there are ' + data.numUsers + ' participants'
  }
  log(message, options)
}

$('.inputMessage').on('input', function(){
  updateTyping();
})

socket.on('login', function(data){
  connected = true;
  var message = 'Welcome to online chat'
  log(message, {prepend : true})
  addParticipantsMessage(data)
})

socket.on('new message', function(data){
  addchatmessage(data)
})

socket.on('user joined', function(data){
  log(data.username + '  joined')
  addParticipantsMessage(data)
})

socket.on('user left', function(data){
  log(data.username + ' left')
  addParticipantsMessage(data)
})