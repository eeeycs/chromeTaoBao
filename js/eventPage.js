var api = {
    "signup"                    : "http://123.57.213.217:8998/wb/user/addUserInfoV1.do",
    "login"                     : "http://123.57.213.217:8998/wb/user/checkUserLoginInfoV1.do",
    "addGoodsInfo"              : "http://123.57.213.217:8998/wb/workbench/addGoodInfoV2.do",
    "getAllGoodsInfo"           : "http://123.57.213.217:8998/wb/workbench/getAllGoodInfoV2.do",
    "addGoodsInfoApi"           : "http://123.57.213.217:8998/wb/workbench/addGoodInfoV2.do",
        
    "removeGoodsInfoApi"        : "http://123.57.213.217:8998/wb/workbench/removeGoodInfo.do",
    "removeAllGoodsInfoApi"     : "http://123.57.213.217:8998/wb/workbench/removeAllGoodInfo.do",
    "getAllGoodsInfoApi"        : "http://123.57.213.217:8998/wb/workbench/getAllGoodInfo.do",
    "exportAllGoodsInfoApi"     : "http://123.57.213.217:8998/wb/workbench/exportAllGoodInfo.do",
    "getGoodPubInfoApi"         : "http://123.57.213.217:8998/wb/good/getGoodPubInfo.do",
}
var userId, userInfo, itemUrl;
var manifest = chrome.runtime.getManifest();
var version = manifest.manifest_version + parseFloat(manifest.version);

chrome.runtime.onConnect.addListener(function (port) {
    console.log(port);
    port.onMessage.addListener(function (msg) {
        console.log(msg);
        switch (msg.action) {
            case "getUserStatus":
                getUserStatus(port);
                break;
            case "login":
                ajax("POST", api.login, {data : msg.data, versionCode: version}, login, port);
                break;
            case "signup":
                ajax("POST", api.signup, {data : msg.data, versionCode: version}, signup, port);
                break;
            case "logout":
                logout();
                break;
            default:
                returnLoginStatus(msg, port);
        }
    });
});

function returnLoginStatus (msg, port){
    console.log(msg);
    console.log(port);
    console.log(123);
    if(userInfo === undefined){
        port.postMessage({action: 'loginStatus', data: false});
    }else{
        switch (msg.action) {
            case "getItemData":
                getItemData(port, msg.data, msg.submit);
                break;
            case "getDownUrl":
                getDownUrl(port);
                break;
            case "addGoodsInfo":
                ajax("POST", api.addGoodsInfoApi, {userId : userInfo.userId, cooId : userInfo.cooId, data : msg.data,data2:msg.data.taobaoName,versionCode: version}, addGoodsInfo, port);
                break;
            case "removeGoodsInfo":
                ajax("POST", api.removeGoodsInfoApi, {userId : userInfo.userId, cooId : userInfo.cooId, data : msg.data, versionCode: version}, removeGoodsInfo, port);
                break;
            case "removeAllGoodsInfo":
                ajax("POST", api.removeAllGoodsInfoApi, {userId : userInfo.userId, cooId : userInfo.cooId, versionCode: version}, removeAllGoodsInfo, port);
                break;
            case "getAllGoodsInfo":
                ajax("POST", api.getAllGoodsInfo, {userId : userInfo.userId, cooId : userInfo.cooId, data: msg.data, versionCode: version}, getAllGoodsInfo, port);
                break;
            case "getFindGoodsInfo":
                ajax("POST", api.getAllGoodsInfo, {userId : userInfo.userId, cooId : userInfo.cooId, data: msg.data, versionCode: version}, getFindGoodsInfo, port);
                break;
            case "getGoodPubInfo":
                ajax("POST", api.getGoodPubInfoApi, {userId : userInfo.userId, cooId : userInfo.cooId, data: msg.data, versionCode: version}, getGoodPubInfo, port);
            default:
        }
    }
}

chrome.runtime.onMessage.addListener(function(message, sender) {
    if (message.sendBack) {
        chrome.tabs.sendMessage(sender.tab.id, {data: message.data});
    }
});


function ajax(requestType, requestUrl, requestData, calluserfun, port = null) {
    console.log(requestData);

    $.ajax({
        url : requestUrl,
        type : requestType,
        dataType : "JSON",
        data : requestData,
        success : function (data, textStatus, jqXHR) {
            if(port === null)
                calluserfun(data);
            else
                calluserfun(data, port);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            requestError("错误：服务器请求失败", port);
        }
    });
}

function getUserStatus(port){
    chrome.storage.local.get("userInfo", function (result) {
        if (result.hasOwnProperty("userInfo") && Date.now() < result.userInfo.expiration) {
            userInfo = result.userInfo;
            userInfo.download = api.exportAllGoodsInfoApi + '?cooId=' + userInfo.cooId + '&userId=' + userInfo.userId;
        } else {
            chrome.storage.local.remove("userInfo");
            userInfo = undefined;
        }
        port.postMessage({action: 'getUserStatus', data: userInfo, version:version});
    });
}

function addGoodsInfo(data, port){
    port.postMessage({action: 'addGoodsInfo', data: data});
    if(data.success){
        ajax("POST", api.getAllGoodsInfo, {userId : userInfo.userId, cooId : userInfo.cooId, data: JSON.stringify({}), versionCode: version}, getAllGoodsInfo, port);
    }
}

function removeGoodsInfo(data, port){
    port.postMessage({action: 'removeGoodsInfo', data: data});
    if(data.success){
        ajax("POST", api.getAllGoodsInfo, {userId : userInfo.userId, cooId : userInfo.cooId, data: JSON.stringify({}), versionCode: version}, getAllGoodsInfo, port);
    }
}

function removeAllGoodsInfo(data, port){
    port.postMessage({action: 'removeAllGoodsInfo', data: data});
    if(data.success){
        ajax("POST", api.getAllGoodsInfo, {userId : userInfo.userId, cooId : userInfo.cooId, data: JSON.stringify({}), versionCode: version}, getAllGoodsInfo, port);
    }
}

function getAllGoodsInfo(data, port){
    port.postMessage({action: 'getAllGoodsInfo', data: data});
}

function getFindGoodsInfo(data, port){
    port.postMessage({action: 'getFindGoodsInfo', data: data});
}

function getGoodPubInfo(data, port){
    port.postMessage({action: 'getGoodPubInfo', data: data});
}

function requestError(message, port){
    port.postMessage({action: 'requestError', data: {message: message, success: false}});
}

function signup(data,port){
    port.postMessage({action: 'signup', data: data});
}

function login(data,port){
    userInfo = data.object;
    if(data.success){
        var thetime = Date.now();
        data.object.expiration = thetime+864000000;
        chrome.storage.local.set({"userInfo" : data.object}, function () {
            console.log("user info success");
        });
    }
    port.postMessage({action: 'login', data: data});
}

function logout(){
    chrome.storage.local.remove("userInfo");
    userInfo = undefined;
}

chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        details.requestHeaders.push({ name: 'Referer', value: itemUrl});
        return { requestHeaders: details.requestHeaders };
    },
    {urls: ["https://detailskip.taobao.com/service/getData/1/p1/item/detail/sib.htm*", "https://mdskip.taobao.com/core/initItemDetail.htm*", "https://rate.taobao.com/user-rate-*"], types: ['xmlhttprequest']},
    ["blocking", "requestHeaders"]
);