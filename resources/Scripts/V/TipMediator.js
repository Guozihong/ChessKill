
var TipMediator = cc.Class({
    extends:cc.Component,
    properties:{
    },
    onLoad:function(){
       var self = this;
       this.node.opacity = 0;
       var action_1 = cc.fadeIn(0.5);
       var action_2 = cc.delayTime(1);
       var action_3 = cc.moveBy(1,0,600);
       var action_4 = cc.callFunc(function(){
           self.node.destroy();
       });
       var action_5 = cc.sequence(action_1,action_2,action_3,action_4);
       this.node.runAction(action_5);
    },
    
});
module.exports = TipMediator;