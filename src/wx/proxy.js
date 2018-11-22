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

function proxyJdk(wx, mobileSDK, config) {
    console.log('wx config', config);
    mobileSDK.wx = wx;
    //拍照
    mobileSDK.takeCamera = function() {
        var args = arguments;
        var callback;
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
        wx.chooseImage({
            count: 1,
            sizeType: sizeType,
            sourceType: ['camera'],
            success: function(res) {
                if (isIphone()) {
                    wx.getLocalImgData({
                        localId: res.localIds[0],
                        success: function(ret) {
                            callback && callback({
                                base64: ret.localData,
                                url: res.localIds[0]
                            });
                        }
                    });
                } else {
                    callback && callback({
                        base64: res.localIds[0],
                        url: res.localIds[0]
                    });
                }
            }
        });
    };
    //选择图片
    mobileSDK.takePhoto = function() {
        var args = arguments;
        var callback;
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
        wx.chooseImage({
            count: limit,
            sizeType: sizeType,
            sourceType: ['album'],
            success: function(res) {
                var imgs = [];
                var localIds = res.localIds;
                var cb = function() {
                    if (imgs.length > 1) {
                        callback && callback(imgs);
                    } else {
                        callback && callback(imgs[0]);
                    }
                };
                if (localIds.length === 0) {
                    return callback && callback({});
                }
                if (isIphone()) {
                    var getLocalImgData = function() {
                        var localId = localIds.pop();
                        wx.getLocalImgData({
                            localId: localId,
                            success: function(ret) {
                                imgs.push({
                                    base64: ret.localData,
                                    url: localId
                                });
                                if (localIds.length) {
                                    getLocalImgData();
                                } else {
                                    cb();
                                }
                            }
                        });
                    };
                    getLocalImgData();
                } else {
                    imgs = res.localIds.map(function(item) {
                        return {
                            base64: item,
                            url: item
                        };
                    });
                    cb();
                }
            }
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
            wx.previewImage({
                urls: urls,
                current: urls[showIndex]
            });
        }
    };
    //关闭页面
    mobileSDK.closeWebView = function() {
        wx.closeWindow();
    };
    //扫描二维码或者一维码
    mobileSDK.scan = function(callback) {
        wx.scanQRCode({
            needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
            scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
            success: function(res) {
                if(res.resultStr.indexOf(',')>-1){
                    callback && callback(res.resultStr.split(',')[1]);
                }else {
                    callback && callback(res.resultStr);
                } 
            }
        });
    };
    //上传图片到emap
    mobileSDK.uploadImgsToEmap = function(opt) {
        return new Promise(function(resolve, reject) {
            var serverIds = [];

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
                let uploadConfig = Object.assign({}, opt.config);
                let data = Object.assign(uploadConfig, {
                    serverIds: serverIds.join(','),
                    emapPrefixPath: config.emapPrefixPath,
                    token: token,
                    scope: scope,
                    corp: config.corp,
                    storeid: 'image'
                });

                axios.get(config.uploadImgsToEmapUrl, {
                    params: data
                }).then(function(res) {
                    //res是请求的最外层返回，res.data才到数据层。
                    //之前的判断是拿不到res.success这个对象的，所以会有部分（也没搞明白为什么只有部分应用暴露了这个问题）报错没有取到token
                    if (res.code === '0' || res.success || res.data.code === '0' || res.data.success) {
                        res.data.token = token;
                    }else {
                        res.data.msg = "上传失败，未获取到token"
                    }
                    resolve(res.data);
                }, function(res) {
                    reject(res.data);
                }).catch(function(res) {
                    reject(res.data);
                });
            };

            var syncUpload = function(localIds) {
                var localId = localIds.pop();
                wx.uploadImage({
                    localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
                    isShowProgressTips: 0, // 默认为1，显示进度提示
                    success: function(res) {
                        var serverId = res.serverId; // 返回图片的服务器端ID
                        serverIds.push(serverId);
                        if (localIds.length) {
                            syncUpload(localIds);
                        } else {
                            uploadImg();
                        }
                    }
                });
            };
            syncUpload(opt.urls);
        });
    };
    //改变标题
    mobileSDK.setTitleText = function(opt = '') {
        return document.title = opt;
    };
    //获取当前位置
    mobileSDK.getCurrentPosition = function(successCallback, errorCallback, options) {
        wx.getLocation({
            type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
            success: function(res) {
                successCallback && successCallback({
                    timestamp: +new Date(),
                    coords: res
                });
            },
            fail: function(res) {
                errorCallback && errorCallback(res);
            }
        });
    };
    mobileSDK.share = function(param){
        var share = { 
            title: param.title,       // 分享标题
            desc: param.desc,   // 分享描述
            link: param.link,       // 分享链接 默认以当前链接
            imgUrl: param.imgUrl,// 分享图标
            // 用户确认分享后执行的回调函数
            success: function () {
                console.log('分享到朋友成功');
            },
            // 用户取消分享后执行的回调函数
            cancel: function () {
              console.log('分享到朋友取消');
            }
        };
        wx.onMenuShareAppMessage(share); // 分享给朋友
        wx.onMenuShareTimeline(share);  // 朋友圈
        wx.onMenuShareQQ(share);  // QQ
        wx.onMenuShareQZone(share);  // QQ空间
    }
}

export default proxyJdk;
