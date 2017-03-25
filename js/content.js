$(document).ready(function(){
    var arr = [];
    var currCount = {num : 0};
    var userInfo = false;
    var GoodPubInfoArr;
    var currItemData = null;
    var hostname = window.location.hostname;
    var domain = hostname.split('.')[1];
    var currUrl = window.location.href;
    var appendPageElement = document.createElement("div");
    appendPageElement.id = "prefix";
    appendPageElement.innerHTML = '<div id="draggable"><div class="draggable-title"><span>选品台</span> <a target="_blank" href="http://shang.qq.com/wpa/qunwpa?idkey=e6b17e6d85705bd1937ec241fd316affd0a312a5cc381c327fe482c9420d281a"><img border="0" src="http://pub.idqqimg.com/wpa/images/group.png" alt="选品插件交流群" title="选品插件交流群"></a></div><div class="draggable-main" id="draggable-main"><p><button id="actionButton" type="button" class="btn btn-primary">采集</button></p><div id="draggable-message" class="draggable-message"></div><p><button id="getGoodPubInfo" type="button" class="btn btn-primary">排重</button></p><div id="GoodPubInfo"><table><thead><tr><th>站点名</th><th>V</th><th>B</th><th style="width: 56%;">发布时间</th></tr></thead><tbody><tr v-for="item in items"><td>{{item.darenName}}</td><td>{{test(item.darenIsV)}}</td><td>{{test(item.darenIsB)}}</td><td>{{item.goodPubTime}}</td></tr></tbody></table></div><div id="currDataInfo"></div></div></div><div id="preview"><div class="preview-title"><span class="glyphicon glyphicon-chevron-right pull-left" id="openBtn" title="展开"></span><span class="glyphicon glyphicon-chevron-left pull-right" id="closeBtn" title="收缩"></span><p class="menu"><button type="button" class="btn btn-default btn-xs" id="countNum">{{ count.num }}</button><button type="button" class="btn btn-default btn-xs" id="clearall">清空</button><button type="button" class="btn btn-default btn-xs" data-toggle="modal" data-target="#myModal" id="mymodalpreview">预览</button><button type="button" class="btn btn-default btn-xs" id="daochu" target="_blank" href="">导出</button></p></div><div class="preview-main" id="preview-main"><div class="xuanpintai">选品台</div><div id="preview-list"><ul id="xuanList"><li v-for="item in items"><a href="{{ item.goodUrl }}" target="_blank"><img :src="item.goodImg" title="{{ item.goodTitle }}"/><button type="button" class="close" data-dismiss="modal" aria-hidden="true" title="删除" v-on:click.stop.prevent="del(item.goodId)">×</button></a><span>￥{{ item.goodOrgPrice }}</span></li></ul></div><div class="clear"></div></div></div><div id="prefix"><div class="modal fade bs-example-modal-lg" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="modal-title" id="myModalLabel">编辑采集商品<span id="previewCount">当前采集台个数 <em>{{ count.num }}</em> 个</span></h4><p class=""><span class="modal-span">时间 </span><input type="text" id="config-time" class="form-control input-sm" name="datetimerange"><span class="modal-span">价格 </span><input class="form-control input-sm" type="text" name="startPrice" value=""> - <input class="form-control input-sm" type="text" name="endPrice" value=""><span class="modal-span">平台 </span><select class="form-control input-sm" name="goodShopType"><option value="0" selected="selected">全部</option><option value="1">天猫</option><option value="2">淘宝</option></select><span class="modal-span">销量 </span><input class="form-control input-sm" type="text" name="recentGoodSoldStart" value=""> - <input class="form-control input-sm" type="text" name="recentGoodSoldEnd" value=""><span class="modal-span">包邮 </span><select class="form-control input-sm" name="postFee"><option value="0" selected="selected">全部</option><option value="1">包邮</option><option value="2">不包邮</option></select><button type="button" class="btn btn-primary btn-sm" id="paramFind">查询</button></p></div><div class="modal-body"><div class="row" id="alertmodalList"><div class="col-md-3" v-for="item in items"><div class="thumbnail"><a class="thumbnailset" href="{{ item.goodUrl }}" target="_blank"><img :src="item.goodImg"/><button type="button" class="btn btn-danger btn-xs pull-right" v-on:click.stop.prevent="del(item.goodId)">删除</button><span>{{ item.goodTitle }}</span></a><div class="caption"><p class="clearfix"><span class="{{ item.goodShopType===\'1\' ? \'tmallpng\' : \'taobaopng\' }}" ></span><span class="goodOrgPrice">￥{{ item.goodOrgPrice }}</span><span class="pull-right">销量:{{ item.goodSalesVolume }}</span></p><p>时间: {{ item.createTime }}</p><p><a href="{{item.goodShopUrl}}" target="_blank">{{item.goodShopName}}</a></p><p><img :src="item.goodShopLevelImg"/></p></div></div></div></div></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">关闭</button></div></div></div></div></div><button type="button" class="btn btn-primary" id="imageBtn">采集</button>';
    document.body.appendChild(appendPageElement);
    

    var GoodPubInfo = new Vue({
        el: '#GoodPubInfo',
        data: {
            items: GoodPubInfoArr
        },
        methods: {
            test: function (attr) {
                if(attr === 'Y'){
                    return '是';
                }
                if(attr === 'N'){
                    return '否';
                }
                if(attr === 'U'){
                    return '不确定';
                }
            }
        }
    });

    $(function() {
        $( "#draggable" ).draggable({
            scroll: false
        });
    });

    var port = chrome.runtime.connect({name: 'content_script'});
    port.postMessage({action : "getUserStatus"});
    if(hostname === 'item.taobao.com' || hostname === 'detail.tmall.com'){
        port.postMessage({action : "getItemData", data : currUrl});
    }
    port.onMessage.addListener(function(msg) {
        switch (msg.action) {
            case "getUserStatus":
            getUserStatus(msg);
            break;
            case "addGoodsInfo":
            addGoodsInfoFun(msg.data);
            break;
            case "removeGoodsInfo":
            removeGoodsInfoFun(msg.data);
            break;
            case "removeAllGoodsInfo":
            removeAllGoodsInfoFun();
            break;
            case "getAllGoodsInfo":
            getAllGoodsInfoFun(msg, port);
            break;
            case "getFindGoodsInfo":
            getFindGoodsInfoFun(msg, port);
            break;
            case "loginStatus":
            loginStatus();
            break;
            case "requestError":
            requestError(msg.data);
            break;
            case "getItemData":
            getItemData(msg);
            break;
            case "getGoodPubInfo":
            getGoodPubInfo(msg);
            break;
            default:
            break;
        }
    });

    var previewListVue = new Vue({
        el: '#xuanList',
        data: {
            items: arr
        },
        methods: {
            del: function (goodId) {
                port.postMessage({action : "removeGoodsInfo", data: JSON.stringify({goodId: goodId})});
            }
        },
        computed: {
            iconClass: function () {
                if (this.item.goodShopType === 1) {
                    return 'tmall'
                } else {
                    return 'taobao'
                }
            }
        }
    });

    var alertmodalListVue = new Vue({
        el: '#alertmodalList',
        data: {
            items: arr
        },
        methods: {
            del: function (goodId) {
                port.postMessage({action : "removeGoodsInfo", data: JSON.stringify({goodId: goodId})});
            }
        }
    });

    var countNum = new Vue({
        el: '#countNum',
        data: {
            count: currCount
        }
    });

    var previewCount = new Vue({
        el: '#previewCount',
        data: {
            count: currCount
        }
    });



    $("#actionButton").click( function () {
        getGoodsInfo();
    });

    $("#mymodalpreview").click( function () {
        port.postMessage({action : "getAllGoodsInfo", data: JSON.stringify({})});
    });

    $("#clearall").click( function () {
        port.postMessage({action : "removeAllGoodsInfo"});
    });

    $("#dsfdsfdssdfsdfs").click( function () {
        port.postMessage({action : "removeAllGoodsInfo"});
    });

    $("#closeBtn").click(function (){
        $("#closeBtn").hide();
        $("#openBtn").show();
        $(".preview-title .menu").hide();
        $("#preview-list").hide();
        $("#preview").attr('style', 'border-right: none;width: 51px;');
    });

    $("#openBtn").click(function (){
        $("#openBtn").hide();
        $("#closeBtn").show();
        $(".preview-title .menu").show();
        $("#preview-list").show();
        $("#preview").attr('style', '');
    });

    $("#findBtn").click(function (){
        var temp;
        port.postMessage({action : "getAllGoodsInfo", data: JSON.stringify(temp)});
    });

    $("#paramFind").click(function(){
        var data;
        data = getParamFindData();
        if(data)
            port.postMessage({action : "getFindGoodsInfo", data: JSON.stringify(data)});
        else
            alert('价格和销量必须填写大于0的数字');
    });

    $("#getGoodPubInfo").click(function (){
        var goodUrl = JSON.stringify({goodUrl: currItemData.goodUrl});
        port.postMessage({action : "getGoodPubInfo", data: goodUrl});
    });





    var privateBtn = '<button type="button" class="private-btn private-btn-primary">采集</button>';

    if(hostname !== 'detail.tmall.com' && hostname !== 'item.taobao.com'){
        $("#actionButton").parent().hide(); $("#getGoodPubInfo").parent().hide(); $("#currDataInfo").hide();
        $(document).on("click", ".private-btn", function () {
            var currElement = $(this);
            currElement.attr({'disabled': 'disabled', 'class': 'private-btn private-btn-default'});
            currElement.text('采集中');
            $("#draggable-message").text('采集中...');
            var href = currElement.prev().attr('href');
            port.postMessage({action : "getItemData", data : href, submit: true});

        });
        var targetId;
        if(hostname === 's.taobao.com'){
            targetId = 'mainsrp-bottomsearch';
        } else if(domain === 'tmall'){
            targetId = 'mc-menu-hd';
        }else{
            targetId = 'storagetool';
        }

        var callback = function(records){
            records.map(function(record){
                if(record.target.id === targetId){
                    stupObserve();
                }
            });
        };

        var mo = new MutationObserver(callback);

        mo.observe(document.body, {'childList': true,'subtree': true});
    }
    function stupObserve(){
        mo.disconnect();
        if(hostname === 's.taobao.com'){
            $(".pic").each(function(){
                $(this).append(privateBtn);
            });
            $('#J_shopkeeper img').parent().each(function(){
                $(this).after(privateBtn);
            });
        } else if(hostname === 'list.tmall.com'){
            $(".productImg-wrap").each(function(){
                $(this).append(privateBtn);
            });
        } else {
            $(".photo").each(function(){
                $(this).append(privateBtn);
            });
        }
        if(!userInfo){
            $(".private-btn").each(function(){
                $(this).attr({'disabled': 'disabled', 'class': 'private-btn private-btn-default'});
            });
        }
    }


    function getAllGoodsInfoFun(msg, port){
        var temp = msg.data.object;
        var previewTemp = temp.slice(0,5);

        alertmodalListVue.items = temp;
        previewListVue.items = previewTemp;
        currCount.num = msg.data.object.length;
    }

    function getFindGoodsInfoFun(msg, port){
        alertmodalListVue.items = msg.data.object;
    }

    function getGoodsInfo() {
        if(currItemData !== null){
            
            // console.log(currItemData);

            port.postMessage({action : "addGoodsInfo", data: JSON.stringify(currItemData)});
        }else{
            try{
                var getObj = new getPageData(domain);
                var when = getObj.getData();
                when.done(function(pageData){
                    port.postMessage({action : "addGoodsInfo", data: JSON.stringify(pageData)});
                });
            } catch(e){
                changeStatus('采集失败', '有页面元素没有采集到', '', true, time = 3);
                throw new Error('采集失败');
            }
        }
    }

    function getUserStatus(msg){
        $('.draggable-title span').text('选品台' + msg.version);
        if(msg.hasOwnProperty('data')){
            userInfo = true;
            port.postMessage({action : "getAllGoodsInfo", data: JSON.stringify({})});
            if(msg.data.hasOwnProperty('userRights')){
                $("#getGoodPubInfo").show();
            }
            $("#daochu").click( function () {
                window.open(msg.data.download);
            });
        }else{
            loginStatus();
        }
    }

    function getGoodPubInfo(msg){
        if(msg.data.success){
            if(msg.data.object.length > 0){
                GoodPubInfo.items = msg.data.object;
                $("#GoodPubInfo").show();
            }else{
                changeStatus('', '没有查到重复数据', '');
            }
        }else{
            changeStatus('', msg.data.message, '');
        }
    }

    function getItemData(msg){
        if(typeof(msg.data) === 'object'){
            currItemData = msg.data;
            var dataHtml = '<p>描述:'+msg.data.goodShopDescriptionMatchSocre+' 服务:'+msg.data.goodShopServiceAttitudeScore+' 物流:'+msg.data.goodShopDeliverySpeedScore+'</p><p>好评率:'+msg.data.goodShopPraiseRate+' </p><p>退款纠纷率:'+msg.data.goodShopDisputeRefundRate+'</p><p>好评:'+msg.data.goodCommentsHigh+' 中评:'+msg.data.goodCommentsMid+' 差评:'+msg.data.goodCommentsLow+'</p><p>满意度:'+msg.data.descriptionMatchSocre+'</p>';
            $("#currDataInfo").html(dataHtml);
        }
    }

    function getParamFindData(){
        var dataError = false;
        var data = {
            startPrice : 0,
            endPrice : 0,
            goodShopType : 0,
            recentGoodSoldStart : 0,
            recentGoodSoldEnd : 0,
            createTimeStart : '',
            createTimeEnd : '',
            postFee : 0,
        };
        var param = $('.modal-header [name]');
        param.each(function() {
            if(this.name !== 'datetimerange'){
                if(this.value !== ''){
                    data[this.name] = this.value;
                    if(isNaN(parseFloat(this.value)) || parseFloat(this.value) < 0){
                        dataError = true;
                    }
                }
            }
        });
        if(dataError){
            return false;
        }
        var daterange = param[0].value.split(' - ');
        data.createTimeStart = daterange[0];
        data.createTimeEnd = daterange[1];
        return data;
    }

    function addGoodsInfoFun(data){
        if(data.success)
            changeStatus('采集成功', data.message, '', true, 0);
        else
            changeStatus('采集失败', data.message, '', true, 0, 'btn btn-danger');
    }

    function loginStatus(){
        userInfo = false;
        changeStatus('未登录', '请登录后刷新页面采集', '', true, time = 0);
        $("#clearall").attr('disabled', 'disabled');
        $("#mymodalpreview").attr('disabled', 'disabled');
        $("#daochu").attr('disabled', 'disabled');
    }

    function removeGoodsInfoFun(data){
        changeStatus('', data.message, '', true, time = 0, '');
    }

    function requestError(data){
        if(data.hasOwnProperty('message')){
            changeStatus('请求失败', data.message, '', null, time = 0, 'btn btn-danger');
        }
    }

    var imageBtn = $("#imageBtn");
    imageBtn.click(function(){
        getGoodsInfo();
    });
    if(hostname === 'item.taobao.com'){

        var left = $('#J_ImgBooth').offset().left+400-82;
        imageBtn.attr('style', 'top: 253px;left: '+left+'px;z-index: 900000000;');
    }
    if(hostname === 'detail.tmall.com'){
        var left = $('#J_ImgBooth').offset().left+418-82;
        imageBtn.attr('style', 'top: 270px; left: '+left+'px; z-index: 900000000;');
    }
    function changeStatus(btnText='', message, style, disableBtn=null, time = 0, className=''){
        var i = time;
        var actionButton = $("#actionButton");
        var draggableMessage = $("#draggable-message");
        if(btnText !== ''){
            actionButton.text(btnText);
            imageBtn.text(btnText);
        }
        if(className !== ''){
            actionButton.attr('class', className);
            imageBtn.attr('class', className);
        }
        if(disableBtn){
            actionButton.attr('disabled', 'disabled');
            imageBtn.attr('disabled', 'disabled');
        }else{
            actionButton.removeAttr('disabled');
            imageBtn.removeAttr('disabled');
        }
        draggableMessage.text(message);

        if(i > 0){
            var time = 3;
            var interval = setInterval(function(){
                var newmessage = message + time;
                draggableMessage.text(newmessage);
                time--;
                if(time === 0){
                    clear();
                }
            }, 1000);
            function clear(){
                window.clearInterval(interval);
                actionButton.removeAttr('disabled');
                imageBtn.removeAttr('disabled');
                draggableMessage.text('');
            }
        }
    }

    var thetime = moment().format('YYYY-MM-DD HH:mm:ss');
    $('#config-time').daterangepicker({
        "parentEl": '#myModal',
        "timePicker": true,
        "timePicker24Hour": true,
        "timePickerSeconds": true,
        "autoApply": true,
        "ranges": {
            "今天": [
            moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            thetime
            ],
            "昨天": [
            moment().subtract(1,'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            moment().subtract(1,'days').endOf('day').format('YYYY-MM-DD HH:mm:ss')
            ],
            "最近 7 天": [
            moment().subtract(7,'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            thetime
            ],
            "最近 30 天": [
            moment().subtract(30,'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            thetime
            ],
            "本月": [
            moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
            moment().format('YYYY-MM-DD HH:mm:ss')
            ],
            "上个月": [
            moment().subtract(1,'month').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            moment().subtract(1,'month').startOf('day').format('YYYY-MM-DD HH:mm:ss')
            ]
        },
        "locale": {
            "direction": "ltr",
            "format": "YYYY-MM-DD HH:mm:ss",
            "separator": " - ",
            "applyLabel": "确认",
            "cancelLabel": "取消",
            "fromLabel": "从",
            "toLabel": "到",
            "customRangeLabel": "自定义",
            "daysOfWeek":["日","一","二","三","四","五","六"],
            "monthNames": ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],

            "firstDay": 1
        },
        "alwaysShowCalendars": true,
        "startDate": moment().subtract(3,'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        "endDate": thetime
    }, function(start, end, label) {
      console.log("New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')");
  });
});