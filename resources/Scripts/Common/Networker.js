// //系统网络请求库
// var NetErrCode = cc.Enum({
//     NetFaild : 3001,
//     WrongJson : 3002,
//     ServerErr : 3003,
//     LogicFaild: 3004,//服务端逻辑错误
// })
// var utils = require('utils')
// var display = require("Display")
// var init = require("init")
// var InitConfig = require("InitConfig")
// var MD5 = require("md5")
// var Networker = cc.Class({
//     name : "Networker",
//     properties: {
//     },
//     ctor:function(){
//         this._requestQueue = [];
//         this._doingRequestVO = false;
//         cc.director.getScheduler().schedule(this.update, this, 0.1);
//     },

//     update:function(ticks){
//         this.tickLoading();
//     },

//     tickLoading:function(){
//         if (this._doingRequestVO.isForbidLoading) return;
//         if (this._doingRequestVO && new Date().getTime() - this._doingRequestVO.startTime > 500) {
//             display.showLoading()
//         }
//         if (!this._doingRequestVO) {
//             display.hideLoading()
//         }
//     },

//     buildQuery : function(params){
//         var query = "";
//         for (var key in params) {
//             query += "&" + key + "=" + params[key];
//         }
//         return query === '' ? query : query.substring(1);
//         // var formData = new FormData();
//         // for (var key in params) {
//         //     if (!params[key]) continue;
//         //     formData.append(key, params[key]);
//         // }
//         // return formData;
//     },
//     parseQuery : function(query)
//     {
//         var param = {}
//         var item = [];
//         var list = query.split('&');
//         for(var i = 0; i < list.length; i++) {
//             item = list[i].split('=');
//             if (typeof param[item[0]] == "undefined") {
//                 param[item[0]] = [];
//             }
//             param[item[0]].push(item[1]);
//         }
//         return param;
//     },
//     _getCenterUrl : function(){
//         var url = InitConfig.KCGameSetting[init.GAMEID].centerUrl
//         // return 'http://c.lc-ww.mmgame.net/index.php/ajaxgateway/index'
//         return url
//     },
//     _getServerUrl : function(serverId){
//         // var url = 'http://s{serverId}.lc-ww.mmgame.net/index.php/ajaxgateway/index'
//         // var url = 'http://s{serverId}.ww.mmgame.net:8081/index.php/ajaxgateway/index'
//         var url = InitConfig.KCGameSetting[init.GAMEID].serverUrl
//         return url.replace('{serverId}', serverId)
//     },
//     buildURI : function(requestVO){
//         if (requestVO.url) return requestVO.url;
//         requestVO.s = require('GM').U().getMO('userMO').get('userLoginServerId');
//         var url = requestVO.isCenter ? this._getCenterUrl() : this._getServerUrl(requestVO.s)
//         // cc.log("buildURI", url)
//         return url + '/' + requestVO.a + '/' + requestVO.m 
//     },
//     //拼合cookiekey
//     mergeCookieUserKey :function(requestVO){
//         if (!requestVO.isNeedCookie) return requestVO;
//         var userMO = require("GM").U().getMO('userMO')
//         requestVO.data.cookieUserKey = userMO.get("cookieUserKey")
//         requestVO.data.cookieUserId = userMO.get("cookieUserId") ? parseInt(userMO.get("cookieUserId")) : 0
//         return requestVO
//     },
//     mergeLang:function(requestVO){
//         requestVO.data.L = require('GM').U().getMO('userMO').getLanguage();//1chinese 2 english
//         // requestVO.data.L = 1;
//         return requestVO
//     },
//     mergeRequestId : function(requestVO){
//         if (!utils.empty(requestVO.data.rid)) return requestVO;
//         var ucId = require("GM").U().getMO('userMO').get('ucId')
//         var source = {
//             a : requestVO.a,
//             m : requestVO.m,
//             url : requestVO.url,
//             data : requestVO.data,
//             time :  (new Date()).valueOf(),
//             rand : Math.random() * 100000,
//             ucId :ucId
//         }
//         var baseString = JSON.stringify(source);
//         var hashString = MD5(baseString);
//         cc.log("rid", hashString)
//         requestVO.data['rid'] = hashString;
//         return requestVO
//     },
//     post : function(url, params, cb){
//         var query = params ? this.buildQuery(params) : '';
//         var xhr = new XMLHttpRequest();
//         xhr.timeout = 10000;
//         xhr.ontimeout = function(event){
//             cb(NetErrCode.NetFaild)
//             cc.log("请求超时", url)
//         };
//         xhr.onerror = function(){
//             cb(NetErrCode.NetFaild, "error code:"+xhr.status)
//             cc.log("请求错误", "error code:"+xhr.status)
//         };
//         xhr.onload = function(){
//              if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304){
//                 var res = xhr.responseText;
//                 var json = false;
//                 try {
//                     json = JSON.parse(res)
//                 } catch (e) {
//                     cc.log("JSON格式错误", res)
//                     return cb(NetErrCode.WrongJson, res)
//                 }
//                 if (!json) return cb(NetErrCode.WrongJson);
//                 if (json.code) return cb(NetErrCode.LogicFaild, json);
//                 cb(false, json);
//             } else {
//                 cb(NetErrCode.ServerErr);
//                 cc.log("服务端返回异常");
//             }
//         };
//         xhr.onreadystatechange = function(){
//             // cc.log(xhr.readyState)
//         };
//         xhr.open("POST", url, true);
//         xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");  
//         try{
//             xhr.send(query);
//         } catch(err) {
//             cb(NetErrCode.NetFaild, err)
//             cc.err("send err", err)
//         };
//     },
    
