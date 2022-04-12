//frontend javascript

const chatForm = document.getElementById('chat-form'); //elemen ID chat-form 
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
// socket.emit memberitahu ke server kemudian didengarkan oleh server dengan socket.on
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server / memanggil pesan yang disetting pada server ketika user on
socket.on('message', (message) => { //ketika login
  console.log(message); // menampilkan pesan
  outputMessage(message); //kemudian pesan message itu disetting (diberi style) yang dibawah dan dimasukkan ke dalam dom

  // Scroll down
  // agar ketika ada chat baru otomatis scroll ke bawah
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value; //ketika mengirimkan form itu harus nendapatkan pesan input text kemudian mencatatnya di sisi client (KADA SAMA)

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server 
  // pesan di emit ke server lalu serve
  socket.emit('chatMessage', msg);

  // Clear input
  // menghapus pesan pada inputbox setelah pesan dikirim
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus(); //setelah clear maka auto fokus ke inputan lagi (kursor)
});

// Output message to DOM
// documen objecct model, objek didalam html yang bisa dimatnipulasi pakai java/css
function outputMessage(message) {
  const div = document.createElement('div');
  // <div></div>
  div.classList.add('message');//class list memberikan kita semua class dan kita tambahkan pada class message
  // <div class="message"></div>
  const p = document.createElement('p');
  // <p></p>
  p.classList.add('meta');
  // <p class="meta"></p>
  p.innerText = message.username;
  // <p class="meta">riandi</p>
  p.innerHTML += `<span> ${message.time}</span>`;
  // <p class="meta">riandi <span>6.6.6</span></p>
  div.appendChild(p); //p dimasukkan 
  // <div class="message"><p class="meta">riandi <span>6.6.6</span></p></div>
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);//setiap kali kita membuat pesan maka pesan itu harus menambahkan div baru ke pesan obrolan
}
// Add room name to DOM
// sidebar
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
// sidebar
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});
