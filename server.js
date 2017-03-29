var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
app.use(express.static(__dirname+'/pbulic'));

var clientNums = 0;
var totolClientNums = 0;
var groupList = {};
var stepList = {};
var userIdList = [];
var roomsList = {};

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
		groupObj = analyData(groupObj);
		//判断房间名是否重复
		if(roomsList[groupObj.roomName] && roomIsExist(groupObj.roomName)) {
			socket.emit("createRoomCB",{res:false,msg:"房间名已存在，创建失败！",data:{}});
			return;
		}
		//把创建者本身加入分组
		socket.join(groupObj.roomName);
		//保存房间大小
		roomsList[groupObj.roomName] = groupObj.nums;
		stepList[groupObj.roomName] = 0;
		var playerIndex = getPlayerIndex(groupObj.roomName);
		socket.emit("createRoomCB",{res:true,msg:"创建成功！",data:{playerIndex:playerIndex}});
	});	
	//加入分组
	socket.on("joinRoom",function(roomData){
		roomData = analyData(roomData);
		console.log("userName "+roomData.userName+" join "+roomData.roomName);
		var res = joinRoom(socket,roomData);
		//房间人数发生改变
		if(res) roomsUserChange(socket,roomData);
	});
	//离开分组
	socket.on("leaveRoom",function(groupObj){
		groupObj = analyData(groupObj);
		console.log("userName "+groupObj.userName+" leave "+groupObj.roomName);
		leaveRoom(socket,groupObj);
		//房间人数发生改变
		roomsUserChange(socket,groupObj);
		//判断房间里面是不是没人了
		if(!io.sockets.adapter.rooms[groupObj.roomName] || io.sockets.adapter.rooms[groupObj.roomName].length == 0) 
			gameInfomationChange(socket,0);
	});
	
	//解散分组
	socket.on("disBandRoom",function(groupObj){
		groupObj = analyData(groupObj);
		console.log("userName "+groupObj.userName+" disBandRoom "+groupObj.roomName);		
		leaveRoom(socket,groupObj);
		disBandRoom(socket,groupObj);
	});
	
	//初始化其它玩家棋盘
	socket.on("freshOtherUserCheckBoard",function(roomData){
		roomData = analyData(roomData);
		console.log("freshOtherUserCheckBoard");
		socket.broadcast.to(roomData.roomName).emit('freshOtherUserCheckBoard',roomData);
	});
	//选择某个棋
	socket.on("selectOneChess",function(roomData){
		roomData = analyData(roomData);
		stepList[roomData.roomName]++;
		console.log("selectOneChess RoomName: "+roomData.roomName + " Step: "+stepList[roomData.roomName]);
		socket.broadcast.to(roomData.roomName).emit('selectOneChess',roomData);
	});
	//设置面板
	socket.on("setPanel",function(setData){
		setData = analyData(setData);
		console.log("setPanel");
		io.sockets.in(setData.roomName).emit('setPanel',setData);
	});
	//io.sockets.manager.rooms 用 io.sockets.adapter.rooms 代替
	//io.sockets.clients('particular room') 换成了 io.sockets.adapter.rooms['private_room'];
	socket.on('gameInfomation',function(msg){
		msg = analyData(msg);
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

function getPlayerIndex (roomName){
	return io.sockets.adapter.rooms[roomName].length;
}

function roomIsExist (roomName){
	return io.sockets.adapter.rooms[roomName] || false;
}

function disBandRoom (socket,data){
	//给分组内除了自己外所有客户端广播信息
	socket.broadcast.to(data.roomName).emit('disBandRoom');
	delete roomsList[data.roomName];
	delete stepList[data.roomName];
}

function joinRoom (socket,data){
	var curSize = getRoomSizeByName(data.roomName);
	if(!curSize) {
		socket.emit("joinRoomCallBack",{res:false,msg:"房间不存在，无法加入！",data:{}});
		return false;
	}
	console.log(curSize +" "+roomsList[data.roomName]);
	if(curSize >= roomsList[data.roomName]) {
		socket.emit("joinRoomCallBack",{res:false,msg:"房间已满，无法加入！",data:{}});
		return false;
	}
	socket.join(data.roomName);
	var playerIndex = getPlayerIndex(data.roomName);
	socket.emit("joinRoomCallBack",{res:true,msg:"加入成功！",userNums:playerIndex,data:{playerIndex:playerIndex}});
	return true;
}

function leaveRoom (socket,data){
	socket.leave(data.roomName);
}

function roomsUserChange (socket,data){
	//给分组内所有客户端广播信息
	socket.broadcast.to(data.roomName).emit('roomsUserChange',io.sockets.adapter.rooms[data.roomName]);
}

function gameInfomationChange (socket,type){
	//给除了自己以外的客户端广播信息
	socket.broadcast.emit("gameInfomation",{type:0,roomsList:io.sockets.adapter.rooms});
}
//获取房间当前有多少玩家
function getRoomSizeByName (roomName){	
	if(!io.sockets.adapter.rooms[roomName]) return false;
	return io.sockets.adapter.rooms[roomName].length;
}

function analyData (data){
	//解决web端跟native端不一致问题
	try {
			data = JSON.parse(data);                
		} catch (error) {}
	return data;
}

http.listen(3000,function(){
	console.log("listening on:", 3000);
});