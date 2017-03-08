
var NoticeCenter = require("NoticeCenter");
var Display = require("Display");
var UserMO = require("UserMO");

cc.Class({
    extends: cc.Component,

    properties: {
        gameNode:{
            default:null,
            type: cc.Node
        },
        blackNode:{
            default:null,
            type: cc.Node
        }
    },

    // use this for initialization
    onLoad: function () {
        this.initTouchEvent();
        this.initEvent();
        this.socketServerMediator = this.node.getComponent("ScoketServer");
        this.blackNodeMediator = this.blackNode.getComponent("BlackNodeMediator");
        this.gameControll = this.gameNode.getComponent("GameControll");

        this.blackNodeMediator.setMainControll(this);
        this.gameControll.setMainControll(this);        
        this.userName = "";     

        var self = this;
        //预加载资源
        Display.preload([["Prefabs/InputNameNode",cc.Prefab]],function(isFinished,per){
            if(isFinished) self.initPanel();
        });
    },
    initEvent:function(){
        var self = this;
        NoticeCenter.addEventListener("disconnectServer",function(event){
            cc.log("disconnectServer");
            self.freshPanel();
        });
        NoticeCenter.addEventListener("connected",function(event){
            cc.log("connected");
            self.doConnected();
        });
        NoticeCenter.addEventListener("setBlackNodeActive",function(event){
            cc.log("connected");
            self.setBlackNodeActive(event.args);
        });
       
    },
    initTouchEvent:function(){
        var self = this;
        // this.node.on("touchmove",this.onTouchMove,this);      
        //单点触摸事件监听  
        var listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (keyCode, event) {
                return true;
            },
            onTouchMoved: function (keyCode, event) {
                if(self.isNeedMoveX()) {
                    self.gameNode.x -= (keyCode._prevPoint.x - keyCode._point.x);
                }
                if(self.isNeedMoveY()) {
                    self.gameNode.y -= (keyCode._prevPoint.y - keyCode._point.y);
                }
            },
            onTouchEnded: function (keyCode, event) {
                
            },
        });
        cc.eventManager.addListener(listener,this.node);
    },
    onTouchMove:function(event){
        cc.log("touchmove");
        if(this.isNeedMoveX()) {
            this.gameNode.x += event.getDelta().x;
        }
        if(this.isNeedMoveY()) {
            this.gameNode.y += event.getDelta().y;
        }
    },
    isNeedMoveX:function(){
        return cc.winSize.width < this.gameNode.width; 
    },
    isNeedMoveY:function(){
        return cc.winSize.height < this.gameNode.height; 
    },
    getBlackNodeMediator:function(){
        return this.blackNodeMediator;
    },
    getSocketServerMediator:function(){
        return this.socketServerMediator;
    },
    getGameControllMediator:function(){
        return this.gameControll;
    },
    initPanel:function(){
        this.setBlackNodeActive(true);
        this.connecServer();
    },
    freshPanel:function(){
        //初始化面板，是否连上服务器
        if(this.socketServerMediator.connectStatus()) this.blackNodeMediator.initConnectServerPanel();
        else this.blackNodeMediator.initDisConnectServerPanel();
    },
    doConnected:function(){
        if(this.userName == "") this.addInputUserNamePanel();
        this.freshPanel();
    },
    //添加输入名字节点
    addInputUserNamePanel:function(){
        var self = this;
        var inputNameNodePrefab = Display.getPrefab("InputNameNode");
        var inputNameNode = cc.instantiate(inputNameNodePrefab);
        //输完后回调
        inputNameNode.getComponent("InputNameMediator").setData(function(name){
            inputNameNode.getComponent("InputNameMediator").close();
            self.setUserName(name);
            self.freshPanel();
        });
        this.node.parent.addChild(inputNameNode);
    },
    connecServer:function(){
        this.socketServerMediator.openClient();
    },
    setUserName:function(str){
        if(str != "") this.userName = str;
        else this.userName = "默认";
        UserMO.set("userName",this.userName);
    },
    setBlackNodeActive:function(enable){
        this.blackNode.active = enable;
    }
});
