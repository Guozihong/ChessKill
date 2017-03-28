//加载资源枚举
var SourceTypeEnum = cc.Enum({
    'Asset' : 1,
    'RawAsset' : 2
});
var utils = require("utils");
var Display = cc.Class({
    name:"Display",
    properties: {
        //所有预置的引用
        perfabMaps : {
            default:{}
        },
        //所有图片帧的引用
        spriteFrameMaps:{
            default:{}
        },
        //所有图集的引用
        spriteAtlasMaps:{
            default:{}
        },
        //所有地图引用
        tiledMapAssetMaps:{
            default:{}
        },
        urlToNameMap:{
            default:{}
        },
        //资源的load计数
        //如果计不为0不release
        sourceReferenceCount:{
            default:{}
        }
    },
    ctor: function () {
        // 声明实例变量并赋默认值
        this._isLoading = false
        this._loadingHandle_ = {};//当前进行中的loading
        cc.log("Display:ctor");
    },
    getRunningScene:function(){
        return cc.director.getScene()
    },
    getRunningSceneMediator(){
        var scene = cc.director.getScene();
        var name = scene.getName()
        var sceneMediator = scene._sgNode.getComponent(name+'SceneMediator')
    },
    //添加精灵图集框架
    //如果plist和png资源均未预加载则会触发io 
    //可理解为阻塞式加载
    addSpriteFrames:function(plist, png)
    {
        cc.spriteFrameCache.addSpriteFrames(plist, png) 
    },
    /**
     * 预加载
     * @param  {[type]}   list   [description]
     * @param  {Function} cb     [description]
     * @param  {[type]}   isOrd [是否顺序加载 顺序加载便于更新ui 并发加载有利于提高速度]
     * @return {[type]}          [description]
     */
    preload : function(list, cb, isOrd)
    {
        // cc.log("preload", list)
        var total = list.length
        if (total == 0) return cb(true, 100);
        // var _t = 0
        var self = this;
        // var type = '';
        // var url = "";

        // }
        if (isOrd) {//排队方式加载
            var _tick = false;
            var _tick = function(){
                var cell = list.shift();
                var url = cell[0], type = cell[1];
                self.load(url, type, function(is, per){
                    var left = list.length;
                    if (left == 0) return cb(true, 100);
                    var per = parseInt(100 * (total - left) / total)
                    cb(false, per);
                    setTimeout(function(){
                        _tick();
                    }, 0)
                });
            }
            _tick();
        } else {//并发方式加载
            var _done = 0;
            var _tick = function(cell){
                var url = cell[0], type = cell[1];
                self.load(url, type, function(is, per){
                    _done++;
                    if (_done == total) return cb(true, 100);
                    var per = parseInt(100 * (_done) / total)
                    cb(false, per);
                });
            };
            for (var i in list) {
                if(!list[i]) continue;
                _tick(list[i]);
            }
        }
    },
    //  _doLoad_: function(url, type, index, cb, intval) {
    //     var self = this;
    //     setTimeout(function () {
    //         self.load(url, type, cb);
    //     }, index * intval);
    // },
    /**
     * 释放资源
     * @param  {[type]} url [description]
     * @return {[type]}     [description]
     */
    releaseRes:function(url){
        // cc.log("display release", url, this.sourceReferenceCount[url])
        if (!this.sourceReferenceCount[url]) this.sourceReferenceCount[url] = 0;
        this.sourceReferenceCount[url]--;
        if (this.sourceReferenceCount[url] <= 0) {
            var name = this.urlToNameMap[url];
            // cc.log("display release", url, this.sourceReferenceCount[url])
            if (this.perfabMaps[name]) {
                if(CC_JSB){
                    var deps = cc.loader.getDependsRecursively(this.perfabMaps[name]);
                    cc.loader.release(deps);
                    delete this.perfabMaps[name];
                }
            }
            if (this.spriteFrameMaps[name]) {
                if(CC_JSB){
                    var deps = cc.loader.getDependsRecursively(this.spriteFrameMaps[name]);
                    cc.loader.release(deps);                
                    delete this.spriteFrameMaps[name];
                }
            }
            if (this.spriteAtlasMaps[name]) {
                if(CC_JSB){
                    var deps = cc.loader.getDependsRecursively(this.spriteAtlasMaps[name]);
                    cc.loader.release(deps);   
                    delete this.spriteAtlasMaps[name];
                }
            }
            if (this.tiledMapAssetMaps[name]) delete this.tiledMapAssetMaps[name];
            // cc.loader.releaseRes(url)
            // cc.loader.release(url)
            delete this.urlToNameMap[url];
        }
    },
    //加载预制资源
    //image.png/image, prefab, anim
    //url:View/UI/DarkMaskLayer 对应 /assert/resource/View/UI/DarkMaskLayer
    //如果有图集图片等包函在预制中则会被同步加载
    load:function(url, type, cb){
        // cc.log("loadAsset", url)
        var self = this;
        if (!this.sourceReferenceCount[url]) this.sourceReferenceCount[url] = 0;
        this.sourceReferenceCount[url]++;
        if (!this._loadingHandle_[url]) this._loadingHandle_[url] = [];
        this._loadingHandle_[url].push(cb);
        if (this._loadingHandle_[url].length > 1) return;//防止重复请求同一个文件
        var _call = function(url, err, res){
            self._loadingHandle_[url].forEach(function(cb){
                cb(err, res);
            })
            delete self._loadingHandle_[url];
        }
        cc.loader.loadRes(url, type, function (err, res) {
            if (err) {
                self.sourceReferenceCount[url] = 0;//没有加载成功
                cc.error(err)
                return _call(url, err, res)
            }
            var name = res._name;
            self.urlToNameMap[url] = name;
            if (res instanceof cc.Prefab) {
                self.perfabMaps[name] = res;
            } else if (res instanceof cc.SpriteFrame) {
                self.spriteFrameMaps[name] = res
            } else if (res instanceof cc.SpriteAtlas) {
                self.spriteAtlasMaps[name] = res
            } else if (res instanceof cc.TiledMapAsset) {
                self.tiledMapAssetMaps[name] = res
            } 
            cc.log("display load cb", url)
            // cc.log(self.spriteFrameMaps)
            // cc.log(self.spriteAtlasMaps)
            _call(url, err, res)
        });
    },

    loadJson:function(url, cb){
        cc.loader.loadRes(url, cc.RawAsset, function (err, res) {
            cb(err, res)
        })
    },

    //加载图片图集等资源文件
    //加载plist会自动加载对应的Png 
    //url 写法 textures/combat_enveffect_bosswarn.plist 对应 asset/resource/textures/combat_enveffect_bosswarn.plist
    loadRawAsset:function(url, cb){
        cc.loader.loadRes(url, function (err, spriteFrame) {
            cc.log("combat_enveffect_bosswarn done", err, spriteFrame)
            cb(err, spriteFrame)
        });
    },
    
    //在当前场影弹出一个tip提示
    tip : function(message){
        cc.log("diaplay.tip", "message")
        var prefabNme = 'Prefabs/Tip'
        this.loadPerfab(prefabNme, function(err, prefab){
            if (err) return cc.assert(err, prefabNme+'加载失败');
            var viewNode = cc.instantiate(prefab);
            var label = viewNode.getComponentInChildren(cc.Label)
            label.string = message
            cc.director.getScene().addChild(viewNode,30);
        })
    },
    loadPerfab : function(perfabName, cb){
        if (this.perfabMaps[perfabName]) return cb(false, this.perfabMaps[perfabName])
        this.load(perfabName, cc.Prefab,function(err, prefab){
            if (err) return cb(err);
            cb(false, prefab)
        })
    },
    getPrefab : function(perfabName){
        return this.perfabMaps[perfabName]
    },
    getSpriteFrame:function(frameName){
        // cc.log("getSpriteFrame", frameName)
        if (frameName.indexOf("#") >= 0) {//如果是指定atlas提取帧
            var arr = frameName.split("#");
            var atlas = this.spriteAtlasMaps[arr[0]+'.plist'];
            frameName = arr[1];
            if (atlas && atlas.getSpriteFrame(frameName)) {
                return atlas.getSpriteFrame(frameName);
            }
        }
        if (this.spriteFrameMaps[frameName]) return this.spriteFrameMaps[frameName];
        for (var atlasName in this.spriteAtlasMaps) {
            var atlas = this.spriteAtlasMaps[atlasName]
            if (atlas.getSpriteFrame(frameName)) return atlas.getSpriteFrame(frameName);
        }
        cc.assert(false, "frameName:"+frameName+'不存在');
    },
    /**
     * 从预加载的图集中根据frameName获取一个精灵
     * @param  {[type]} frameName [description]
     * @return {[type]}           [description]
     */
    getSprite:function(frameName){
        var node = new cc.Node("New Sprite");
        var sprite = node.addComponent(cc.Sprite);
        var spriteFrame = this.getSpriteFrame(frameName)
        if (spriteFrame) sprite.spriteFrame = spriteFrame;
        return node
    },
    //判断是否有这个图片
    judgeSpriteFrame:function (frameName) {
        if (this.spriteFrameMaps[frameName]) return this.spriteFrameMaps[frameName];
        for (var atlasName in this.spriteAtlasMaps) {
            var atlas = this.spriteAtlasMaps[atlasName]
            if (atlas.getSpriteFrame(frameName)) return true;
        }
        return false
    },
    getTmxAsset:function(tmxName){
        if (this.tiledMapAssetMaps[tmxName]) return this.tiledMapAssetMaps[tmxName];
        return false
    },
    /**
     * 锁UI 阻止所有用户交互
     * @return {[type]} [description]
     */
    lockUI:function(){
        this.lockViewUI();
    },
    unLockUI:function(){
        cc.log("unLockUI", new Date().getTime())
        // require('GM').getRunningSceneMediator().unLockUI();
    },
    /**
     * 视图层锁UI 阻止所有用户交互
     * @return {[type]} [description]
     */
    lockViewUI:function(){
        cc.log("lockViewUI", new Date().getTime())
        // require('GM').getRunningSceneMediator().lockUI();
        utils.delayDo(2, function(){
            cc.log("lockUI next")
            // require('GM').getRunningSceneMediator().unLockUI();
        })
    },
    /**
     * 展示加载中的动态
     * @return {[type]} [description]
     */
    showLoading:function(){
        if (this._isLoading) return;
        this._isLoading = true;
        // var runningSceneMediator = require('GM').getRunningSceneMediator()
        if (!runningSceneMediator) return;
        runningSceneMediator.showLoading();
        runningSceneMediator.lockUI(10);
    },
    hideLoading:function(){
        if (!this._isLoading) return;
        this._isLoading = false;
        // var runningSceneMediator = require('GM').getRunningSceneMediator()
        if (!runningSceneMediator) return;
        runningSceneMediator.hideLoading();
        runningSceneMediator.unLockUI();
    },
    /**
     * 功能：动画
     * author：gzh
     */
    viewFadeIn:function(node,interval,cb)
    {
        cc.log("viewFadeIn")
        if(!node) return 
        if(!interval) interval = 0.4;
        node.opacity = 0;
        var func = cc.callFunc(function(){
            if(cb) cb();
        });
        node.runAction(cc.sequence(cc.fadeIn(interval).easing(cc.easeIn(interval)),func));
    },
    viewFadeOut:function(cb,node,interval)
    {
        var func = cc.callFunc(function(){
            if(cb) cb();
        });
        if(!node) return 
        if(!interval) interval = 0.4;
        node.runAction(cc.sequence(cc.fadeOut(interval).easing(cc.easeIn(interval)),func));
    },
    viewScaleTo:function(cb,node,interval,size)
    {
        if(!node) return 
        if(!interval) interval = 0.4;
        if(size) node.scale = 0;
        var func = cc.callFunc(function(){
            if(cb) cb();
        });
        node.runAction(cc.sequence(cc.scaleTo(interval,size),func));
    },
});

module.exports = new Display();