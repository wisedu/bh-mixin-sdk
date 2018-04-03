import axios from 'axios';
import wxInit from './wx/wx.js';
import bhInit from './bh/bh.js';
import ddInit from './dd/dd.js';
import wxDefaults from './wx/defaults.js';
import ddDefaults from './dd/defaults.js';
import jsonp from 'jsonp'
import pk from '../package.json'

let mixinSdk = null;

function getSignData(wxConfig) {
    return new Promise((resolve, reject) => {
        if (wxConfig.signData) {
            resolve(wxConfig.signData)
        } else if (wxConfig.url) {
            axios.post(wxConfig.url, {
                url: window.location.href.replace(/#(\S+)?/, ''),
                corp: wxConfig.corp
            }).then(({
                data: resp
            }) => {
                if (resp.status == 200 || resp.code == '0') {
                    resolve(resp.datas)
                } else {
                    reject(resp)
                }
            }, (error) => {
                reject(error)
            })
        } else {
            reject('sdk初始化缺少signData或url')
        }
    })
}

function getDdSignData(ddConfig) {
    return new Promise((resolve, reject) => {
        if (ddConfig.signData) {
            resolve(ddConfig.signData)
        } else if (ddConfig.url) {
            axios({
                method: "POST",
                url: ddConfig.url,
                params: {
                    newUrl: window.location.href.replace(/#(\S+)?/, '')
                }
            }).then(({
                data: resp
            }) => {
                console.log('res------------');
                console.log(resp);
                if (resp.status == 200 || resp.code == '0') {
                    console.log('resolve');
                    resolve(resp.datas)
                } else {
                    reject(resp)
                }
            }, (error) => {
                reject(error)
            });
        } else {
            reject('sdk初始化缺少signData或url')
        }
    })
}


const sdk = (cb, config) => {
    if (mixinSdk)
        return mixinSdk;
    mixinSdk = (cb, config) => {
        //如果设置了mt-header,微信钉钉今日校园环境下隐藏，浏览器调试时展示出来
        var hideMintUIHeader = function() {
            var style = document.createElement("style");
            style.type = 'text/css';
            style.innerHTML = "header.mint-header {display: none !important;}";
            document.body.appendChild(style);
        };
        let isWeiXin = () => /micromessenger/.test(navigator.userAgent.toLowerCase());
        let isDingTalk = () => /dingtalk/.test(navigator.userAgent.toLowerCase());
        let isDaliyCampus = () => /wisedu/.test(navigator.userAgent.toLowerCase());
        //qiyu 2017-12-13 增加数据搜集
        if (["127.0.0.1","localhost","0.0.0.0"].indexOf(window.location.hostname) == -1 ) {
            let sdk = pk.version;
            let mt = window.MINT ? window.MINT.version : "";
            let em = window["emap-mobile"] ? window["emap-mobile"].version : "";
            let rq = window.require ? 1 : 0;
            jsonp(`https://res.wisedu.com/statistics/mf?wx=${isWeiXin()^0}&dd=${isDingTalk()^0}&cp=${isDaliyCampus()^0}&sdk=${sdk}&mt=${mt}&em=${em}&rq=${rq}`, null, function (err, data) {});
        }
        //
        if (isWeiXin() || isDingTalk() || isDaliyCampus()) {
            hideMintUIHeader();
            if (isWeiXin()) {
                if (config.wx) {
                    let wxConfig = Object.assign(wxDefaults, config.wx);
                    /**
                     * 若传了signData, 内容为签名的数据，则直接初始化签名
                     * 若没有传signData，则使用url来请求signData
                     */
                    getSignData(wxConfig).then(signData => {
                        var jsApiList = [
                            'onMenuShareTimeline',
                            'onMenuShareAppMessage',
                            'onMenuShareQQ',
                            'onMenuShareWeibo',
                            'onMenuShareQZone',
                            'startRecord',
                            'stopRecord',
                            'onVoiceRecordEnd',
                            'playVoice',
                            'pauseVoice',
                            'stopVoice',
                            'onVoicePlayEnd',
                            'uploadVoice',
                            'downloadVoice',
                            'chooseImage',
                            'previewImage',
                            'uploadImage',
                            'downloadImage',
                            'translateVoice',
                            'getNetworkType',
                            'openLocation',
                            'getLocation',
                            'hideOptionMenu',
                            'showOptionMenu',
                            'hideMenuItems',
                            'showMenuItems',
                            'hideAllNonBaseMenuItem',
                            'showAllNonBaseMenuItem',
                            'closeWindow',
                            'scanQRCode',
                            'chooseWXPay',
                            'openProductSpecificView',
                            'addCard',
                            'chooseCard',
                            'openCard'
                        ];
                        if (/iphone/.test(navigator.userAgent.toLowerCase())) {
                            jsApiList.push('getLocalImgData');
                        }
                        wxInit(cb, {
                            debug: false,
                            appId: signData.corpId,
                            timestamp: signData.timestamp,
                            nonceStr: signData.nonceStr,
                            signature: signData.signature,
                            jsApiList: jsApiList
                        }, {
                            emapPrefixPath: wxConfig.emapPrefixPath,
                            // accessToken: signData.accessToken,
                            uploadImgsToEmapUrl: wxConfig.uploadImgsToEmapUrl,
                            corp: wxConfig.corp
                        });
                    })
                }else{
                    bhInit(cb, config);
                }
            } else if (isDingTalk()) {
                if (config.dd) {
                    let ddConfig = Object.assign(ddDefaults, config.dd);
                    getDdSignData(ddConfig).then(signData => {
                        console.log('jsApiList');
                        var jsApiList = [
                            'biz.navigation.setTitle',
                            'device.geolocation.get',
                            'device.base.getUUID',
                            'device.base.getInterface',
                            'device.launcher.checkInstalledApps',
                            'device.launcher.launchApp',
                            'biz.util.open',
                            'biz.contact.choose',
                            'biz.contact.chooseMobileContacts',
                            'biz.user.get',
                            'biz.util.uploadImage',
                            'biz.ding.post',
                            'biz.telephone.call',
                            'biz.telephone.showCallMenu',
                            'biz.chat.chooseConversation',
                            'biz.contact.createGroup',
                            'biz.map.locate',
                            'biz.map.search',
                            'biz.map.view',
                            'device.geolocation.openGps',
                            'biz.util.uploadImageFromCamera',
                            'biz.customContact.multipleChoose',
                            'biz.customContact.choose',
                            'biz.contact.complexPicker',
                            'biz.contact.departmentsPicker',
                            'biz.contact.setRule',
                            'biz.contact.externalComplexPicker',
                            'biz.contact.externalEditForm',
                            'biz.chat.pickConversation',
                            'biz.chat.chooseConversationByCorpId',
                            'biz.chat.openSingleChat',
                            'biz.chat.toConversation',
                            'biz.cspace.saveFile',
                            'biz.cspace.preview',
                            'biz.cspace.chooseSpaceDir',
                            'biz.util.uploadAttachment',
                            'biz.clipboardData.setData',
                            'biz.intent.fetchData',
                            'biz.chat.locationChatMessage',
                            'device.audio.startRecord',
                            'device.audio.stopRecord',
                            'device.audio.onRecordEnd',
                            'device.audio.download',
                            'device.audio.play',
                            'device.audio.pause',
                            'device.audio.resume',
                            'device.audio.stop',
                            'device.audio.onPlayEnd',
                            'device.audio.translateVoice',
                            'biz.util.fetchImageData',
                            'biz.alipay.auth',
                            'biz.alipay.pay',
                            'device.nfc.nfcWrite',
                            'biz.util.encrypt',
                            'biz.util.decrypt',
                            'runtime.permission.requestOperateAuthCode',
                            'biz.util.scanCard',
                            'util.domainStorage.getItem',
                            'util.domainStorage.setItem',
                            'util.domainStorage.removeItem',
                            'runtime.info',
                            'biz.contact.choose',
                            'device.notification.confirm',
                            'device.notification.alert',
                            'device.notification.prompt',
                            'biz.ding.post',
                            'biz.util.openLink'
                        ]; //必填，需要使用的jsapi列表
                        console.log('have jsApiList-------')
                        ddInit(cb, {
                            agentId: signData.agentId,
                            corpId: signData.corpId,
                            timeStamp: signData.timeStamp,
                            nonceStr: signData.nonceStr,
                            signature: signData.signature,
                            jsApiList: jsApiList
                        }, {
                            emapPrefixPath: ddConfig.emapPrefixPath,
                            accessToken: signData.accessToken,
                            uploadImgsToEmapUrl: ddConfig.uploadImgsToEmapUrl,
                            corp: ddConfig.corp
                        });
                    });
                }else{
                    bhInit(cb, config);
                }
            } else if (isDaliyCampus()) {
                bhInit(cb, config);
            }
        } else {
            bhInit(cb, config);
        }
    }
    return mixinSdk(cb, config);
};

export default sdk;
