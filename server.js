var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
app.use(express.static(__dirname+'/pbulic'));

var clientNums = 0;
var totolClientNums = 0;
var groupList = {};
var userIdList = [];

io.on('connection',function(socket){
	console.log("a user connected");	
	clientNums++;
	totolClientNums++;
	var date = new Date();
	//避免userId一样
	var userId = totolClientNums + date.getTime();
	userIdList.push(userId);
	socket.emit("connected",{userId:userId});
	socket.emit("clientNums",clientNums);
	console.log("clientNums",totolClientNums);
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
		joinRoom(socket,groupObj);
		//用户index发生改变
		userPlayerIndexChange(socket,groupObj);
	});	
	//加入分组
	socket.on("joinRoom",function(roomData){
		console.log("userName "+roomData.userName+" join "+roomData.roomName);
		joinRoom(socket,roomData);
		//房间人数发生改变
		roomsUserChange(roomData);
		//用户index发生改变
		userPlayerIndexChange(socket,roomData);
	});
	//离开分组
	socket.on("leaveRoom",function(groupObj){
		console.log("userName "+groupObj.userName+" leave "+groupObj.roomName);
		leaveRoom(socket,groupObj);
		//房间人数发生改变
		roomsUserChange(groupObj);
		//判断房间里面是不是没人了
		if(!io.sockets.adapter.rooms[groupObj.roomName] || io.sockets.adapter.rooms[groupObj.roomName].length == 0) 
			gameInfomationChange(socket,0);
	});
	
	//解散分组
	socket.on("disBandRoom",function(groupObj){
		console.log("userName "+groupObj.userName+" disBandRoom "+groupObj.roomName);		
		leaveRoom(socket,groupObj);
		disBandRoom(socket,groupObj);
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

function userPlayerIndexChange (socket,data){
	socket.emit('playerIndex',io.sockets.adapter.rooms[data.roomName].length);
}

function disBandRoom (socket,data){
	//给分组内除了自己外所有客户端广播信息
	socket.broadcast.to(data.roomName).emit('disBandRoom');
}

function joinRoom (socket,data){
	socket.join(data.roomName);
}

function leaveRoom (socket,data){
	socket.leave(data.roomName);
}

function roomsUserChange (data){
	//给分组内所有客户端广播信息
	io.sockets.in(data.roomName).emit('roomsUserChange',io.sockets.adapter.rooms[data.roomName]);
}

function gameInfomationChange (socket,type){
	//给除了自己以外的客户端广播信息
	socket.broadcast.emit("gameInfomation",{type:0,roomsList:io.sockets.adapter.rooms});
}

http.listen(3000,function(){
	console.log("listening on:", 3000);
});