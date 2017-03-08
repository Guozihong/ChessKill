var utils = require("utils")
var NoticeCenter = cc.Class({
    name:"NoticeCenter",
    properties: {
        eventMap : {
            default : {}
        },
        handle : 1
    },
    ctor: function () {
        // 声明实例变量并赋默认值
        cc.log("NoticeCenter:ctor");
    },
    //添加关注事件 并设置响应层级
    //默认层级为1
    //
    addEventListener:function(eventName, next, level){
        cc.assert(eventName, "事件为空");
        eventName = eventName.toUpperCase();//转换成大写
        level = level || 1;
        // cc.log(level)
        cc.assert(level <= 100 && level  >= 0, "响应层级必须从0到100")//为false的时候触发
        this.handle++;
        var handle = this.handle
        if (utils.empty(this.eventMap[eventName])) this.eventMap[eventName] = {};
        if (utils.empty(this.eventMap[eventName][level])) this.eventMap[eventName][level] = {};
        this.eventMap[eventName][level][handle] = next
        return handle
    },
    //按响应层级派发事件
    //并传递参数
    dispatchEvent:function(eventName, args){
        cc.assert(eventName, "事件为空");
        var eventVO = {
            name : eventName,
            args : args
        }
        eventName = eventName.toUpperCase();
        if (!this.eventMap[eventName]) return;
        for (var i = 100; i >=0; i--) {
            if (utils.empty(this.eventMap[eventName][i])) continue;
            for (var handle in this.eventMap[eventName][i]) {
                this.eventMap[eventName][i][handle](eventVO)
            }
        }
    },
    //移除某个监听
    removeEventListener:function(handle){
        // cc.log("removeEventListener", handle)
        for (var eventName in this.eventMap) {
            for (var level in this.eventMap[eventName]) {
                for (var _handle in this.eventMap[eventName][level]) {
                    // cc.log(_handle, handle)
                    if (_handle == handle) {
                        delete this.eventMap[eventName][level][_handle]
                    }
                }
            }
        }
    },
    //移除所有监听
    removeAllEventListener:function(){
        this.eventMap = {};
    },
});

module.exports = new NoticeCenter();