var ChessConfig = require("GameConfig").ChessConfig;
var PlayerColorConfig = require("GameConfig").PlayerColorConfig;

cc.Class({
    extends: cc.Component,
    properties: {
        chessLabel:{
            default:null,
            type: cc.Label
        },
        selectSpNode:{
            default:null,
            type: cc.Node
        }
    },
    // use this for initialization
    onLoad:function () {
        this.isOpen = false;
        var pos = this.getNodePos();
        this.node.x = pos.x;
        this.node.y = pos.y;
        this.moveDis = 1;//棋子默认移动距离
        //打开       
        if(this.empty) this.setChessNodeToEmpty();
        // if(this.chessData) this.setContent(this.chessData);
    },
    setData:function(params){
        this.column = params.column || 0;
        this.row = params.row || 0;
        this.chessSize = params.size || 0;
        this.chessData = params.chessData;
        this.gameControll = params.pointer;
        this.empty = params.empty;  
        
    },
    //获取棋子位置
    getNodePos:function(){
        var size = this.chessSize;
        return cc.v2(size*this.column, size*this.row).addSelf(cc.v2(size/2,size/2));
    },
    //显示棋子内容
    setContent:function(chessData){
        var str = this.getChessStr(chessData.chessConfig);
        //获得玩家颜色
        var color = PlayerColorConfig[chessData.playerIndex];
        this.chessLabel.node.color = color;
        this.chessLabel.string = str;
    },
    getChessStr:function(chessConfig){
        var str = "none";
        switch(chessConfig){
            case ChessConfig.King:{
                str = "将";
                this.moveDis = 1;
                break;
            }
            case ChessConfig.Mandarins:{
                str = "士";
                this.moveDis = 2;
                break;
            }
            case ChessConfig.Elephants:{
                str = "象";
                this.moveDis = 3;
                break;
            }
            case ChessConfig.Rooks:{
                str = "車";
                this.moveDis = -1;//没有限制，直线就可以
                break;
            }
            case ChessConfig.Knights:{
                str = "马";
                this.moveDis = 4;
                break;
            }
            case ChessConfig.Cannons:{
                str = "炮";
                this.moveDis = -2; //移动一格，或中间有一个可以跳
                break;
            }
            case ChessConfig.Pawns:{
                str = "卒";
                this.moveDis = 1;
                break;
            }
        }
        return str;
    },
    onChessTouch:function(event){
        //判断是否轮到操作
        if(!this.gameControll.isMyOrder()) return;
        //如果没打开则打开
        // if(this.isOpen){
        this.gameControll.selectOneChess(event.currentTarget);
        // }
        this.chessTouch();
    },
    chessTouch:function(){
        if(!this.isOpen) {
            this.isOpen = true;
            if(this.chessData) this.setContent(this.chessData);
        }
    },
    getOpenState:function(){
        return this.isOpen;
    },
    getPlayerTag:function(){
        return this.chessData.playerIndex;
    },
    getChessTag:function(){
        return this.chessData.chessConfig;
    },
    eatNode:function(){
        var chessConfig = this.chessData.chessConfig;
        if(!this.empty){
            this.setChessNodeToEmpty();
        }
        return chessConfig;
    },
    setChessNodeToEmpty:function(){
        this.empty = true;
        this.node.opacity = 0;
        this.isOpen = true;
        if(this.chessData) {
            this.chessData.playerIndex = -1;
            this.chessData.chessConfig = -1;
        }
    },
    setSelectSpEnabled:function(enable){
        this.selectSpNode.active = enable;
    }
});

