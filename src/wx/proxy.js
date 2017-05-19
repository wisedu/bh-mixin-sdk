import axios from 'axios';

var getType = function(o) {
    var type = Object.prototype.toString.call(o).toLocaleLowerCase().replace('[object ', '').replace(']', '');
    if (type === 'object' && o && o.hasOwnProperty('length')) {
        return 'array';
    }
    return type;
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
                callback && callback({
                    base64: res.localIds[0],
                    url: res.localIds[0]
                });
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
                var imgs = res.localIds.map(function(item) {
                    return {
                        base64: item,
                        url: item
                    };
                });
                if (imgs.length > 1) {
                    callback && callback(imgs);
                } else {
                    callback && callback(imgs[0]);
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
                callback && callback(res.resultStr);
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

                let data = {
                    accessToken: config.accessToken,
                    serverIds: serverIds,
                    emapPrefixPath: config.emapPrefixPath,
                    fileToken: token,
                    scope: scope,
                    corp: config.corp
                };

                data.cookie = opt.cookie || '';

                if (opt.origin) {
                    data.origin = opt.origin;
                }

                if (opt.host) {
                    data.host = opt.host;
                }

                axios.get(config.uploadImgsToEmapUrl, { params: data }).then(function(res) {
                    resolve(res);
                }, function(res) {
                    reject(res);
                }).catch(function(res) {
                    reject(res);
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
}

export default proxyJdk;
