import {init} from 'bh-mobile-sdk';
import proxy from './proxy.js';

export default function(callback, config = {}) {
    init(function() {
        if (global.BH_MOBILE_SDK) {
            var sdk = BH_MOBILE_SDK;
            var mobileSDK = {};
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
