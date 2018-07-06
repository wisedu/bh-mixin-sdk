import {init} from 'bh-mobile-sdk';
import proxy from './proxy.js';

export default function(callback, config = {}) {
    init(function() {
        if (global.BH_MOBILE_SDK) {
            var sdk = BH_MOBILE_SDK;
            var mobileSDK = {};
            sdk.UI.setBouncesEnabled(false); // 关闭今日校园（ios机型）上的禁用弹性效果
            proxy(sdk, mobileSDK);
            global.BH_MIXIN_SDK = mobileSDK;
            callback({
                type: 'success',
                sdk: mobileSDK
            });
        } else {
            callback({
                type: 'error',
                result: ''
            });
        }
    }, config.https);
}
