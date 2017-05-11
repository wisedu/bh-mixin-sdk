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
        wxInit(cb, config.wx);
      }
      return;
    }
    if (isDingTalk()) {
      if (config.dd) {}
      return;
    }
    bhInit(cb, config.https);
  }
  return mixinSdk;
};
