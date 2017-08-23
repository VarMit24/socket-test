var express = require('express');
var logger = require('morgan');
var http = require('http');


var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var users = [];
var connections = {};

io.sockets.on('connection', function(socket){

	
	console.log('User Connected');

	//disconnect
	socket.on('disconnect', function(){
		users.splice(users.indexOf(socket.username),1)
		updateUserNames();
		//connections.splice(connections.indexOf(socket),1);
		delete connections[socket.username];
		console.log('User Disconnected %s '+socket.username);
	});

	// add new user
	socket.on('new user', function(data, callback){
		console.log(data)
		if(connections[data] == undefined){
			callback(true);
			socket.username = data;
			connections[data] = socket.id;
			users.push(socket.username)
			updateUserNames();
		}
		else{
			callback(false);
		}
		
	})

	// update users list
	function updateUserNames(){
		io.sockets.emit('userList',users);
	}

	// handle chat message
	socket.on('chat message', function(msg){
		//console.log('message: ' + msg);
		io.sockets.emit('chat message', {msg: msg, user: socket.username});
	});

	//handles private message
	socket.on('private chat', function(data){
		socket.broadcast.to(connections[data.toUser]).emit('private chat',data);
	})
});
app.get('*',function (req,res) {
	// body...
	res.sendFile(__dirname+"/index.html")
})
app.use(express.static(__dirname + '/node_modules'));
server.listen(3001,function(){
	console.log("Server running on port 3001")
});