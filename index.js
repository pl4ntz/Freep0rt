const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const util = require('util');
const port = process.env.PORT || 3000;
const clients = [];	//track connected clients

server.listen(port, () => {
	console.log('Server: http://localhost:%d', port);
  });

// Routing
app.use(express.static(path.join(__dirname, 'public')));

//make one reference to event name so it can be easily renamed 
const chatEvent = "chatMessage";

//When a client connects, bind each desired event to the client socket
io.on('connection', socket =>{
	//track connected clients via log
	clients.push(socket.id);
	const clientConnectedMsg = 'User connected ' + util.inspect(socket.id) + ', total: ' + clients.length;
	io.emit(chatEvent, clientConnectedMsg);
	console.log(clientConnectedMsg);

	//track disconnected clients via log
	socket.on('disconnect', ()=>{
		clients.pop(socket.id);
		const clientDisconnectedMsg = 'User disconnected ' + util.inspect(socket.id) + ', total: ' + clients.length;
		io.emit(chatEvent, clientDisconnectedMsg);
		console.log(clientDisconnectedMsg);
	})

	//multicast received message from client
	socket.on(chatEvent, msg =>{
		const combinedMsg = socket.id.substring(0,4) + ': ' + msg;
		io.emit(chatEvent, combinedMsg);
		console.log('multicast: ' + combinedMsg);
	});
});