//     get : function(url, params, cb)
//     {
//         var query = params ? this.buildQuery(params) : ''
//         var xhr = new XMLHttpRequest();
//         xhr.onreadystatechange = function(){
//             if(xhr.readyState == 4 && xhr.status == 200){
//                 var res = xhr.responseText;
//                 cb(false, res)
//             } else if (xhr.readyState == 4 && xhr.status != 200) {//请求完成 状态码不对
//                 cb(NetErrCode.NetFaild)
//             } else {
//                 cc.log("onreadystatechange", xhr.readyState, xhr.status)
//             }
//         };
//         xhr.open("GET", url, true);
//         xhr.send(query);
//     },
//     /**
//      * 执行请求
//      * @param  {[type]}   requestVO [description]
//      * @param  {Function} cb        [description]
//      * @return {[type]}             [description]
//      */
//     _doRequest:function(requestVO, cb){
//         // cc.log("_doRequest",this._doingRequestVO.isForbidLoading)

//         var url = this.buildURI(requestVO)
//         var params = requestVO.data || {}
//         requestVO.tryTimes ++;
//         requestVO = this.mergeCookieUserKey(requestVO);
//         requestVO = this.mergeRequestId(requestVO);
//         requestVO = this.mergeLang(requestVO);
//         var self = this;
//         cc.log("发起网络请求", requestVO.a, requestVO.m)
//         this.post(url, params, function(err, rep){
//             if (err === NetErrCode.NetFaild) {//网络异常造成失败 重试
//                 if (requestVO.tryTimes >= requestVO.maxTry) {
//                     // require("Display").tip("网络连接异常,请求失败!");
//                     require("Display").tip(require("GM").I().t("AddText.networkAnomaly"));
//                     self.onRequestFaild(requestVO)
//                     cb(err, rep)
//                     requestVO.callback(err, rep);
//                     return
//                 }
//                 utils.delayDo(1, function(){
//                     self._doRequest(requestVO, cb)
//                 })
//                 return
//             }
//             if (err === NetErrCode.WrongJson) {
//                 // require("Display").tip("JSON格式错误\n<br/>"+rep);
//                 // requestVO.callback(err, rep);
//                 self.onRequestFaild(requestVO)
//                 cb(err, rep)
//                 return;
//             }
//             if (rep && rep.code) {//逻辑请求异常
//                 self.onRequestLogicCode(rep.code, rep.message);
//                 cb(err, rep)
//                 return
//             }
//             // cc.log("网络请求成功", requestVO.a, requestVO.m)
//             cb(err, rep)
//             require("GM").U().onSTC(rep)
//             requestVO.callback(err, rep);
//         })
//     },

//     /**
//      * 处理处列
//      * @return {[type]} [description]
//      */
//     _next:function(){
//         if (this._doingRequestVO) return false;
//         var requestVO = this._requestQueue.shift()
//         if (!requestVO) return;
//         var self = this;
//         requestVO.startTime = new Date().getTime();
//         this._doingRequestVO = requestVO;
//         this._doRequest(requestVO, function(err){
//             self._doingRequestVO = false;
//             self._next()
//         })
//     },
    
//     /**
//      * 向请求队列压入请求
//      * @param  {[type]} requestVO [description]
//      * @return {[type]}           [description]
//      */
//     request : function(requestVO){
//         // cc.log("networker", "request")
//         this.chkAndPushQueue(requestVO);
//         this._next()
//     },
//     /**
//      * 检查并压入请求队例
//      * 部分请求会替换队例中的前置请求（合并减少请求）
//      * @param  {[type]} requestVO [description]
//      * @return {[type]}           [description]
//      */
//     chkAndPushQueue:function(requestVO){
//         if (requestVO.a == 'tiles' && requestVO.m == 'getTilesInScreen') {
//             for (var i in this._requestQueue) {
//                 var _requestVO = this._requestQueue[i];
//                 if (requestVO.a == _requestVO.a && requestVO.m == _requestVO.m) {
//                     this._requestQueue[i] = requestVO;
//                     return;
//                 }
//             }
//         }
//         this._requestQueue.push(requestVO)
//     },
//     /**
//      * 当收到request的返回code
//      * 一般服务端逻辑请求异常会造成code出现
//      * 统一对异常做出处量
//      * @param  {[type]} code    [description]
//      * @param  {[type]} message [description]
//      * @return {[type]}         [description]
//      */
//     onRequestLogicCode:function(code, message){
//         cc.log("onRequestCode", code, message);
//         var utils = require("utils")
//         switch(code) {
//             case 'User_Not_Login':
//                 // require("Display").tip("用户登陆失效,即将自动登陆！");
//                 utils.delayDo(1, function(){
//                     require("GM").autoReLogin()
//                      // require("GM").startMainScene()
//                 })
//                 return;
//             // break;
//             default:
//                 return require("Display").tip(message);
//             // break;
//         }
//     },
//     /**
//      * 当请求失败 部分请求需要重置UI
//      * 如 初始化 或取玩家角色列表等接口需要重置到登陆场景
//      * @param  {[type]} requestVO [description]
//      * @return {[type]}           [description]
//      */
//     onRequestFaild:function(requestVO){
//         // cc.log(requestVO)
//         var sign = requestVO.a + '-' + requestVO.m;
//         switch(sign) {
//             case "sys-initialization":
//                 // require("Display").tip("即将返回登陆场景");
//                 if (cc.director.getScene().name == "MainScene") {
//                     utils.delayDo(1, function(){
//                         require("GM").startLoginScene();
//                     })
//                 }
//             break;
//             case "sys-getRolesOrCreate":
//                 // require("Display").tip("即将返回登陆场景");
//                 if (cc.director.getScene().name == "MainScene") {
//                     utils.delayDo(1, function(){
//                         require("GM").startLoginScene();
//                     })
//                 }                
//             break;
//         }
//     },
// });
// module.exports = new Networker();