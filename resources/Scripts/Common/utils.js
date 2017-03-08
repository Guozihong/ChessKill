var utils = {}

/**
 * Check and invoke callback function
 */
utils.invokeCallback = function (cb) {
    if (!!cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

/**
 * 生成指定大小范围的随机数
 * @param Min
 * @param Max
 * @returns {number|string}
 */
utils.rand = function (Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
};

//取得概率是否命中
//num为整数
//反回随机生成值是否落点在0-num区域中
utils.isRand = function (num) {
    var rand = utils.rand(0, 1000);
    return rand <= num
}
utils.isArray = function (v) {
    return toString.apply(v) === '[object Array]';
}

/**
/**
 * clone an object
 * 只能clone一维对像 多维对像需另写
 */
utils.clone = function (origin) {
    if (!origin) {
        return;
    }
    var obj = utils.isArray(origin) ? [] : {};
    for (var f in origin) {
        if (origin.hasOwnProperty(f)) {
            obj[f] = origin[f];
        }
    }
    return obj;
};
/**
 * 合并两个对像
 * @param destination
 * @param source
 * @param isforce
 */
utils.merge = function (destination, source, isforce) {
    //    console.log(typeof(destination));
    cc.assert(typeof (destination) == 'object', 'destination合并的不是对像')
    cc.assert(typeof (source) == 'object', 'source合并的不是对像')
    if (!!isforce) {//强制合并 destin中不存在的数值会被创建 数据以source为准
        for (var property in source) {
            destination[property] = source[property];   // 利用动态语言的特性, 通过赋值动态添加属性与方法
        }
    } else {
        for (var property in destination) {
            if (source.hasOwnProperty(property) && source[property] !== undefined) {
                destination[property] = source[property];   // 利用动态语言的特性, 通过赋值动态添加属性与方法
            }
        }
    }
    return destination
};

utils.empty = function (obj) {
    if (!obj) return true;
    if (typeof (obj) == 'string') return obj.length === 0;
    if (typeof (obj) == 'object') return Object.keys(obj).length === 0;
    return true;
};

utils.isset = function () {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: FremyCompany
    // +   improved by: Onno Marsman
    // +   improved by: Rafał Kukawski
    // *     example 1: isset( undefined, true);
    // *     returns 1: false
    // *     example 2: isset( 'Kevin van Zonneveld' );
    // *     returns 2: true
    var a = arguments,
        l = a.length,
        i = 0,
        undef;


    if (l === 0) {
        throw new Error('Empty isset');
    }

    while (i !== l) {
        if (a[i] === undef || a[i] === null) {
            return false;
        }
        i++;
    }
    return true;
}
//Object.keys只适用于可枚举的属性，
//而Object.getOwnPropertyNames返回对象自动的全部属性名称。
//Object.keys()IE6、7、8不支持
utils.size = function (obj) {
    if (!obj) {
        return 0;
    }
    if (Object.keys) return Object.keys(obj).length;
    var size = 0;
    for (var f in obj) {
        if (obj.hasOwnProperty(f)) {
            size++;
        }
    }
    return size;
};

utils.inArray = function (val, array) {
    for (var _k in array) {
        var _v = array[_k]
        if (_v == val) return true;
    }
    return false;
};
//取得对像所有键值
utils.keys = function (argument) {
    if (Object.keys) return Object.keys(argument);
    var keys = [];
    for (var property in object)
        keys.push(property);
    return keys;
};
//取得对像所有值
utils.valus = function (object) {
    var values = [];
    for (var property in object)
        values.push(object[property]);
    return values;
};

utils.isMobile = function () {
    return cc.sys.isMobile;
};

utils.delayDo = function (intval, next) {
    var handle = setTimeout(function () {
        next()
    }, intval * 1000);
    return handle;
};

utils.nexttick = function (next) {
    setTimeout(function () {
        next()
    }, 100);
};

utils.walk = function (obj, cb) {
    for (var i in obj) {
        if (cb(i, obj[i])) break;
    }
};
//取得某个节点子节点下的指定组件(不适用雨子节点中有同名组件)
//node = 某子节点 type = 类型 name = 指定组件名字
utils.getComponentChildren = function (node, type, name) {
    var _type = "cc." + type
    var _name = name + "<" + type + ">"
    var list = node.getComponentsInChildren(_type)
    if (utils.empty(list)) { return };
    for (let i in list) {
        if (list[i].name == _name) {
            return list[i]
        };
    }
    return false
};

utils.distance = function (p1, p2) {
    var _x = Math.abs(p1.x - p2.x)
    var _y = Math.abs(p1.y - p2.y)
    return Math.pow((_x * _x + _y * _y), 0.5);
};
/**
 * 格式化字符串 ylj(16/7/16)
 * @param  {[type]}   args   [description]
 * @return {[string]} result [description]
 * example : 
 * var str = 'rld';
 * utils.format('he{0},wo{1}}','llo',str) 
 * // return 'hello,world'
 */
utils.format = function (args) {
    if (arguments.length == 0) return false//没有格式化对象
    var result = arguments[0];
    if (arguments.length == 1) return result //不能转换
    for (var i = 0; i < arguments.length; i++) {
        result = result.replace('{' + i + '}', arguments[i + 1]);
    }
    return result
};

/**
    * 给一个对象添加一个新的属性,添加一条新的数据 (ylj/16/07/19)
    * @param  {[object]} target [description]
    * @param  {[object]} newVO  [description]
    * @return {[object]} target [description]
    * exmaple : 
    * var target = {0 : 'a', 1 : 's', 2 : 'd'}
    * var newVO = {0 : 'a'} 
    * addVO(target,newVO)
    * return {0 : 'a', 1 : 's', 2 : 'd', 3 : 'a'} // (3 : 'a') is newAdded form newVO;
   */
utils.addVO = function (target, newVO) {
    var targetPropertyNum = utils.size(target);
    for (var i = 0; i < targetPropertyNum; i++) {
        if (!target.hasOwnProperty(i)) {
            target[i] = newVO
            return target;
        }
    }
    if (!target.hasOwnProperty(targetPropertyNum)) {
        target[targetPropertyNum] = newVO
    }
    return target;
},

    //遍历排序用 @author hbj 7.18
    utils.getObjectValues = function (obj) {
        var list = []
        for (var _k in obj) {
            list.push(obj[_k])
        }
        return list;
    };
/**
 * 把秒数转换为00：00：00时间格式的字符串
 * hbj
 * 8.17
*/
utils.getTimeDate = function (time) {
    //parseInt() 取整函数          
    var seconds = parseInt(time);// 秒
    var minutes = 0;// 分
    var hours = 0;// 小时
    if (seconds >= 60) {
        minutes = parseInt(seconds / 60);
        seconds = parseInt(seconds % 60); //取余，获得当前秒数
        if (minutes >= 60) {
            hours = parseInt(minutes / 60);
            minutes = parseInt(minutes % 60);
        }
    }
    var result = seconds;
    if (result < 10) result = "0" + result;  //不足10秒字符串前面补0
    if (minutes == 0) {
        result = "00:" + result;
        if (hours == 0) result = "00:" + result;
    }
    if (minutes > 0) {
        result = minutes + ":" + result;
        if (minutes < 10) result = "0" + result;
        if (hours == 0) result = "00:" + result;
    }
    if (hours > 0) {
        result = hours + ":" + result;
        if (hours < 10) result = "0" + result;
    }

    return result;
};
/**
 * 把秒数转换为00：00：00时间格式的字符串
 * time ：时间戳
 * isMistiming ： 是否计算时间差
 */
utils.conversionTimeFormat = function (time, isMistiming) {
    if (isMistiming) {
        if (time < 0) time = 0;
        var h = Math.floor(time / (60 * 60))
        var timeRemaining = Math.floor(time % (60 * 60));
        var m = Math.floor(timeRemaining / 60)
        var s = Math.floor(timeRemaining % 60)
    } else {
        var unixTimestamp = new Date(time * 1000)
        var h = unixTimestamp.getHours()
        var m = unixTimestamp.getMinutes()
        var s = unixTimestamp.getSeconds()
    }
    if (h < 10) h = '0' + h;
    if (m < 10) m = '0' + m;
    if (s < 10) s = '0' + s;
    return h + ':' + m + ':' + s
    // return utils.format('{0}:{1}:{2}',h,m,s)
},
    /**
     * 对数字前面为空的补0
     * @param  {[type]} num [数字]
     * @param  {[type]} n   [最终长度 数字长度不足前面补0]
     * @return {[type]}     [description]
     */
    utils.refixInteger = function (num, n) {
        return (Array(n).join(0) + num).slice(-n);
    };
/**
 * 两个数组中的值相加
 * @param  {[type]} a [数组a],a[1,2,3]
 * @param  {[type]} b [数组b],b[11,12,13]
 * @return {[type]}   [数组c],c[12,14,16]
 */
utils.mergeAdd = function (a, b) {
    if (b.length > a.length) {
        var t = a
        a = b
        b = t
    }
    return a.map(function (v, i) {
        return v + (b[i] || 0)
    })
};
/**
 * 输出当前时间戳 与上一次输出的差值
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
utils.timestamp = function (sign, key, point) {
    var nt = new Date().getTime();
    var _k = sign + key;
    if (!utils.lasttime) utils.lasttime = {};
    if (!utils.lasttime[_k]) utils.lasttime[_k] = nt;
    var pt = nt - utils.lasttime[_k];
    utils.lasttime[_k] = nt;
    cc.log(sign, key, point, nt, pt)
};

/**
 * 地图上围绕指定点遍历
 * @param  {[type]}   p   [description]
 * @param  {[type]}   dis [description]
 * @param  {Function} cb  [description]
 * @return {[type]}       [description]
 */
utils.walkAround = function(p, dis, cb){
    var x, y;
    for (x = p.x - dis; x <= p.x + dis; x++){
        for (y = p.y - dis; y <= p.y + dis; y++) {
            if (x < 0 || x >= 1500) continue;
            if (y < 0 || y >= 1500) continue;
            if (cb(x, y)) return;//如果回调返回true则终止循环 
        }
    }
};
    /**
     * 对数据进行递增排序操作，返回排序好的数组
     * dataArr 排序数据
     * str 排序字段
     */
    utils.sortUp = function (dataArr, str) {
        var k = 0, temp = null;
        dataArr = utils.getObjectValues(dataArr);
        //递增排序
        for (let i = 0; i < dataArr.length; i++) {
            k = i;
            for (let j = i + 1; j < dataArr.length; j++) {
                if (parseFloat(dataArr[k][str]) > parseFloat(dataArr[j][str])) {
                    k = j;
                }
            }
            if (k != i) {
                temp = dataArr[k];
                dataArr[k] = dataArr[i];
                dataArr[i] = temp;
            }
        }
        return dataArr;
    },
    /**
     * 对数据进行递减排序操作，返回排序好的数组
     * dataArr 排序数据
     * str 排序字段
     */
    utils.sortDown = function (dataArr, str) {
        var k = 0, temp = null;
        dataArr = utils.getObjectValues(dataArr);
        //递减排序
        for (let i = 0; i < dataArr.length; i++) {
            k = i;
            for (let j = i + 1; j < dataArr.length; j++) {
                if (parseFloat(dataArr[k][str]) < parseFloat(dataArr[j][str])) {
                    k = j;
                }
            }
            if (k != i) {
                temp = dataArr[k];
                dataArr[k] = dataArr[i];
                dataArr[i] = temp;
            }
        }
        return dataArr;
    },
    utils.numFormat = function (num) {
        if (num < 100000) return num;
        num /= 1000
        num = Math.floor(num) + "k";
        return num;
    },
    utils.strFormat = function(str,showNum)
    {
        if(!showNum) showNum =4;
        // var str = new String(str);
        if(str.length > showNum) str = str.substr(0,showNum)+ "...";
        return str;
    },
    //计算所占字符,汉子2个字符,其他1个字符
    utils.getStrMaxLength = function(str){
        var pattern = /[^\u4e00-\u9fa5]/;
        str = str.toString();
        var curCharLength = 0; //字符换算长度
        for(var i in str){
            curCharLength++;
            var _char = str[i];
            if(!pattern.test(_char)){//汉字
                curCharLength++;
            }
        }
        return curCharLength;
    },
    //根据消息内容获取坐标点(0-1499),仅返回匹配到的第一个坐标
    utils.getCoordinateByContent = function(content){
        var pattern = /\d{1,4}\s{0,100}\,{1}\s{0,100}\d{1,4}/
        var matchRes = content.toString().match(pattern);

        if(matchRes == null) return {content:content,coordinate:false}; 

        var coordinate = matchRes[0].toString().replace(/\s/g,'');
        var arr = coordinate.toString().split(',');
        if(parseInt(arr[0]) >= 0 && parseInt(arr[0]) <= 1499 && parseInt(arr[1]) >= 0 && parseInt(arr[1]) <= 1499) {
            content = content.toString().replace('(' + matchRes[0],matchRes[0]);
            content = content.toString().replace(matchRes[0] + ')',matchRes[0]);
            coordinate = '<color=#7FBB87>(' + coordinate + ')</color>';
            content = content.toString().replace(matchRes[0],coordinate);
            coordinate = [parseInt(arr[0]),parseInt(arr[1])];
            return {content:content,coordinate:coordinate};
        }
        
        return {content:content,coordinate:false};
    },
module.exports = utils;