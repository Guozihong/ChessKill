var OnePlayerConfig = require("GameConfig").OnePlayerConfig;
var PlayerColorConfig = require("GameConfig").PlayerColorConfig;
var NoticeCenter = require("NoticeCenter");
var UserMO = require("UserMO");

cc.Class({
    extends: cc.Component,

    properties: {
        playerNums:{
            default:2,
            type: cc.Integer
        },
        spaceSize:{
            default:50,
            type: cc.Float
        },
        poolSize:{
            default:32,
            type: cc.Integer
        },
        chessNodePrefab:{
            default:null,
            type: cc.Prefab
        },
        chessBoardNode:{
            default:null,
            type:cc.Node
        },
        userColorNode:{
            default:null,
            type:cc.Node
        },
        curUserChessNumsLabel:{
            default:null,
            type:cc.Label
        }
    },

    // use this for initialization
    onLoad: function () {        
        this.onePlayerSize = cc.v2(16,2);
        this.createPool();
        // this.initPanel();        
        this.initEvent();
        this.clearData();
        this.stepNums = 0;
        this.nextPlayerIndex = 0;

        this.curUserColorNode = this.userColorNode.getChildByName("curUserColor");
    },
    clearData:function(){
        //棋盘所有棋子，包括棋盘格子
        this.chessBoardArr = [];
        //用于网络传输的棋盘数据
        this.chessBoardData = [];
        //玩家所剩棋子数
        this.userChessData = [];
        this.lastSelectChessNode = null;
    },
    initEvent:function(){
        var self = this;
        NoticeCenter.addEventListener("selectOneChess",function(event){
            cc.log("selectOneChess");
            self.freshSelectOneChess(event.args);
        });
        NoticeCenter.addEventListener("showCheckBoard",function(event){
            cc.log("showCheckBoard");
            self.freshPanel(event.args);
        });
    },
    setMainControll:function(mainControll){
        this.mainControll = mainControll;
    },
    setData:function(params){
        //设置基础数据
        this.playerNums = params.playerNums;
        this.playerIndex = UserMO.get("playerIndex");        
        //获取单个玩家棋子数据
        var chessArr = this.getChessConfig();
        //setUserChessNums 放在initPanel前
        this.setUserChessNums(chessArr);
        this.initPanel();
        this.createCheckerboard(chessArr);
        //随机获得分配角色
        var mainRole = this.randomRole();
        this.changeOrder(mainRole);
        //通知其它玩家刷新棋盘
        this.mainControll.getSocketServerMediator().freshOtherUserCheckBoard(JSON.stringify(this.chessBoardData),this.playerNums,mainRole);
    },
    initPanel:function(){
        //设置面板大小
        var size = this.getCheckerboardSize();
        this.node.width = size.x;
        this.node.height = size.y;
        //设置颜色栏
        this.userColorNode.active = true;
        this.userColorNode.getChildByName("userColor").color = PlayerColorConfig[this.playerIndex];
    },
    freshPanel:function(params){
        //设置基础数据
        this.playerNums = params.playerNums;
        this.playerIndex = UserMO.get("playerIndex");        
        //获取单个玩家棋子数据
        var chessArr = this.getChessConfig();
        //setUserChessNums 放在initPanel前
        this.setUserChessNums(chessArr);
        this.initPanel();
        //改变开始人为主公下标
        this.changeOrder(params.mainRole);
        this.showCheckBoard(JSON.parse(params.checkBoardArr));
    },
    //设置玩家所剩棋子数
    setUserChessNums:function(chessArr){
        for(var i in chessArr){
            this.userChessData.push(chessArr[i].length);
        }
        this.curUserChessNumsLabel.string = chessArr[0].length;
        //设置根据棋子配置，改变棋盘大小
        var row = Math.floor(chessArr[0].length / 16 * 2);
        this.onePlayerSize = cc.v2(16,row);
    },
    //根据玩家人数，获取各自的初始棋子
    getChessConfig:function(){
        var tempArr = [];
        for(let i = 0;i < this.playerNums;i++){
            tempArr.push(cc.clone(OnePlayerConfig));
        }
        return tempArr;
    },
    //创建棋子
    createCheckerboard:function(chessArr){
        var rowAndColumn = this.getCheckerboardRowAndColumn();
        var empty = false,chessData = false,tempArr = [],chessDataTemp = [];
        for(let row = 0;row < rowAndColumn.y;row++){
            tempArr = [],chessDataTemp = [];
            for(let column = 0;column < rowAndColumn.x;column++){
                empty = false;
                var residueNums = this.getResidueNums(chessArr);
                //所有玩家都没有棋子，返回
                if(0 == residueNums) empty = true;
                //计算棋盘还剩几个格子(剩余的格子数大于剩余棋子数时，随机是否填入棋子)
                var residueChessNums = ((rowAndColumn.y - row - 1) * rowAndColumn.x) + rowAndColumn.x - column;
                if(residueChessNums > residueNums){
                    //随机是否填入棋子
                    if(!this.isCreateNode()) {
                        empty = true;
                        chessData = false;
                    }
                }
                //获取棋子属于哪一个玩家的哪个棋子的数据
                if(!empty) chessData = this.getOneChessData(chessArr);                
                var chessNode = this.getNode();
                //要先设置数据，才能获取位置
                var params = {row:row,column:column,size:this.spaceSize,chessData:chessData,pointer:this,empty:empty};
                this.getScriptByChessNode(chessNode).setData(params);
                //位置自身控制
                this.chessBoardNode.addChild(chessNode);
                tempArr.push(chessNode);
                chessDataTemp.push(chessData);
            }
            this.chessBoardArr.push(tempArr);
            this.chessBoardData.push(chessDataTemp);
        }
    },
    //根据棋盘数据显示棋子
    showCheckBoard:function(chessArr){
        var empty = false,tempArr = [];
        for(let row in chessArr){
            tempArr = []
            for(let column in chessArr[row]){
                empty = false;
                if(!chessArr[row][column]) empty = true;
                var chessNode = this.getNode();
                //要先设置数据，才能获取位置
                var params = {row:row,column:column,size:this.spaceSize,chessData:chessArr[row][column],pointer:this,empty:empty};
                this.getScriptByChessNode(chessNode).setData(params);
                //位置自身控制
                this.chessBoardNode.addChild(chessNode);
                tempArr.push(chessNode);
            }
            this.chessBoardArr.push(tempArr);
        }
    },
    //随机返回一个玩家的配置数据
    getOneChessData:function(chessArr){
        //如果该玩家已经没有棋子，则换一个玩家
        var playerIndex = 0;
        do{
            playerIndex = Math.floor(Math.random() * chessArr.length);
        }while(chessArr[playerIndex].length == 0);
        var chessConfigIndex = Math.floor(Math.random() * chessArr[playerIndex].length);
        var chessConfig = chessArr[playerIndex][chessConfigIndex];
        //清除选过的数据
        chessArr[playerIndex].splice(chessConfigIndex,1);
        return {playerIndex:playerIndex,chessConfig:chessConfig};
    },
    //获得剩余的棋子数
    getResidueNums:function(chessArr){
        var size = 0;
        for(let i in chessArr){
            size += chessArr[i].length;
        }
        return size;
    },
    //获得棋盘的行数，列数
    getCheckerboardRowAndColumn:function(){
        // var v2;        
        return cc.v2(this.onePlayerSize.x,this.onePlayerSize.y*this.playerNums);
    },
    //获得棋盘大小
    getCheckerboardSize:function(){
        // var v2;
        return this.getCheckerboardRowAndColumn().mul(this.spaceSize);
    },
    isCreateNode:function(){
        //概率
        var n = Math.floor(Math.random() * 2);
        return n == 1;
    },
    //创建对象池
    createPool:function(){
        this.nodePool = new cc.NodePool("ChessmanMediator");
        for(let i = 0;i < this.poolSize; i++){
            this.nodePool.put(cc.instantiate(this.chessNodePrefab));
        }
    },
    //获取对象池内的星星节点
    getNode:function(){
        if(this.nodePool.size() > 0){
            return this.nodePool.get();
        }else{
            return cc.instantiate(this.chessNodePrefab);
        }
    },
    //放回对象池
    putNode:function(node){
        this.nodePool.put(node);
    },
    freshSelectOneChess:function(params){
        var chessPos = params.chessNodeData;
        var chessNode = this.chessBoardArr[chessPos.row][chessPos.column];
        var curChessNodeScript = this.getScriptByChessNode(chessNode);
        this.selectOneChess(chessNode,true,params.playerIndex);
        curChessNodeScript.chessTouch();
    },
    selectOneChess:function(chessNode,noTranslate,playerIndex){
        if(playerIndex !== 0 && !playerIndex) playerIndex = this.playerIndex;
        var curChessNodeScript = this.getScriptByChessNode(chessNode);
        //网络发送选择棋子位置(刚从网络受到的不用重复发)
        if(!noTranslate) this.mainControll.getSocketServerMediator().selectOneChess({row:curChessNodeScript.row,column:curChessNodeScript.column});
        //点击没打开的棋子
        if(!curChessNodeScript.isOpen) {
            if(this.lastSelectChessNode) this.getScriptByChessNode(this.lastSelectChessNode).setSelectSpEnabled(false);
            this.lastSelectChessNode = null;  
            this.nextPlayer();
            return;
        }
        if(this.lastSelectChessNode){
            var lastSelectChessNodeScript = this.getScriptByChessNode(this.lastSelectChessNode);
            if(lastSelectChessNodeScript.empty) return this.changeLastChessNode(chessNode);
            //如果两个都是自己的棋子，变换上一个旗子
            if(lastSelectChessNodeScript.getPlayerTag() == curChessNodeScript.getPlayerTag()) {
                this.changeLastChessNode(chessNode);
                return;
            }
            //判断是否可以吃掉前一个
            if(this.judgeCanDestroyChess(chessNode)){
                //销毁前一个，把当前的移过去
                this.eatChess(chessNode);
                this.nextPlayer();
            }
            lastSelectChessNodeScript.setSelectSpEnabled(false);
            this.lastSelectChessNode = null;                
        }else{
            //不是自己的棋子，不让操作
            if(curChessNodeScript.chessData.playerIndex != -1 && playerIndex != curChessNodeScript.chessData.playerIndex) return;
            this.changeLastChessNode(chessNode);
        }
    },
    //变换上一个选中的棋子
    changeLastChessNode:function(chessNode){
        if(this.lastSelectChessNode) this.getScriptByChessNode(this.lastSelectChessNode).setSelectSpEnabled(false);
        this.lastSelectChessNode = chessNode;
        this.getScriptByChessNode(chessNode).setSelectSpEnabled(true);
    },
    //判断是否能吃掉一格棋子
    judgeCanDestroyChess:function(chessNode){
        var lastSelectChessNodeScript = this.getScriptByChessNode(this.lastSelectChessNode);
        var curChessNodeScript = this.getScriptByChessNode(chessNode);
        //距离不够不能吃
        var disRow = Math.abs(lastSelectChessNodeScript.row - curChessNodeScript.row);
        var disColumn = Math.abs(lastSelectChessNodeScript.column - curChessNodeScript.column);
        //两个不在同一行不能吃
        if(disRow != 0 && disColumn != 0) return false;
        //获取两个节点之间其它棋子个数
        var nums = this.getContainOtherChessNums(cc.v2(lastSelectChessNodeScript.column,lastSelectChessNodeScript.row),
            cc.v2(curChessNodeScript.column,curChessNodeScript.row));
        //跑跳吃不管大小
        if(nums == 1 && lastSelectChessNodeScript.moveDis == -2) return true;
        if(nums > 0) return false;
        //判断大小
        var lastSelectChessTag = lastSelectChessNodeScript.getChessTag();
        var curSelectChessTag = curChessNodeScript.getChessTag();
        //兵吃将
        if(lastSelectChessTag == 7 && curSelectChessTag == 1) return true;
        //比自己大的不能吃
        if(lastSelectChessTag > curSelectChessTag && curSelectChessTag != -1) return false;
        //车可以直线行走
        if(lastSelectChessNodeScript.moveDis == -1) return true;
        //炮走一格
        if(lastSelectChessNodeScript.moveDis == -2 && disRow == 1 || disColumn == 1) return true;
        //距离不够不能吃
        if(disRow > lastSelectChessNodeScript.moveDis || disColumn > lastSelectChessNodeScript.moveDis) return false;
        //如果是棋盘，则不用判断大小
        if(curChessNodeScript.empty) return true;
        return true;
    },
    eatChess:function(chessNode){
        var curChessNodeScript = this.getScriptByChessNode(chessNode);
        //判断是不是自己的棋子被吃了，如果是则数量减一
        if(curChessNodeScript.chessData && curChessNodeScript.chessData.playerIndex != -1){
            this.userChessData[curChessNodeScript.chessData.playerIndex] --;
            if(curChessNodeScript.chessData.playerIndex == this.playerIndex){
                this.curUserChessNumsLabel.string = this.userChessData[curChessNodeScript.chessData.playerIndex];
            } 
        }
        //交换两个棋子数据
        this.moveLastChessToCur(chessNode);
    },
    //交换位置
    moveLastChessToCur:function(chessNode){
        var curChessNodeScript = this.getScriptByChessNode(chessNode);
        var lastSelectChessNodeScript = this.getScriptByChessNode(this.lastSelectChessNode);
        //交换数组数据
        var temp = this.chessBoardArr[curChessNodeScript.row][curChessNodeScript.column];
        this.chessBoardArr[curChessNodeScript.row][curChessNodeScript.column] = this.chessBoardArr[lastSelectChessNodeScript.row][lastSelectChessNodeScript.column];
        this.chessBoardArr[lastSelectChessNodeScript.row][lastSelectChessNodeScript.column] = temp;
        //交换节点数据
        curChessNodeScript.eatNode();
        var tempPos = chessNode.position;
        var tempColumn = curChessNodeScript.column;
        var tempRow = curChessNodeScript.row;
        chessNode.position = this.lastSelectChessNode.position;
        curChessNodeScript.column = lastSelectChessNodeScript.column;
        curChessNodeScript.row = lastSelectChessNodeScript.row;
        this.lastSelectChessNode.position = tempPos;
        lastSelectChessNodeScript.column = tempColumn;
        lastSelectChessNodeScript.row = tempRow;
    },
    //判断选择的两个棋子之间有没有其它阻挡的棋子
    getContainOtherChessNums:function(startVec,endVec){
        var columnOffset = endVec.x - startVec.x;
        var rowOffset = endVec.y - startVec.y;
        var nums = 0;
        if(rowOffset != 0){
            var startIndex = startVec.y;
            if(rowOffset < 0) startIndex = endVec.y;
            startIndex = parseInt(startIndex);
            for(let i = startIndex;i < startIndex + Math.abs(rowOffset)+1;i++){
                if(!this.getScriptByChessNode(this.chessBoardArr[i][startVec.x]).empty) nums++;
            }
            nums--;
        }
        if(columnOffset != 0){
            var startIndex = startVec.x;
            if(columnOffset < 0) startIndex = endVec.x;
            startIndex = parseInt(startIndex);
            for(let i = startIndex;i < startIndex + Math.abs(columnOffset)+1;i++){
                if(!this.getScriptByChessNode(this.chessBoardArr[startVec.y][i]).empty) nums++;
            }
            nums--;
        }
        if(!this.getScriptByChessNode(this.chessBoardArr[endVec.y][endVec.x]).empty) nums--;
        return nums;        
    },
    //获取棋子脚本
    getScriptByChessNode:function(chessNode){
        return chessNode.getComponent("ChessmanMediator");
    },
    nextPlayer:function(){
       this.stepNums++;
       this.caculateNextPlayerIndex();
    },
    //设置玩家对应颜色
    setOtherPlayerColor:function(){
        this.curUserColorNode.color = PlayerColorConfig[this.nextPlayerIndex];        
        this.curUserColorNode.getChildByName("label").getComponent(cc.Label).string = this.nextPlayerIndex;        
    },
    isMyOrder:function(){
        return (this.nextPlayerIndex) == this.playerIndex ? true : false;
    },
    //改变谁走第一步次序
    changeOrder:function(num){
        this.nextPlayerIndex+=num;
        this.nextPlayerIndex--;
        this.caculateNextPlayerIndex();
    },
    caculateNextPlayerIndex:function(){
         //计算下一个玩家是谁，如果该玩家没棋了，则跳过
        do{
            this.nextPlayerIndex ++;
            this.nextPlayerIndex = Math.floor(this.nextPlayerIndex % this.playerNums);
        }while(this.userChessData[this.nextPlayerIndex] <= 0)
        this.setOtherPlayerColor();
    },
    randomRole:function(){
        var n = Math.random() * this.playerNums;
        return n;
    }
    
});
