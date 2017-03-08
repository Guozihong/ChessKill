var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
app.use(express.static(__dirname+'/pbulic'));

var clientNums = 0;
var groupList = {};
var userIdList = [];

io.on('connection',function(socket){
	console.log("a user connected");	
	clientNums++;
	var date = new Date();
	var userId = clientNums + date.getTime();
	userIdList.push(userId);
	socket.emit("connected",{userId:userId});
	socket.emit("clientNums",clientNums);
	socket.on("login",function(msg){
		console.log("login");
		console.log("msg:"+msg);
	});
	
	socket.on('disconnect',function(socket){
		console.log("断开连接");	
		clientNums--;
	});
	//创建分组
	socket.on("createRoom",function(groupObj){
		//把创建者本身加入分组
		socket.join(groupObj.roomName);		
	});	
	//加入分组
	socket.on("joinRoom",function(roomData){
		console.log("userName "+roomData.userName+" join "+roomData.roomName);
		socket.join(roomData.roomName);
		io.sockets.in(roomData.roomName).emit('roomsUserChange',io.sockets.adapter.rooms[roomData.roomName]);
		socket.emit('playerIndex',io.sockets.adapter.rooms[roomData.roomName].length);
	});
	//离开分组
	socket.on("leaveRoom",function(groupObj){
		console.log("userName "+roomData.userName+" leave "+roomData.roomName);
		socket.leave(groupObj.roomName);
		io.sockets.in(groupObj.roomName).emit('roomsUserChange',io.sockets.adapter.rooms[groupObj.roomName]);
		if(!io.sockets.adapter.rooms[groupObj.roomName] || io.sockets.adapter.rooms[groupObj.roomName].length == 0) 
			socket.broadcast.emit("gameInfomation",{type:0,roomsList:io.sockets.adapter.rooms});
	});
	//初始化其它玩家棋盘
	socket.on("freshOtherUserCheckBoard",function(roomData){
		console.log("freshOtherUserCheckBoard");
		socket.broadcast.to(roomData.roomName).emit('freshOtherUserCheckBoard',roomData);
	});
	//选择某个棋
	socket.on("selectOneChess",function(roomData){
		console.log("selectOneChess");
		socket.broadcast.to(roomData.roomName).emit('selectOneChess',roomData);
	});
	//设置面板
	socket.on("setPanel",function(setData){
		console.log("setPanel");
		io.sockets.in(setData.roomName).emit('setPanel',setData);
	});
	//io.sockets.manager.rooms 用 io.sockets.adapter.rooms 代替
	//io.sockets.clients('particular room') 换成了 io.sockets.adapter.rooms['private_room'];
	socket.on('gameInfomation',function(msg){
		console.log("gameInfomation type:",msg.type);	
		switch(msg.type){
			//房间列表
			case 0:
				socket.emit("gameInfomation",{type:msg.type,roomsList:io.sockets.adapter.rooms});
			break;
			
		}
		// socket.emit("roomsList",io.sockets.manager.rooms);
	});
});

io.on('disconnect',function(socket){
	console.log("断开连接");	
	clientNums--;
});


http.listen(3000,function(){
	console.log("listening on:", 3000);
});