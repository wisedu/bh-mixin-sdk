import axios from 'axios';
import wxInit from './wx/wx.js';
import bhInit from './bh/bh.js';
import wxDefaults from './wx/defaults.js';

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
export default (cb, config) => {
  if (mixinSdk)
    return mixinSdk;
  mixinSdk = (cb, config) => {
    let isWeiXin = () => /micromessenger/.test(navigator.userAgent.toLowerCase());
    let isDingTalk = () => /dingtalk/.test(navigator.userAgent.toLowerCase());
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

        // axios.post(wxConfig.url, {
        //         url: window.location.href.replace(/#(\S+)?/, ''),
        //         corp: wxConfig.corp
        //     })
        //     .then((res) => {
        //         var jsApiList = [
        //             'onMenuShareTimeline',
        //             'onMenuShareAppMessage',
        //             'onMenuShareQQ',
        //             'onMenuShareWeibo',
        //             'onMenuShareQZone',
        //             'startRecord',
        //             'stopRecord',
        //             'onVoiceRecordEnd',
        //             'playVoice',
        //             'pauseVoice',
        //             'stopVoice',
        //             'onVoicePlayEnd',
        //             'uploadVoice',
        //             'downloadVoice',
        //             'chooseImage',
        //             'previewImage',
        //             'uploadImage',
        //             'downloadImage',
        //             'translateVoice',
        //             'getNetworkType',
        //             'openLocation',
        //             'getLocation',
        //             'hideOptionMenu',
        //             'showOptionMenu',
        //             'hideMenuItems',
        //             'showMenuItems',
        //             'hideAllNonBaseMenuItem',
        //             'showAllNonBaseMenuItem',
        //             'closeWindow',
        //             'scanQRCode',
        //             'chooseWXPay',
        //             'openProductSpecificView',
        //             'addCard',
        //             'chooseCard',
        //             'openCard'
        //         ];
        //         if (/iphone/.test(navigator.userAgent.toLowerCase())) {
        //             jsApiList.push('getLocalImgData');
        //         }
        //         wxInit(cb, {
        //             debug: false,
        //             appId: res.data.data.corpId,
        //             timestamp: res.data.data.timestamp,
        //             nonceStr: res.data.data.nonceStr,
        //             signature: res.data.data.signature,
        //             jsApiList: jsApiList
        //         }, {
        //             emapPrefixPath: wxConfig.emapPrefixPath,
        //             // accessToken: res.data.data.accessToken,
        //             uploadImgsToEmapUrl: wxConfig.uploadImgsToEmapUrl,
        //             corp: wxConfig.corp
        //         });
        //     })
        //     .catch((error) => {
        //         console.log(error);
        //     });
      }
      return;
    }
    if (isDingTalk()) {
      if (config.dd) {}
      return;
    }
    bhInit(cb, config.https);
  }
  return mixinSdk(cb, config);
};
