
var InputNameMediator = cc.Class({
    extends:cc.Component,
    properties:{
        inputUserNameEditbox:{
            default:null,
            type: cc.EditBox
        },
    },
    onLoad:function(){
    },
    setData:function(cb){
        this.cb = cb;
    },
    onCreateUserBtn:function(event){
        this.cb(this.inputUserNameEditbox.string);
        this.close();
    },
    onExitBtn:function(event){
        this.cb(this.inputUserNameEditbox.string);
    },
    close:function(){
        this.node.destroy();
    }
});
module.exports = InputNameMediator;