function getPageData(shopName){
    this.shopName = shopName;
    this.data = {
        'goodSalesVolume' : 0,                      //销量        
        'goodComPrice' : 0,                         //促销价
        'goodTitle' : '',                           //标题
        'goodUrl' : '',                             //商品url
        'goodOrgPrice' : 0,                         //原价
        'goodImg' : '',                             //首图
        'goodId' : 0,                               //商品id
        'goodShopType' : 0,                         //商城类型 (1天猫, 2淘宝)
        'goodShopName' : '',                        //店铺名
        'goodShopUrl' : '',                         //店铺url
        'goodShopLevel' : 0,                        //店铺等级------(C)*
        'goodShopDescriptionMatchSocre' : 0,        //描述分
        'goodShopServiceAttitudeScore' : 0,         //服务分
        'goodShopDeliverySpeedScore' : 0,           //物流分
        'goodShopPraiseRate' : 0,                   //店铺好评率----(C)*
        'goodShopDisputeRefundRate' : 0,            //30天纠纷率----(*B&C)*
        'goodShopGoodPraiseRate' : 0,               //卖家信用好评率(C)*
        'goodCommentsTotal' : 0,                    //评论总数------(C)*
        'goodCommentsHigh' : 0,                     //好评总数------(C)*
        'goodCommentsMid' : 0,                      //中评总数------(C)*
        'goodCommentsLow' : 0,                      //差评总数------(C)*
        'descriptionMatchSocre' : 0,                //与描述相符分--(B)*
        'postFee' : 0                               //是否包邮 (1包邮, 2不包邮)
    };
    this.shopName === 'tmall' ? this.data.goodShopType = 1 : this.data.goodShopType = 2;
}

getPageData.prototype.getData = function(){
    var temp
    if(this.shopName === 'taobao')
        temp = this.taobao();
    else
        temp = this.tmall();
    
    return temp;
}

getPageData.prototype.taobao = function(){


    this.data.goodSalesVolume = document.getElementById('J_SellCounter').innerText;
    this.data.goodTitle = document.querySelector('.tb-main-title').getAttribute('data-title');
    this.data.goodId = document.querySelector("input[name='item_id']").value;
    this.data.goodUrl = 'https://item.taobao.com/item.htm?id=' + this.data.goodId;
    this.data.goodImg = document.querySelector('.tb-s50 img').src.replace('50x50', '400x400');
    if(this.getPrice() && this.getShopNameLink() && this.getDSR() && this.getPostage() && this.getLink() &&  this.sendRequest()){
        var dfd = $.Deferred(); 
        this._dfd.done(function(extract, data, a1, a2, a3){
            var data = extract(data, a1[0], a2[0], a3[0]);
            dfd.resolve(data);
        });
    }
    
    return dfd.promise(); 
}

getPageData.prototype.tmall = function(){
    this.data.goodSalesVolume = document.getElementsByClassName('tm-count')[0].innerText;
    this.data.goodTitle = document.getElementsByTagName('h1')[1].innerText;
    this.data.goodId = document.getElementById('LineZing').getAttribute('itemid');;
    this.data.goodUrl = 'https://detail.tmall.com/item.htm?id=' + this.data.goodId;
    this.data.goodImg = document.querySelector('#J_UlThumb img').src.replace('60x60', '430x430');
    if(this.getPrice() && this.getShopNameLink() && this.getDSR() && this.getPostage() && this.getLink() && this.sendRequest()){
        var dfd = $.Deferred(); 
        this._dfd.done(function(extract, data, a1, a2){
            var data = extract(data, a1[0], a2[0]);
            dfd.resolve(data);
        });
        
        return dfd.promise(); 
    }
}

getPageData.prototype.getPrice = function(){
    var priceElement, goodComPrice, goodOrgPrice;
    if(this.shopName === 'taobao'){
        priceElement = document.getElementsByClassName('tb-rmb-num');
    } else {
        priceElement = document.getElementsByClassName('tm-price');
        
    }
    goodOrgPrice = priceElement[0].innerText;
    (priceElement.length === 1) ? goodComPrice = goodOrgPrice : goodComPrice = priceElement[1].innerText;
    this.data.goodComPrice = this.priceHandle(goodComPrice);
    this.data.goodOrgPrice = this.priceHandle(goodOrgPrice);
    
    return true;
}

getPageData.prototype.priceHandle = function(price){
    var temp;
    if(price.match('-') === null){
        return price;
    } else {
        temp = price.split('-');
        return temp[0];
    }
}

getPageData.prototype.getShopNameLink = function(){
    var shopNameLink;
    if(this.shopName === 'taobao'){
        shopNameLink = document.querySelector('.tb-shop-name a');
        (shopNameLink === null) ? shopNameLink = document.querySelector('.shop-name-link') : shopNameLink;
        this.data.goodShopName = shopNameLink.innerText.trim();
        this.data.goodShopUrl = this.urlHandle(shopNameLink.href);
    } else {
        shopNameLink = document.querySelector('.slogo-shopname');
        this.data.goodShopName = shopNameLink.innerText.trim();
        this.data.goodShopUrl = this.urlHandle(shopNameLink.href);
    }
    
    return true;
}

