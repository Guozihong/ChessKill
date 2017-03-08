var GameConfig = {};
GameConfig.ChessConfig = {
    King:1,//将
    Mandarins:2,//士
    Elephants:3,//象
    Rooks:4,//车
    Knights:5,//马 
    Cannons:6,//炮 
    Pawns:7,//卒
};

var ChessConfig = GameConfig.ChessConfig;
//一个玩家有的棋子
GameConfig.OnePlayerConfig = [
    ChessConfig.King,//将一个
    ChessConfig.Mandarins,ChessConfig.Mandarins,//士两个
    ChessConfig.Elephants,ChessConfig.Elephants,//象两个
    ChessConfig.Rooks,ChessConfig.Rooks,//车两个
    ChessConfig.Knights,ChessConfig.Knights,//马两个
    ChessConfig.Cannons,ChessConfig.Cannons,//炮两个
    ChessConfig.Pawns,ChessConfig.Pawns,ChessConfig.Pawns,ChessConfig.Pawns,ChessConfig.Pawns,//兵两个

    ChessConfig.Mandarins,ChessConfig.Mandarins,//士两个
    ChessConfig.Elephants,ChessConfig.Elephants,//象两个
    ChessConfig.Rooks,ChessConfig.Rooks,//车两个
    ChessConfig.Knights,ChessConfig.Knights,//马两个
    ChessConfig.Cannons,ChessConfig.Cannons,//炮两个
    ChessConfig.Pawns,ChessConfig.Pawns,ChessConfig.Pawns,ChessConfig.Pawns,ChessConfig.Pawns,//兵两个
];

GameConfig.PlayerColorConfig = [
    new cc.hexToColor("#44F174"),//GREEN
    new cc.hexToColor("#F1D644"),//YELLOW
    new cc.hexToColor("#F144EA"),//PURPLE
    new cc.hexToColor("#D62F2F"),//RED
];
module.exports = GameConfig;