import axios from 'axios';

var getType = function(o) {
    var type = Object.prototype.toString.call(o).toLocaleLowerCase().replace('[object ', '').replace(']', '');
    if (type === 'object' && o && o.hasOwnProperty('length')) {
        return 'array';
    }
    return type;
};

var isIphone = function() {
    return /iphone/.test(navigator.userAgent.toLowerCase());
};

function proxyJdk(dd, mobileSDK, config) {
    console.log('dd config', config);
    mobileSDK.dd = dd;
    //拍照
    mobileSDK.takeCamera = function() {
        var args = arguments;
        var callback;
        console.log('拍照');
        if (getType(args[0]) === 'boolean') {
            if (getType(args[1]) === 'function') {
                callback = args[1];
            }
        }
        if (getType(args[0]) === 'function') {
            callback = args[0];
        }
        var sizeType = ['original', 'compressed'];
        if (getType(args[1]) === 'array') {
            callback = args[1];
        }
        if (getType(args[2]) === 'array') {
            sizeType = args[2];
        }
        dd.biz.util.uploadImageFromCamera({
            compression: true, //(是否压缩，默认为true)
            onSuccess: function(res) {
                //onSuccess将在图片上传成功之后调用
                /*
                [
                  'http://gtms03.alicdn.com/tps/i3/TB1VF6uGFXXXXalaXXXmh5R_VXX-237-236.png'
                ]
                */
                callback && callback({
                    base64: res[0],
                    url: res[0]
                });
            },
            onFail: function(err) {}
        });
    };
    //选择图片
    mobileSDK.takePhoto = function() {
        var args = arguments;
        var callback;
        console.log('选择图片');
        if (getType(args[0]) === 'function') {
            callback = args[0];
        }

        var limit = 1;
        if (getType(args[1]) === 'number') {
            limit = args[1];
        }

        var sizeType = ['original', 'compressed'];
        if (getType(args[1]) === 'array') {
            sizeType = args[1];
        }
        if (getType(args[2]) === 'array') {
            sizeType = args[2];
        }
        console.log('limit:' + limit)
        dd.biz.util.uploadImage({
            multiple: false, //是否多选，默认false
            max: limit, //最多可选个数
            onSuccess: function(res) {
                //onSuccess将在图片上传成功之后调用
                /*
                [
                  'http://gtms03.alicdn.com/tps/i3/TB1VF6uGFXXXXalaXXXmh5R_VXX-237-236.png'
                ]
                */
                //console.log('res');
                //console.log(res);
                var imgs = [];
                var cb = function() {
                    //console.log('cb-------');
                    //console.log(imgs);
                    if (imgs.length > 1) {
                        callback && callback(imgs);
                    } else {
                        callback && callback(imgs[0]);
                    }
                };
                imgs = res.map(function(item) {
                    return {
                        base64: item,
                        url: item
                    };
                });
                //console.log('cb  ---strat')
                cb();
            },
            onFail: function(err) {}
        });
    };
    //预览图片
    mobileSDK.preViewImages = function() {
        var args = arguments;
        var infos = [];
        if (getType(args[0]) === 'array') {
            infos = args[0];
        }
        var showIndex = 0;
        if (getType(args[1]) === 'number') {
            showIndex = args[1];
        }
        if (infos && infos.length) {
            let urls = infos.map(function(item) {
                return item.url;
            });
            dd.biz.util.previewImage({
                urls: urls, //图片地址列表
                current: urls[showIndex], //当前显示的图片链接
                onSuccess: function(result) {
                    /**/
                },
                onFail: function(err) {}
            });
        }
    };
    //关闭页面
    mobileSDK.closeWebView = function() {
        dd.biz.navigation.close({
            onSuccess: function(result) {
                /*result结构
                {}
                */
            },
            onFail: function(err) {}
        });
    };
    //扫描二维码或者一维码
    mobileSDK.scan = function(callback) {
        dd.biz.util.scan({
            type: "all", // type 为 all、qrCode、barCode，默认是all。
            onSuccess: function(data) {
                callback && callback(data);
                //onSuccess将在扫码成功之后回调
                /* data结构
                  { 'text': String}
                */
            },
            onFail: function(err) {}
        });
    };
    //上传图片到emap
    mobileSDK.uploadImgsToEmap = function(opt) {
        return new Promise(function(resolve, reject) {
            var serverIds = opt.urls;

            var uploadImg = function() {
                let token = opt.config && opt.config.token;
                let scope;
                if (token) {
                    scope = token.substring(0, token.length - 1);
                } else {
                    scope = new Date().getTime() + '' + parseInt(Math.random() * 100).toString();
                    token = scope + 1;
                }

                let emapPrefixPath = config.emapPrefixPath;
                if (!/^http/.test(emapPrefixPath)) {
                    emapPrefixPath = location.origin + '/' + emapPrefixPath;
                }
                let data = {
                    serverIds: serverIds.join(','),
                    emapPrefixPath: config.emapPrefixPath,
                    token: token,
                    scope: scope,
                    corp: config.corp,
                    storeid: 'image'
                };

                axios.get(config.uploadImgsToEmapUrl, {
                    params: data
                }).then(function(res) {
                    res.data.token = token;
                    resolve(res.data);
                }, function(res) {
                    reject(res.data);
                }).catch(function(res) {
                    reject(res.data);
                });
            };
            uploadImg();
            // var syncUpload = function(localIds) {
            //     var localId = localIds.pop();
            //     dd.biz.util.uploadImage({
            //         multiple: false, //是否多选，默认false
            //         max: 3, //最多可选个数
            //         onSuccess: function(res) {
            //             //onSuccess将在图片上传成功之后调用
            //             /*
            //             [
            //               'http://gtms03.alicdn.com/tps/i3/TB1VF6uGFXXXXalaXXXmh5R_VXX-237-236.png'
            //             ]
            //             */
            //             var serverId = res.serverId; // 返回图片的服务器端ID
            //             serverIds.push(serverId);
            //             if (localIds.length) {
            //                 syncUpload(localIds);
            //             } else {
            //                 uploadImg();
            //             }
            //         },
            //         onFail: function(err) {}
            //     });
            //     // wx.uploadImage({
            //     //     localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
            //     //     isShowProgressTips: 0, // 默认为1，显示进度提示
            //     //     success: function(res) {
            //     //         var serverId = res.serverId; // 返回图片的服务器端ID
            //     //         serverIds.push(serverId);
            //     //         if (localIds.length) {
            //     //             syncUpload(localIds);
            //     //         } else {
            //     //             uploadImg();
            //     //         }
            //     //     }
            //     // });
            // };
            // syncUpload(opt.urls);
        });
    };
    //改变标题
    mobileSDK.setTitleText = function(opt = '') {
        console.log('dd.biz.navigation:' + opt);
        console.log(dd.biz.navigation.setTitle);
        dd.biz.navigation.setTitle({
            title: opt, //控制标题文本，空字符串表示显示默认文本
            onSuccess: function(result) {
                console.log(result);
                /*结构
                {
                }*/
            },
            onFail: function(err) {
                console.log(err);
            }
        });
    };
    //获取当前位置
    mobileSDK.getCurrentPosition = function(successCallback, errorCallback, options) {
        /**
         *  钉钉JSSDK文档(https://ding-doc.dingtalk.com/doc#/dev/swk0bg)
         *  高德坐标 result 结构:
         *   {
         *       longitude : Number,
         *       latitude : Number,
         *       accuracy : Number,
         *       address : String,
         *       province : String,
         *       city : String,
         *       district : String,
         *       road : String,
         *       netType : String,
         *       operatorType : String,
         *       errorMessage : String,
         *       errorCode : Number,
         *       isWifiEnabled : Boolean,
         *       isGpsEnabled : Boolean,
         *       isFromMock : Boolean,
         *       provider : wifi|lbs|gps,
         *       accuracy : Number,
         *       isMobileEnabled : Boolean
         *   }
         *
         */
        options = options || {};
        dd.device.geolocation.get({
            targetAccuracy: options.targetAccuracy || 200,          // 期望定位精度半径(单位米)，定位结果尽量满足该参数要求，但是不一定能保证小于该误差，开发者需要读取返回结果的 accuracy 字段校验坐标精度；建议按照业务需求设置定位精度，推荐采用200m，可获得较好的精度和较短的响应时长
            coordinate: options.coordinate || 1,                    // 1：获取高德坐标；0：获取标准坐标；推荐使用高德坐标；标准坐标没有 address 字段
            withReGeocode: options.withReGeocode || false,            // 是否需要带有逆地理编码信息；该功能需要网络请求，请根据自己的业务场景使用
            useCache: options.useCache || false,                   //默认是true，如果需要频繁获取地理位置，请设置false
            onSuccess: function(res) {
                successCallback && successCallback({
                    timestamp: +new Date(),
                    coords: res
                });
            },
            onFail: function(err) {
                errorCallback && errorCallback(err);
            }
        });
    };
    //获取设备Id
    mobileSDK.getDeviceId = function(callback) {
        if(typeof callback === 'function'){
            dd.device.base.getUUID({
                onSuccess : function(data) {
                    callback({
                        type: 'success',
                        data: {
                            uuid: _res.uuid
                        }
                    });
                },
                onFail : function(err) {
                    callback({
                        type: 'error',
                        message: err
                    });
                }
            });
        }
    };
}

export default proxyJdk;