getPageData.prototype.urlHandle = function(url){
    var index = url.search(/\?/);
    if(index > 0){
        return url.substring(0, url.search(/\?/));
    }
    
    return url;
}

getPageData.prototype.getDSR = function(){
    var DSR;
    if (this.shopName === 'taobao') {
        DSR = document.querySelectorAll('.tb-shop-rate dd');
        (DSR.length === 0) ? DSR = document.querySelectorAll('.shop-service-info-list em') : DSR;
    } else {
        DSR = document.querySelectorAll('#shop-info .main-info span');
    }

    this.data.goodShopDescriptionMatchSocre = DSR[0].innerText.trim();
    this.data.goodShopServiceAttitudeScore  = DSR[1].innerText.trim();
    this.data.goodShopDeliverySpeedScore    = DSR[2].innerText.trim();
    
    return true;
}

getPageData.prototype.getPostage = function(){
    var postage, match;
    if(this.shopName === 'taobao'){
        postage = document.getElementById('J_WlServiceTitle');
        match = '免运费';
    }else{
        postage = document.getElementById('J_PostageToggleCont');
        match = '0\.00';
    }
    postage.innerText.match(match) ? this.data.postFee = 1 : this.data.postFee = 2;
    
    return true;
}

getPageData.prototype.getLink = function(){
    var idArr, shopId, userNumId, commentUrl, refundIndexUrl, reteUrl;
    idArr = document.querySelector('meta[name=microscope-data]').content.match(/shopId=(\d+);(|\s)userid=(\d+);/);
    shopId = idArr[1];
    userNumId = idArr[3];
    refundIndexUrl = 'https://tosp.taobao.com/json/refundIndex.htm?shopId=' + shopId;

    if(this.shopName === 'taobao'){
        commentUrl = 'https://rate.taobao.com/detailCommon.htm?auctionNumId=' + this.data.goodId + '&userNumId=' + userNumId;
        refundIndexUrl += '&businessType=1';
        reteUrl = document.querySelector('.tb-shop-rank a');
        (reteUrl === null) ? reteUrl = document.querySelector('.info-item a').href : reteUrl = reteUrl.href ;
    } else {
        commentUrl = 'https://dsr-rate.tmall.com/list_dsr_info.htm?itemId=' + this.data.goodId + '&sellerId=' + shopId;
        refundIndexUrl += '&businessType=0';
    }
    
    this.commentUrl     = commentUrl;
    this.refundIndexUrl = refundIndexUrl;
    this.reteUrl        = reteUrl;
    
    return true;
}

getPageData.prototype.sendRequest = function(){
    if(this.shopName === 'taobao'){
        this._dfd = $.when(
            this.extract,
            this.data,
            $.ajax({type:'get', url:this.commentUrl, dataType: 'text'}),
            $.ajax({type:'get', url:this.refundIndexUrl, dataType: 'text'}),
            $.ajax({type:'get', url:this.reteUrl, dataType: 'text'})
        );
    }else{
        this._dfd = $.when(
            this.extract,
            this.data,
            $.ajax({type:'get', url:this.commentUrl, dataType: 'text'}),
            $.ajax({type:'get', url:this.refundIndexUrl, dataType: 'text'})
        );
    }
    
    return true;
}

getPageData.prototype.extract = function(d, com, ri, rt = null){
    var refundValue, commentValue, praiseValue, creditValue;
    if(rt !== null){
        refundValue = ri.match(/shopValue":"(\d+\.\d+)%"},"asSlrRate30d/);
        commentValue = com.match(/normal":(\d+),"hascontent":\d+,"good":(\d+),"pic":\d+,"bad":(\d+),"totalFull":(\d+)}/);
        praiseValue = rt.match(/好评率：(\d{1,2}\.\d{1,2}|\d{1,3})%/);
        creditValue = rt.match(/<span id="chart-num" class="data">(\d+)<\/span>/);
        d.goodShopLevel = creditValue[1];
        d.goodShopPraiseRate = praiseValue[1];
        d.goodCommentsTotal = commentValue[4];
        d.goodCommentsHigh = commentValue[2];
        d.goodCommentsMid = commentValue[1];
        d.goodCommentsLow = commentValue[3];
    } else {
        refundValue = ri.match(/shopValue":"(\d+\.\d+)%"},"asSlrEndRateDTO/);
        commentValue = com.match(/gradeAvg":(\d\.\d),/);
        d.descriptionMatchSocre = commentValue[1];
    }
    d.goodShopDisputeRefundRate = refundValue[1];

    return d;
}