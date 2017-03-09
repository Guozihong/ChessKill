
var NoticeCenter = require("NoticeCenter");
var Display = require("Display");

var RoomsListNodeMediator = cc.Class({
    extends:cc.Component,
    properties:{
        promptLabelNode:{
            default:null,
            type: cc.Node
        },
        roomsLayoutNode:{
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
            self.freshPanel(event.args);
        });
    },
    setData:function(joinRoomCB){
        var self = this;
        this.isReady = false;
        this.joinRoomCB = joinRoomCB;
        //预加载资源
        Display.preload([["Prefabs/roomsCard",cc.Prefab]],function(isFinished,per){
            if(isFinished) {
                self.isReady = true;
            }
        });
    },
    freshPanel:function(roomsArr){
        var self = this;
        if(!this.isReady) {
            setTimeout(function(){
                self.initPanel(roomsArr);
            },200);
            return;
        }
        this.initPanel(roomsArr);
    },
    initPanel:function(roomsArr){
        //判断是否有房间
        this.roomsLayoutNode.removeAllChildren();
        if(roomsArr.length == 0) {
            this.promptLabelNode.active = true;
            return;
        }
        else this.promptLabelNode.active = false;

        for(let i in roomsArr){
            var roomsLabel = this.getRoomsLabel();
            roomsLabel.string = roomsArr[i];
        }
    },
    getRoomsLabel:function(str){
        var roomsNodePrefab = Display.getPrefab("roomsCard");
        var roomsNode = cc.instantiate(roomsNodePrefab);
        this.roomsLayoutNode.addChild(roomsNode);
        this.addRoomBtnHandle(roomsNode);
        return roomsNode.getChildByName("label").getComponent(cc.Label);
    },
    onExitBtn:function(event){
        this.node.active = false;
    },
    addRoomBtnHandle:function(roomBtnNode){
        var roomBtn = roomBtnNode.getComponent(cc.Button);
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = "RoomsListNodeMediator";
        eventHandler.handler = "OnRoomBtnClick";
        roomBtn.clickEvents.push(eventHandler);
    },
    OnRoomBtnClick:function(event){
        cc.log("ok");
        var target = event.currentTarget;
        var roomName = target.getChildByName("label").getComponent(cc.Label).string;
        this.joinRoomCB(roomName);
        this.onExitBtn();
    }
});
module.exports = RoomsListNodeMediator;