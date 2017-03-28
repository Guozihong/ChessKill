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

GameConfig.RoleConfig = {
    Master:1,//主公
    Rebel:2,//反贼
    Mole:3,//内奸
    Loyal :4,//忠臣
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
];
//颜色配置，也是房间人数配置
GameConfig.PlayerColorConfig = [
    new cc.hexToColor("#44F174"),//GREEN
    new cc.hexToColor("#F1D644"),//YELLOW
    new cc.hexToColor("#F144EA"),//PURPLE
    new cc.hexToColor("#D62F2F"),//RED
    new cc.hexToColor("#303FE9"),//deepBlue
    new cc.hexToColor("#30DAE9"),//skyBlue
    new cc.hexToColor("#F197BB"),//pink
];
//角色配置
var RoleConfig = GameConfig.RoleConfig;
GameConfig.PlayerRoleConfig = [
    [RoleConfig.Master,RoleConfig.Rebel],//两个人
    [RoleConfig.Master,RoleConfig.Rebel,RoleConfig.Mole],//三个人
    [RoleConfig.Master,RoleConfig.Rebel,RoleConfig.Rebel,RoleConfig.Mole],//四个人
    [RoleConfig.Master,RoleConfig.Rebel,RoleConfig.Rebel,RoleConfig.Mole,RoleConfig.Loyal],//五个人
    [RoleConfig.Master,RoleConfig.Rebel,RoleConfig.Rebel,RoleConfig.Mole,RoleConfig.Loyal,RoleConfig.Loyal],//六个人
    [RoleConfig.Master,RoleConfig.Rebel,RoleConfig.Rebel,RoleConfig.Rebel,RoleConfig.Mole,RoleConfig.Loyal,RoleConfig.Loyal],//七个人
];
module.exports = GameConfig;