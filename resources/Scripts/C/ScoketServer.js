
var NoticeCenter = require("NoticeCenter");
var utils = require("utils");
var UserMO = require("UserMO");

var ScoketServer = cc.Class({
    extends:cc.Component,
    properties:{

    },
    onLoad:function(){
        if(cc.sys.isNative){
            window.io = SocketIO;
        }else{
            require("socket.io");
        }
        this.connectServer = false;
        this.clientNums = 0;
        this.roomName = "";
        this.userId = null;
        // this.openClient();
    },
    openClient:function(){
        var self = this;
        var socket = null;
        this.socket = socket = io("http://localhost:3000");
        //连接成功
        socket.on("connected",function(userData){
            self.connectServer = true;
            // socket.emit("group1");
            self.userId = userData.userId;
            NoticeCenter.dispatchEvent("connected",userData);
        });
        //客户端数量
        socket.on("clientNums",function(nums){
            self.clientNums = nums;
            cc.log("nums:",nums);
        });
        //房间用户变化
        socket.on("roomsUserChange",function(roomData){
            cc.log("roomData:",roomData);
            NoticeCenter.dispatchEvent("roomsUserChange",roomData);
        });
        //选择的棋子
        socket.on("selectOneChess",function(chessData){
            cc.log("selectOneChess:",chessData);
            if(chessData.userId == self.userId) return;
            NoticeCenter.dispatchEvent("selectOneChess",chessData);
        });
        //棋盘数据
        socket.on("freshOtherUserCheckBoard",function(chessBoardData){
            cc.log("freshOtherUserCheckBoard:",chessBoardData);
            NoticeCenter.dispatchEvent("showCheckBoard",chessBoardData);
        });
        //玩家标志
        socket.on("playerIndex",function(playerIndex){
            cc.log("playerIndex:",playerIndex);
            NoticeCenter.dispatchEvent("playerIndex",playerIndex);
        });
        //解散房间
        socket.on("disBandRoom",function(data){
            cc.log("disBandRoom");
            NoticeCenter.dispatchEvent("disBandRoom");
        });
        //设置面板
        socket.on("setPanel",function(setData){
            cc.log("setPanel:",setData);
            switch(parseInt(setData.type)){
                //隐藏blackNode
                case 0:
                    NoticeCenter.dispatchEvent("setBlackNodeActive",false);
                break;
                //显示blackNode
                case 1:
                    NoticeCenter.dispatchEvent("setBlackNodeActive",true);
                break;
                
            }
        });
        //房间信息
        socket.on('gameInfomation',function(msg){
            cc.log("gameInfomation type:",msg.type);	
            switch(parseInt(msg.type)){
                //房间列表
                case 0:
                cc.log("房间列表:",msg.roomsList);
                var tempArr = self.getRoomsArr(msg.roomsList);
                NoticeCenter.dispatchEvent("roomsListChange",tempArr);
                break;
                
            }
        });
        //断开服务器
        socket.on("disconnect",function(msg){
            cc.log("服务器断开！");
            self.connectServer = false;
            NoticeCenter.dispatchEvent("disconnectServer");
        });
    },
    //获取房间列表，排除默认频道
    getRoomsArr:function(roomsList){
        var tempArr = [];
        for(let i in roomsList){
            if(i.length <= 6)  tempArr.push(i);
        }
        return tempArr;
    },
    getRoomsList:function(){
        this.socket.emit("gameInfomation",{type:0});
    },
    connectStatus:function(){
        return this.connectServer;
    },
    clientNums:function(){
        return this.clientNums;
    },
    createRoom:function(roomName,nums){
        this.socket.emit("createRoom",{roomName:roomName,nums:nums});
        this.roomName = roomName;
    },   
    joinRoom:function(roomName,cb){
        var userName = UserMO.get("userName");
        this.socket.emit("joinRoom",{userName:userName,roomName:roomName});
        this.roomName = roomName;
        this.socket.on("joinRoomCallBack",function(result){
            cb(result);
        });
    },   
    exitRoom:function(roomName){
        var userName = UserMO.get("userName");
        this.socket.emit("leaveRoom",{userName:userName,roomName:roomName});
        this.roomName = "";
    },   
    freshOtherUserCheckBoard:function(checkBoardArr,playerNums){
        this.socket.emit("freshOtherUserCheckBoard",{roomName:this.roomName,checkBoardArr:checkBoardArr,playerNums:playerNums});
    },
    selectOneChess:function(chessNodeData){
        var playerIndex = UserMO.get("playerIndex");
        this.socket.emit("selectOneChess",{roomName:this.roomName,chessNodeData:chessNodeData,userId:this.userId,playerIndex:playerIndex});
    },
    setPanel:function(type){
        this.socket.emit("setPanel",{roomName:this.roomName,type:type});
    },
    //解散房间
    disBandRoom:function(roomName){
        var userName = UserMO.get("userName");
        this.socket.emit("disBandRoom",{roomName:this.roomName,userName:userName});
    },
});
module.exports = ScoketServer;