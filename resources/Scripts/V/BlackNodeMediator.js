
var NoticeCenter = require("NoticeCenter");
var Display = require("Display");
var UserMO = require("UserMO");
var utils = require("utils");
var PlayerColorConfig = require("GameConfig").PlayerColorConfig;

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
        // NoticeCenter.addEventListener("roomsListChange",function(event){
        //     cc.log("roomsListChange");
        //     self.freshRoomsListPanel(event.args);
        // });
    },
    setMainControll:function(pointer){
        this.mainControll = pointer;
    },
    //设置联网界面
    initConnectServerPanel:function(){
        this.promptLabelNode.active = false;
        this.buttonLayoutNode.active = true;
    },
    //设置未联网界面
    initDisConnectServerPanel:function(){
        this.promptLabelNode.active = true;
        this.buttonLayoutNode.active = false;
    },
    //创建房间
    onCreateRoomBtn:function(event){
        this.addInputUserNamePanel();
    },
    //房间列表按钮
    onRoomListBtn:function(event){
        var self = this;
        this.roomListNode.active = true;
        this.roomListNode.getComponent("RoomsListNodeMediator").setData(function(roomName){
            self.joinRoom(roomName);
        });
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
            var nums = utils.size(PlayerColorConfig)
            self.mainControll.getSocketServerMediator().createRoom(name,nums);
            self.initRoomsPanel(name);
        });
        this.node.addChild(inputNameNode);
    },
    //设置房间数据
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
    //关闭房间回调
    roomNodeCloseCB:function(roomName){
        this.buttonLayoutNode.active = true;
        this.roomNode.getComponent("RoomNodeMediator").setRoomNodeActive(false);
        //如果是房主退出，则解散房间
        var playerIndex = UserMO.get("playerIndex");
        if(playerIndex == 0)this.mainControll.getSocketServerMediator().disBandRoom(roomName);
        else this.mainControll.getSocketServerMediator().exitRoom(roomName);
    },
    joinRoom:function(roomName){
        var self = this;
        this.mainControll.getSocketServerMediator().joinRoom(roomName,function(result){
            if(result.res) {
                self.roomListNode.getComponent("RoomsListNodeMediator").onExitBtn();
                self.initRoomsPanel(roomName);
            }
            else Display.tip(result.msg);
        });
        
    }
});
module.exports = BlackNodeMediator;