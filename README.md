# Wisedu Mobile JavaScript SDK

这是个兼容包，包含微信和今日校园的所有jdk，并且提供了公共方法，未来会补上钉钉的jdk
内部依赖bh-mobile-sdk(今日校园)和bh-wx-sdk(微信)两个npm包


## 安装

```
TODO：
npm install bh-mixin-sdk
```

## 使用

```
TODO：
import init from 'bh-mixin-sdk'
var config = {
    wx:{},//微信jdk初始化参数
    dd:{},//钉钉jdk初始化参数
};
var SDK = null;
init((res) => {
    console.log(res.type)
    console.log(res.sdk)
    if(res.type === 'success'){
        SDK = res.sdk
    }
},config)

微信原生api都挂在wx的命名下，如：
//关闭当前窗口
SDK.wx.closeWindow();

今日校园原生api都挂在bh的命名下，如：
//关闭当前窗口
SDK.bh.UI.closeWebView()

TODO:
钉钉api
```

## 公共API

SDK提供了如下公共方法，并对他们的入参和出参做了兼容

**`takeCamera({isfront:Boolean,sizeType:Array,callback:Function})`**
唤起系统相机拍照

#### Arguments
1. `isfront`:   今日校园参数，是否开启前置摄像头，默认false
2. `sizeType`:  微信参数，可以指定是原图还是压缩图，['original', 'compressed']，默认二者都有
3. `callback`:  回调

```
SDK.takeCamera({
    isfront:false,
    callback:function(ret){
        console.log(ret.srcs);
    }
});
```

#### callback入参
`结构`: {srcs:[]} 
`srcs`: 图片url列表，可以作为img标签的src属性显示图片



**`takePhoto({limit:Number,sizeType:Array,callback:Function})`**
唤起系统相册

#### Arguments
1. `limit`:   最大图片数，默认是1
2. `sizeType`:  微信参数，可以指定是原图还是压缩图，['original', 'compressed']，默认二者都有
3. `callback`:  回调

```
SDK.takePhoto({
    limit:1,
    callback:function(ret){
        console.log(ret.srcs)
    }});
```

#### callback入参
`结构`: {srcs:[]} 
`srcs`: 图片url列表，可以作为img标签的src属性显示图片

**`previewImages({infos:Array,showIndex:number})`**
1.`infos`:[{url:'',desc:''}],url:图片路径，desc：图片描述，今日校园参数
2.`showIndex`:展示第几张图片，默认是0

```
SDK.previewImages({
    infos:[{
        url:'',
        desc:''
    }],
    showIndex:0
});
```

**`closeWebView()`**

关闭当前网页窗口接口

```
SDK.closeWebView();
```

**`scan({callback:Function,keeping:Boolean})`**
二维码扫描

#### Arguments
1.`callback`:扫描回调
2.`keeping`:今日校园参数，是否持续扫描，如果是，当扫描到结果后不会立刻关闭扫描界面，还会继续扫描。默认false

```
SDK.scan({
    callback:function(ret){
        console.log("扫描结果" + ret);
    },
    keeping:false
});
```

**`uploadImgsToEmap({host:String,files:Array,config:Object})`**
上传图片到emap

#### Arguments
1.`host`:今日起校园参数，emap服务前缀，微信取初始化参数中的emapPrefixPath
2.`files`:图片url，对于微信而言，url指wx.uploadImage返回的serverId
3.`config`:今日校园参数

```
SDK.uploadImgsToEmap({
    host:'http://demoapp.wisedu.com/emap/',
    files:['']
});
```


