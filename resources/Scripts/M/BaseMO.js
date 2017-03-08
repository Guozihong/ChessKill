var utils = require("utils");
var BaseMO = cc.Class({
    name:"BaseMO",
    ctor:function(){
        cc.log("BaseMO");
        this.data = {};
    },
    set:function(key,data){
        cc.assert(key,"key is null");
        this.data[key] = data;
    },
    get:function(key){
        cc.assert(key,"key is null");
        return this.data[key];
    },
});
module.exports = BaseMO;