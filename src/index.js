import axios from 'axios';
import wxInit from './wx/wx.js';
import bhInit from './bh/bh.js';

let mixinSdk = null;
export default (cb, config) => {
  if(mixinSdk)
    return mixinSdk;
  mixinSdk = (cb, config) => {
    let isWeiXin = () => /micromessenger/.test(navigator.userAgent.toLowerCase());
    let isDingTalk = () => /dingtalk/.test(navigator.userAgent.toLowerCase());
    if (isWeiXin()) {
      if (config.wx) {
        axios.post(config.wx.url, {
          url: window.location.href.replace(/#(\S+)?/, ''),
          corp: config.wx.corp
        })
          .then((res) => {
            wxInit(cb, {
              debug: false,
              appId: res.data.data.corpId,
              timestamp: res.data.data.timestamp,
              nonceStr: res.data.data.nonceStr,
              signature: res.data.data.signature,
              jsApiList: [
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
              ]
            });
          })
          .catch((error) => {
            console.log(error);
          });
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
