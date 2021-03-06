
var NoticeCenter = require("NoticeCenter");
var utils = require("utils");
var UserMO = require("UserMO");

var ScoketServer = cc.Class({
    extends:cc.Component,
    properties:{

    },
    onLoad:function(){
        if(cc.sys.isNative){
            // window.io = SocketIO;
        }else{
            window.io = require("socket.io");
        }
        this.connectServer = false;
        this.clientNums = 0;
        this.roomName = "";
        this.userId = null;
        this.timer = 0;
        this.serverAddress = "http://110.83.31.32:3000";
        // this.openClient();
    },
    openClient:function(){
        var self = this;
        var socket = null;
        if(!cc.sys.isNative){
            this.socket = socket = io(this.serverAddress);
        }
        else{
            this.socket = socket = SocketIO.connect(this.serverAddress);
        }

        //连接成功
        socket.on("connected",function(userData){
            self.connectServer = true;
            //解决web端跟native端不一致问题
            try {
                userData = JSON.parse(userData);                
            } catch (error) {}
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
            //解决web端跟native端不一致问题
            try {
                roomData = JSON.parse(roomData);                
            } catch (error) {}
            cc.log("roomData:",roomData);
            NoticeCenter.dispatchEvent("roomsUserChange",roomData);
        });
        //选择的棋子
        socket.on("selectOneChess",function(chessData){
            //解决web端跟native端不一致问题
            try {
                chessData = JSON.parse(chessData);                
            } catch (error) {}
            cc.log("selectOneChess:",chessData);
            if(chessData.userId == self.userId) return;
            NoticeCenter.dispatchEvent("selectOneChess",chessData);
        });
        //棋盘数据
        socket.on("freshOtherUserCheckBoard",function(chessBoardData){
            //解决web端跟native端不一致问题
            try {
                chessBoardData = JSON.parse(chessBoardData);                
            } catch (error) {}
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
             //解决web端跟native端不一致问题
            try {
                setData = JSON.parse(setData);                
            } catch (error) {}
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
             //解决web端跟native端不一致问题
            try {
                msg = JSON.parse(msg);                
            } catch (error) {}
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
    createRoom:function(roomName,nums,cb){
        this.socket.emit("createRoom",{roomName:roomName,nums:nums});
        this.roomName = roomName;
        var self = this;
        this.socket.on("createRoomCB",function(result){
             //解决web端跟native端不一致问题
            try {
                result = JSON.parse(result);                
            } catch (error) {}
            self.dispatchEvent(result.data);
            cb(result);
        });
    },   
    joinRoom:function(roomName,cb){
        var userName = UserMO.get("userName");
        this.socket.emit("joinRoom",{userName:userName,roomName:roomName});
        this.roomName = roomName;
        var self = this;
        this.socket.on("joinRoomCallBack",function(result){
             //解决web端跟native端不一致问题
            try {
                result = JSON.parse(result);                
            } catch (error) {}
            self.dispatchEvent(result.data);
            cb(result);
        });
    },   
    exitRoom:function(roomName){
        var userName = UserMO.get("userName");
        this.socket.emit("leaveRoom",{userName:userName,roomName:roomName});
        this.roomName = "";
    },   
    freshOtherUserCheckBoard:function(checkBoardArr,playerNums,roleList){
        this.socket.emit("freshOtherUserCheckBoard",{roomName:this.roomName,checkBoardArr:checkBoardArr,playerNums:playerNums,roleList:roleList});
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
    //事件派发
    dispatchEvent:function(eventList){
        if(!eventList) return;
        for(let i in eventList){
            NoticeCenter.dispatchEvent(i,eventList[i]);
        }
    },
    update:function(dt){
        this.timer+=dt;
        if(this.timer < 0.8) return;
        this.timer-=0.8;
        // if(cc.sys.isNative && !this.connectServer){
        //     this.openClient();
        // }
    }
});
module.exports = ScoketServer;