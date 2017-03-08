
var NoticeCenter = require("NoticeCenter");
var Display = require("Display");

var BlackNodeMediator = cc.Class({
    extends:cc.Component,
    properties:{
        promptLabelNode:{
            default:null,
            type: cc.Node
        },
        buttonLayoutNode:{
            default:null,
            type: cc.Node
        },
        roomListNode:{
            default:null,
            type: cc.Node
        },
        roomNode:{
            default:null,
            type: cc.Node
        },
    },
    onLoad:function(){
        this.initEvent();
    },
    initEvent:function(){
        var self = this;
        NoticeCenter.addEventListener("roomsListChange",function(event){
            cc.log("roomsListChange");
            self.freshRoomsListPanel(event.args);
        });
    },
    setMainControll:function(pointer){
        this.mainControll = pointer;
    },
    initConnectServerPanel:function(){
        this.promptLabelNode.active = false;
        this.buttonLayoutNode.active = true;
    },
    initDisConnectServerPanel:function(){
        this.promptLabelNode.active = true;
        this.buttonLayoutNode.active = false;
    },
    freshRoomsListPanel:function(roomsArr){
        var self = this;
        this.roomListNode.active = true;
        this.roomListNode.getComponent("RoomsListNodeMediator").setData(roomsArr,function(roomName){
            self.joinRoom(roomName);
        });
    },
    onCreateRoomBtn:function(event){
        this.addInputUserNamePanel();
    },
    onRoomListBtn:function(event){
        this.roomListNode.active = true;
        this.mainControll.getSocketServerMediator().getRoomsList();
    },
    onExitBtn:function(event){
        cc.game.exit();
    },
    //添加输入名字节点
    addInputUserNamePanel:function(){
        var self = this;
        var inputNameNodePrefab = Display.getPrefab("InputNameNode");
        var inputNameNode = cc.instantiate(inputNameNodePrefab);
        //输完后回调
        inputNameNode.getComponent("InputNameMediator").setData(function(name){
            if(name == "") return Display.tip("房名不能为空!");
            inputNameNode.getComponent("InputNameMediator").close();
            self.mainControll.getSocketServerMediator().createRoom(name);
            self.initRoomsPanel(name);
        });
        this.node.addChild(inputNameNode);
    },
    initRoomsPanel:function(name){
        var self = this;
        this.buttonLayoutNode.active = false;
        this.roomNode.active = true;
        var params = {name:name,closeCB:function(roomName){
            self.roomNodeCloseCB(roomName);
        },startGameCB:function(userNums){
            self.mainControll.getSocketServerMediator().setPanel(0);
            self.mainControll.getGameControllMediator().setData({playerNums:userNums,mainControll:self.mainControll});
        }};
        this.roomNode.getComponent("RoomNodeMediator").setData(params);
    },
    roomNodeCloseCB:function(roomName){
        this.buttonLayoutNode.active = true;
        this.roomNode.active = false;
        this.mainControll.getSocketServerMediator().exitRoom(roomName);
    },
    joinRoom:function(roomName){
        this.mainControll.getSocketServerMediator().joinRoom(roomName);
        this.initRoomsPanel(roomName);
    }
});
module.exports = BlackNodeMediator;