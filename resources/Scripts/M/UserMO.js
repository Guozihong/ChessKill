var BaseMO = require("BaseMO");
var N = require("NoticeCenter");

var UserMO = cc.Class({
    name:"UserMO",
    extends:BaseMO,
    ctor:function(){
        this.data["userId"] = null;
        this.data["userName"] = "";
        this.data["playerIndex"] = 0;
        this.initEvent();
    },
    initEvent:function(){
        var self = this;
        N.addEventListener("connected",function(event){
            self.set("userId",event.args.userId);
        });
        N.addEventListener("playerIndex",function(event){
            self.set("playerIndex",event.args - 1);
        });
    }
});
module.exports = new UserMO();