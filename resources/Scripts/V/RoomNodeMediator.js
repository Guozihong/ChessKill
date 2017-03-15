
var NoticeCenter = require("NoticeCenter");
var UserMO = require("UserMO");

var RoomNodeMediator = cc.Class({
    extends:cc.Component,
    properties:{
        roomNameLabel:{
            default:null,
            type: cc.Label
        },
        userNumsLabel:{
            default:null,
            type: cc.Label
        },
        startBtnNode:{
            default:null,
            type: cc.Node
        },
    },
    onLoad:function(){
        this.initEvent();
        this.userNums = 0;
    },
    initEvent:function(){
        var self = this;
        NoticeCenter.addEventListener("roomsUserChange",function(event){
            cc.log("roomsUserChange");
            self.freshPanel(event.args);
        });
        NoticeCenter.addEventListener("disBandRoom",function(event){
            cc.log("disBandRoom");
            self.onExitBtn();
        });
    },
    setData:function(params){
        this.closeCB = params.closeCB;
        this.startGameCB = params.startGameCB;
        this.initPanel(params);
    },
    initPanel:function(params){
        this.userNums = 1;
        this.roomNameLabel.string = params.name;
        this.userNumsLabel.string = "人数: " + params.userNums;
        //判断是不是房主
        var playerIndex = UserMO.get("playerIndex");
        if(playerIndex == 0) 
            this.startBtnNode.active = true;
        else 
            this.startBtnNode.active = false;
    },
    freshPanel:function(data){
        this.userNumsLabel.string = "人数: " + data.length;
        this.userNums = data.length;
    },
    onExitBtn:function(event){
        this.closeCB(this.roomNameLabel.string);
    },
    onStartGameBtn:function(event){
        this.startGameCB(this.userNums);
    },
    setRoomNodeActive:function(enable){
        this.node.active = enable;
    }
});
module.exports = RoomNodeMediator;