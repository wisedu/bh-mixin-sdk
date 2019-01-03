import axios from 'axios';
import qs from 'qs';
import $ from 'jquery'

var getType = function(o) {
    var type = Object.prototype.toString.call(o).toLocaleLowerCase().replace('[object ', '').replace(']', '');
    if (type === 'object' && o && o.hasOwnProperty('length')) {
        return 'array';
    }
    return type;
};

function proxyJdk(lt, mobileSDK, config) {
    mobileSDK.lt = lt;
    
      //改变标题
    mobileSDK.setTitleText = function(opt = '') {
        return document.title = opt;
    };

    //扫描二维码或者一维码
    mobileSDK.scan = function(callback) {
        lt.h5.call("scan", function(ret){
            if(ret.status == 1){
                callback && callback(ret.result.text);
            }else{
                alert("识别出错，请重试！")
            }
        });
    };

    //拍照
    mobileSDK.takeCamera = function(callback, config = { allowEdit: false }) {
        lt.h5.call("takePhoto", config, function(ret){
            // 根据返回结果计算图片大小
            function getFileSizeFromBase64 (b64) {
                b64 = b64.substring(22)
                var equalIndex= b64.indexOf('=')
                if (b64.indexOf('=') > 0) {
                    b64 = b64.substring(0, equalIndex)
                }
                var strLength = b64.length;
                return parseInt((strLength - (strLength / 8) * 2) / 1024)
            }

            var result = {
                url: ret,
                size: getFileSizeFromBase64(ret)
            }
            callback && callback(result)
        });
    };

    //选择照片
    mobileSDK.takePhoto = function(callback, config = { allowEdit: false }) {
        lt.h5.call("pickPhoto", config, function(ret){
            // 根据返回结果计算图片大小
            function getFileSizeFromBase64 (b64) {
                b64 = b64.substring(22)
                var equalIndex= b64.indexOf('=')
                if (b64.indexOf('=') > 0) {
                    b64 = b64.substring(0, equalIndex)
                }
                var strLength = b64.length;
                return parseInt((strLength - (strLength / 8) * 2) / 1024)
            }

            var result = {
                url: ret,
                size: getFileSizeFromBase64(ret)
            }
            callback && callback(result)
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
            // let urls = infos.map(function(item) {
            //     return item.url;
            // });
            lt.h5.call("viewFullImg", infos[showIndex]);
        }
    };

    //关闭页面
    mobileSDK.closeWebView = function() {
        lt.h5.call("closeSelf");
    };

    //获取当前位置
    mobileSDK.getCurrentPosition = function(successCallback, errorCallback, config = { platform: aMap }) {
        MCK.h5.call("getCurrentPosition", config, function(ret) {
            if(ret.status == 1) {
                var result = {
                    coords: {
                        longitude: ret.result.lng, // 经度
                        latitude: ret.result.lat // 纬度
                    },
                    timestamp: +new Date()
                }
                successCallback && successCallback(result)
            }else {
                errorCallback && errorCallback(ret.error)
            }
            
        });
        
    };

    //上传图片到emap
    mobileSDK.uploadImgsToEmap = function(opt) {
        // return bh.wisedu.uploadToEMAP(opt.host, opt.urls, opt.config || {});
        return test(opt.host, opt.urls, opt.config || {})
        function test(server, files, config = {}) {
            let token = config.token
            let scope
            if (token) {
              scope = token.substring(0, token.length - 1);
            } else {
              scope = new Date().getTime() + "" + parseInt(Math.random() * 100).toString()
              token = scope + 1
            }
            
            return new Promise((resolve, reject) => {
                if (!server) {
                    reject('server 地址未指定')
                }
                if (files.length === 0) {
                    reject('没有可供上传的文件')
                }
                var storeId = 'image';
                //ajax 提交form  
                $.ajax({  
                    url : server + '/sys/emapcomponent/file/uploadTempFileAsAttachment.do',   // emap自动保存为正式文件的上传接口
                    type : "POST",  
                    data : sumitImageFile(scope,token,storeId,files[0]),  
                    dataType: "text",  
                    processData : false,         // 告诉jQuery不要去处理发送的数据  
                    contentType : false,        // 告诉jQuery不要去设置Content-Type请求头  

                    success:function(data){  
                        var fileResult = JSON.parse(data);

                        console.log("----fileResult----")
                        console.log(fileResult)

                        let error = false
                        try {
                            if (!fileResult.success) {
                                error = true
                            }
                        } catch (e) {
                            error = true
                        }
                        if (error) {
                            reject({
                                success: false,
                                token: "",
                                errMsg: fileResult
                            })
                        } else {
                            resolve({
                                success: true,
                                token,
                                data: fileResult
                            })
                        }

                    },  
                    // xhr:function(){            //在jquery函数中直接使用ajax的XMLHttpRequest对象  
                    //     var xhr = new XMLHttpRequest();  
                    //     xhr.upload.addEventListener("progress", function(evt){  
                    //         if (evt.lengthComputable) {  
                    //             var percentComplete = Math.round(evt.loaded * 100 / evt.total);    
                    //             console.log("正在提交."+percentComplete.toString() + '%');        //在控制台打印上传进度  
                    //         }  
                    //     }, false);  
                    //     return xhr;  
                    // }  
                });  
            })
        }
        /**  
        * @param base64Codes  
        *            图片的base64编码  
        */  
        function sumitImageFile(scope,fileToken,storeId,base64Codes){  
            // var form=document.forms[0];  

            var formData = new FormData();   //这里连带form里的其他参数也一起提交了,如果不需要提交其他参数可以直接FormData无参数的构造函数  

            //convertBase64UrlToBlob函数是将base64编码转换为Blob  
            formData.append("files",dataURLtoFile(base64Codes, fileToken + ".jpeg"));  //append函数的第一个参数是后台获取数据的参数名,和html标签的input的name属性功能相同  
            formData.append("scope",scope)
            formData.append("fileToken",fileToken)
            formData.append("storeId",storeId)

            return formData
        }  
        /**  
        * 将以base64的图片url数据转换为文件 
        * @param dataurl  base64
        * @param filename  生成的图片名称
        */  
        function dataURLtoFile(dataurl, filename) { 
            var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, {
                type: mime
            });
        }
        /**  
        * 将以base64的图片url数据转换为Blob  --这次没用上
        * @param urlData  
        *            用url方式表示的base64图片数据  
        */  
       function convertBase64UrlToBlob(urlData){  
        var bytes=window.atob(urlData.split(',')[1]);        //去掉url的头，并转换为byte  
        //处理异常,将ascii码小于0的转换为大于0  
        var ab = new ArrayBuffer(bytes.length);  
        var ia = new Uint8Array(ab);  
        for (var i = 0; i < bytes.length; i++) {  
            ia[i] = bytes.charCodeAt(i);  
        }  
        return new Blob( [ab] , {type : 'image/jpeg'});  
    }  
        //创建隐藏的form表单 ---这次没用上
        function createForm(scope,fileToken,storeId) {
            var generateHideElement = function (name, value) {
                var tempInput = document.createElement("input");
                tempInput.type = "hidden";
                tempInput.name = name;
                tempInput.value = value;
                return tempInput;
            }

            var form = document.createElement("form");
            document.body.appendChild(form);

            var scope = generateHideElement("scope", scope),
            fileToken = generateHideElement("fileToken", fileToken),
            storeId = generateHideElement("storeId", storeId);
          
            form.appendChild(scope);
            form.appendChild(fileToken);
            form.appendChild(storeId);
        }
    };
}

export default proxyJdk;
