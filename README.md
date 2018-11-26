# Wisedu Mobile JavaScript SDK

这是个兼容包，包含微信、钉钉和今日校园的sdk，并且提供了公共方法
,内部依赖bh-mobile-sdk(今日校园)和微信的sdk


## 安装

```
npm install bh-mixin-sdk
```

## 使用

```javascript
import init from 'bh-mixin-sdk'
var config = {
    wx:{
	    debug: false,
	    url: 'http://res.wisedu.com:8888/checkSign',//微信认证地址
	    corp: 'amptest',//认证应用ID
	 },//微信jdk初始化参数
    dd:{},//钉钉jdk初始化参数
};

var SDK = null;
init((res) => {
    new Vue()//项目初始实例化
},config)
在使用init启动完应用之后，可以直接使用全局方法，来使用sdk
例如：
BH_MIXIN_SDK.setTitleText('我的校园卡');

TODO:
钉钉api
```
对于微信jsdk，也可以将获取好的授权签名通过signData传进去，替代url

```javascript
var config = {
    wx:{
	    debug: false,
      signData: {
        corpId: '${corpId}',
        timestamp: '${timestamp}'
        nonceStr: '${nonceStr}',
        signature: '${signature}'
      }
	 },//微信jdk初始化参数
    dd:{},//钉钉jdk初始化参数
};
```


## 公共API

SDK提供了如下公共方法，并对他们的入参和出参做了兼容

**`takeCamera(isfront:Boolean,callback:Function,sizeType:Array)`**
唤起系统相机拍照

#### Arguments
1. `isfront`:   今日校园参数，是否开启前置摄像头，默认false
2. `callback`:  回调
3. `sizeType`:  微信接口

```
SDK.takeCamera(false,function(ret){
        console.log(ret);
    }
);
或
SDK.takeCamera(function(ret){
        console.log(ret);
    }
);
```

#### callback入参
`结构`: {base64:'',url:''} 或者 [{base64:'',url:''}] //今日校园为数组[{base64:'',url:''}]
`base64`: 可以作为img标签的src属性显示图片



**`takePhoto(callback:Function,limit:Number,sizeType:Array,sizeType:Array)`**
唤起系统相册

#### Arguments
1. `limit`:   最大图片数，默认是1
2. `callback`:  回调
3. `sizeType`:  微信接口

```
SDK.takePhoto(function(ret){
    console.log(ret)
},1);
```

#### callback入参
`结构`: {base64:'',url:''} || [{base64:'',url:''}] //单张图片为{}，多张为数组
`base64`: 可以作为img标签的src属性显示图片

**`previewImages(infos:Array,showIndex:number)`**
1.`infos`:[{url:'',desc:''}],url:图片路径，desc：图片描述，今日校园参数
2.`showIndex`:展示第几张图片，默认是0

```
SDK.previewImages([{
        url:'',
        desc:''
    }],
    0
);
```

**`closeWebView()`**

关闭当前网页窗口接口

```
SDK.closeWebView();
```

**`scan(callback:Function,keeping:Boolean)`**
二维码扫描

#### Arguments
1.`callback`:扫描回调
2.`keeping`:今日校园参数，是否持续扫描，如果是，当扫描到结果后不会立刻关闭扫描界面，还会继续扫描。默认false

```
SDK.scan(
    function(ret){
        console.log("扫描结果" + ret);
    },
    false
);
```

**`uploadImgsToEmap({host:String,srcs:Array,config:Object})`**
上传图片到emap

#### Arguments
1.`host`:今日起校园参数，emap服务前缀，微信取初始化参数中的emapPrefixPath
2.`urls`:图片url，takeCamera或者takePhoto返回的url
3.`config`:里面携带token

```
SDK.uploadImgsToEmap({
    host:'http://demoapp.wisedu.com/emap/',
    srcs:['']
});
```

**`setTitleText(String)`**
设置页面头部标题

#### Arguments
1.String，标题

```
SDK.setTitleText('移动迎新');
```


