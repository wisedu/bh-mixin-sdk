import wxInit from './wx/wx.js';
import bhInit from './bh/bh.js';

function isWeiXin() {
    var ua = window.navigator.userAgent.toLowerCase();
    return ua.indexOf('micromessenger') !== -1;
}

function isDingTalk() {
    var ua = window.navigator.userAgent.toLowerCase();
    return ua.indexOf('dingtalk') !== -1;
}

var sdkinit = function(callback, config) {
    if (isWeiXin()) {
        if (config.wx) {
            wxInit(callback, config.wx);
        }
        return;
    }
    if (isDingTalk()) {
        if (config.dd) {}
        return;
    }
    bhInit(callback, config.https);
};

export default sdkinit;
