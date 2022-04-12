const path = require('path'); //modul node.js untuk setting static folder
const http = require('http'); //mengatur server dari modul http node js
const express = require('express'); //server express
const socketio = require('socket.io'); //memanggil socket io 
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express(); //inisialisasi variable app dan atur ke express
const server = http.createServer(app); //variable server dan mengaturnya ke http kemudian diteruskan ke express app
const io = socketio(server); //menginisialisasi variable io dan mengaturnya ke socketio

// Setting static folder (folder public)
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Websocket Bot ';

// Run when client connects
// method on untuk mendengarkan sebuah event lalu menjalankan perintah // callback yang diberikan
// socket(parameter callback) merupkan instance dari socket client yang terhubung ke server 
io.on('connection', socket => { //event connection akan ke trigger ketika ada user terhubung ke server
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user 
    // setelah user berhasil connects maka akan meenampilkan pesan ini (single client)
    socket.emit('message', formatMessage(botName, 'Welcome to RoomChat!'));

    // Broadcast when a user connects
    // ketika ada user terhubung maka pesan ini akan di broadcast kesemua user lain (semua client kecuali client itu sendiri)
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info 
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  // menampilkan nama ketika mengirim pesan
  // callback = msg, callback akan mendapatkan data yang diterima dari client sebagai parameternya
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

//mengecek apkah kita memiliki variable environment port jika tidak maka gunakan port 3000
const PORT = process.env.PORT || 3000;

//menjalankan server dan mengambil port, jadi hanya ini yg akan benar2 dijalankan 
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
