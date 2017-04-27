import init from 'bh-wx-sdk';
import proxy from './proxy.js';

export default function(callback, config = {}) {
    init(function(sdk) {
        var mobileSDK = {};
        proxy(sdk, mobileSDK);
        callback(mobileSDK);
    }, config);
}
