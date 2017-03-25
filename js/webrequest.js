function dataObj() {
	this.goodShopType = 0; //商城类型 (1天猫; 2淘宝)
	this.goodTitle = ''; //标题
	this.goodUrl = ''; //商品url
	this.goodImg = ''; //首图
	this.goodId = 0; //商品id
	this.goodShopName = ''; //店铺名
	this.goodShopUrl = ''; //店铺url
	this.goodOrgPrice = 0; //原价
	this.goodShopDescriptionMatchSocre = 0; //描述分
	this.goodShopServiceAttitudeScore = 0; //服务分
	this.goodShopDeliverySpeedScore = 0; //物流分    

	this.goodSalesVolume = 0; //销量        
	this.goodComPrice = 0; //促销价
	this.postFee = 0; //是否包邮 (1包邮; 2不包邮)

	this.goodCommentsTotal = 0; //评论总数------(C)*
	this.goodCommentsHigh = 0; //好评总数------(C)*
	this.goodCommentsMid = 0; //中评总数------(C)*
	this.goodCommentsLow = 0; //差评总数------(C)*

	this.goodShopPraiseRate = 0; //店铺好评率----(C)*
	this.goodShopLevel = 0; //店铺等级------(C)*
	this.goodShopGoodPraiseRate = 0; //卖家信用好评率(C)*
	this.goodShopDisputeRefundRate = 0; //30天纠纷率----(*B&C)*

	this.descriptionMatchSocre = 0; //与描述相符分--(B)*
	this.taobaoName = "";
};
var content, data;

function getItemData(port, url, currSubmimt) {
	data = new dataObj();
	if(url.match(/http/) === null) {
		url = urlHandle(url);
	}
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(xhr.readyState === 4 && xhr.status === 200) {
			itemUrl = this.responseURL;
			content = this.responseText;
			if(currSubmimt) {

				if(itemUrl.match(/detail\.tmall\.com/) === null && itemUrl.match(/item\.taobao\.com/) === null) {
					port.postMessage({
						action: "requestError",
						data: {
							message: '采集错误：该页面不是淘宝或天猫详情页'
						}
					});
					return;
				}
			}
			getLinkData(port, this.responseText, currSubmimt);
		}
		if(xhr.readyState === 4 && xhr.status !== 200) {
			port.postMessage({
				action: "getItemData",
				data: 'error1'
			});
		}
	};
	xhr.onerror = function() {
		port.postMessage({
			action: "getItemData",
			data: 'error2'
		});
	};
	xhr.open("GET", url);
	xhr.send();
}

var test;

function getLinkData(port, itemContent, currSubmimt) {
	try {
		var shopId, userId, goodsId, rateUrl, urlList, ansyHtm;
		var domain = itemUrl.match(/(item|detail)\.(taobao|tmall)/)[2];
		var shopAndUserId = itemContent.match(/shopId=(\d+);(|\s)userid=(\d+);/);

		shopId = shopAndUserId[1];
		userId = shopAndUserId[3];
		if(domain === 'taobao') {
			data.taobaoName = itemContent.match(/"tnik":unescape\(unescape\("(.*?)"\)\)}/)[1];
			goodsId = itemContent.match(/item_id" value="(\d+)"/)[1];
			data.goodShopType = 2;
			ansyHtm = urlHandle(itemContent.match(/newDc\s:\strue,\s+api\s+:\s'\/\/(.*)'/)[1]);
		}
		if(domain === 'tmall') {
			goodsId = itemContent.match(/itemid="(\d+)">/)[1];
			data.goodShopType = 1;
			test = itemContent;
			rateUrl = urlHandle(itemContent.match(/\/\/rate\.taobao\.com\/user-rate-\w+\.htm/)[0]);
		}
		data.goodId = goodsId;
		urlList = getLink(itemContent, goodsId, shopId, userId);
		setItemData(itemContent);
		if(data.goodShopType === 2) {
			$.ajax({
				type: 'get',
				url: ansyHtm,
				dataType: 'text'
			}).done(function(res) {
				var dsrArray = [];
				var currDsr;

				var dsrRe = /(\d\.\d)<\/span>/g;
				while(currDsr = dsrRe.exec(res)) {
					dsrArray.push(currDsr[1]);
				}
				while(currDsr = dsrRe.exec(res)) {
					dsrArray.push(currDsr[1]);
				}
				data.goodShopDescriptionMatchSocre = dsrArray[0];
				data.goodShopServiceAttitudeScore = dsrArray[1];
				data.goodShopDeliverySpeedScore = dsrArray[2];

				if(dsrArray[0] === undefined || dsrArray[1] === undefined || dsrArray[2] === undefined) {
					var dsrRe = /<em>(\d\.\d)<\/em>/g;
					while(currDsr = dsrRe.exec(res)) {
						dsrArray.push(currDsr[1]);
					}
					while(currDsr = dsrRe.exec(res)) {
						dsrArray.push(currDsr[1]);
					}
					data.goodShopDescriptionMatchSocre = dsrArray[0];
					data.goodShopServiceAttitudeScore = dsrArray[1];
					data.goodShopDeliverySpeedScore = dsrArray[2];
				}

				rateUrl = urlHandle(res.match(/\/\/rate\.taobao\.com\/user-rate-\w+\.htm/)[0]);
				requestData(urlList, rateUrl, port, currSubmimt);
			});
		} else {
			requestData(urlList, rateUrl, port, currSubmimt);
		}

	} catch(e) {
		console.log(e);
	}
}

function requestData(url, rateUrl, port, currSubmimt) {
	$.when(
		$.ajax({
			type: 'get',
			url: rateUrl,
			dataType: 'text'
		}),
		//$.ajax({type:'get', url:url.fuwu, dataType: 'text'}),
		$.ajax({
			type: 'get',
			url: url.pinglun,
			dataType: 'text'
		}),
		$.ajax({
			type: 'get',
			url: url.jiage,
			dataType: 'text'
		})
	).done(function(d1, d3, d4) {
		setCallData(d1[0], d3[0], d4[0]);
		console.log(data);
		if(currSubmimt) {
			console.log('submit');
			ajax("POST", api.addGoodsInfoApi, {
				userId: userInfo.userId,
				cooId: userInfo.cooId,
				data: JSON.stringify(data),
				versionCode: version
			}, addGoodsInfo, port);
		} else {
			console.log('nosubmit');
			port.postMessage({
				action: "getItemData",
				data: data
			});
		}
	});
}

function setItemData(itemContent) {
	if(data.goodShopType === 2) {
		data.goodTitle = itemContent.match(/data-title="(.*?)">/)[1];
		data.goodUrl = 'https://item.taobao.com/item.htm?id=' + data.goodId;
		data.goodImg = urlHandle(itemContent.match(/<a href="#"><img data-src="(.*?)" \/>/)[1].replace('50x50', '400x400'));
		data.goodOrgPrice = priceHandle(itemContent.match(/<em class="tb-rmb-num">(.*)<\/em>/)[1]);
		data.goodShopName = itemContent.match(/sellerNick\s+:\s'(.*)',/)[1];
		data.goodShopUrl = itemContent.match(/url : '(\/\/.*\.taobao\.com\/)'/)[1];
	} else {
		data.goodTitle = itemContent.match(/name="title" value="(.*)" \/>/)[1];
		data.goodUrl = 'https://item.taobao.com/item.htm?id=' + data.goodId;
		data.goodImg = urlHandle(itemContent.match(/<img id="J_ImgBooth" alt="(.*)" src="(.*)"   data-hasZoom/)[2]);
		data.goodShopName = itemContent.match(/<strong>(.*)<\/strong><\/a>/)[1];
		data.goodShopUrl = urlHandle(itemContent.match(/<a class="slogo-shopname" href="(.*)" data/)[1]);
		data.goodShopDescriptionMatchSocre = itemContent.match(/描述相符：<a target="_blank" href=".*">\s+<em class="count" title="\d\.\d+分">(\d\.\d)<\/em>/)[1];
		data.goodShopServiceAttitudeScore = itemContent.match(/服务态度：<a target="_blank" href=".*">\s+<em class="count" title="\d\.\d+分">(\d\.\d)<\/em>/)[1];
		data.goodShopDeliverySpeedScore = itemContent.match(/发货速度：<a target="_blank" href=".*">\s+<em class="count" title="\d\.\d+分">(\d\.\d)<\/em>/)[1];
	}
	return true;
}

function getLink(itemContent, goodsId, shopId, userId) {
	if(data.goodShopType === 2) {
		var jiage = urlHandle(itemContent.match(/sibUrl\s+:\s'(.*)',/)[1]);
		var pinglun = 'https://rate.taobao.com/detailCommon.htm?auctionNumId=' + goodsId + '&userNumId=' + userId;
		var fuwu = 'https://tosp.taobao.com/json/refundIndex.htm?shopId=' + shopId + '&businessType=1';
	} else {
		var jiage = "https://mdskip.taobao.com/core/initItemDetail.htm?addressLevel=2&isPurchaseMallPage=false&sellerPreview=false&cartEnable=true&tmallBuySupport=true&isApparel=true&isSecKill=false&offlineShop=false&tryBeforeBuy=false&itemId=" + goodsId + "&service3C=false&isUseInventoryCenter=false&showShopProm=false&queryMemberRight=true&isForbidBuyItem=false&household=false&isRegionLevel=false&isAreaSell=false&callback=setMdskip&timestamp=" + (+new Date()) + "&isg=null&isg2=null";
		var pinglun = 'https://dsr-rate.tmall.com/list_dsr_info.htm?itemId=' + goodsId + '&sellerId=' + shopId;
		var fuwu = 'https://tosp.taobao.com/json/refundIndex.htm?shopId=' + shopId + '&businessType=1';
	}

	return {
		jiage: jiage,
		pinglun: pinglun,
		fuwu: fuwu
	};
}

function setCallData(rate, pinglun, jiage) {
	//var fuwuObj = toObj(fuwu);
	var pinglunObj = toObj(pinglun);
	var jiageObj = toObj(jiage);

	if(data.goodShopType === 2) {
		data.goodSalesVolume = jiageObj.data.soldQuantity.confirmGoodsCount;
		data.goodComPrice = jiageObj.data.promotion.promoData.hasOwnProperty('def') ? priceHandle(jiageObj.data.promotion.promoData.def[0].price) : data.goodOrgPrice;
		if(jiageObj.data.deliveryFee.data.hasOwnProperty('serviceInfo')) {
			jiageObj.data.deliveryFee.data.serviceInfo.list[0].info.match(/免运费/) === null ? 2 : 1;
		}
		data.goodCommentsTotal = pinglunObj.data.count.total;
		data.goodCommentsHigh = pinglunObj.data.count.goodFull;
		data.goodCommentsMid = pinglunObj.data.count.normal;
		data.goodCommentsLow = pinglunObj.data.count.bad;

		var goodShopLevel = rate.match(/卖家信用：\s+(\d+)\s/);
		var goodShopPraiseRate = rate.match(/好评率：(\d+\.\d+)%<\/em>/);
		if(goodShopLevel !== null && goodShopPraiseRate !== null) {
			data.goodShopLevel = goodShopLevel[1];
			data.goodShopPraiseRate = goodShopPraiseRate[1];
		}
		//data.goodShopDisputeRefundRate = fuwuObj.data.asSlrDsptRate30d.shopValue.replace('%','');;
	} else {
		var goodOrgPrice = null,
			goodComPrice = null;
		var orgPriceKey, comPriceKey, currGoodOrgPrice, currGoodComPrice;
		for(var key in jiageObj.defaultModel.itemPriceResultDO.priceInfo) {
			currGoodOrgPrice = parseFloat(jiageObj.defaultModel.itemPriceResultDO.priceInfo[key].price);
			if(!jiageObj.defaultModel.itemPriceResultDO.priceInfo[key].hasOwnProperty('promotionList')) {
				orgPriceKey = key;
				comPriceKey = key;
				continue;
			}
			currGoodComPrice = parseFloat(jiageObj.defaultModel.itemPriceResultDO.priceInfo[key].promotionList[0].price);
			if(goodOrgPrice === null && goodComPrice === null) {
				goodOrgPrice = currGoodOrgPrice;
				goodComPrice = currGoodComPrice;
				orgPriceKey = key;
				comPriceKey = key;
				continue;
			}
			if(currGoodOrgPrice < goodOrgPrice) {
				goodOrgPrice = currGoodOrgPrice;
				orgPriceKey = key;
			}
			if(currGoodComPrice < goodComPrice) {
				goodComPrice = currGoodComPrice
				comPriceKey = key;
			}
		}
		data.goodOrgPrice = jiageObj.defaultModel.itemPriceResultDO.priceInfo[orgPriceKey].price;
		data.goodComPrice = jiageObj.defaultModel.itemPriceResultDO.priceInfo[comPriceKey].hasOwnProperty('promotionList') ? jiageObj.defaultModel.itemPriceResultDO.priceInfo[comPriceKey].promotionList[0].price : data.goodOrgPrice;
		data.goodComPrice = parseFloat(goodComPrice) === 0 ? data.goodOrgPrice : data.goodComPrice;
		data.goodSalesVolume = jiageObj.defaultModel.sellCountDO.sellCount;
		if(jiageObj.defaultModel.deliveryDO.deliverySkuMap.default[0].hasOwnProperty('money')) {
			data.postFee = jiageObj.defaultModel.deliveryDO.deliverySkuMap.default[0].money === 0 ? 1 : 2;
		} else {
			data.postFee = jiageObj.defaultModel.deliveryDO.deliverySkuMap.default[0].postage.match(/: 0\.00/) === null ? 2 : 1;
		}
		//data.goodShopDisputeRefundRate = fuwuObj.data.asSlrDsptRate30d.shopValue.replace('%','');;

		data.descriptionMatchSocre = pinglunObj.dsr.gradeAvg;
	}
}

function urlHandle(url) {
	return 'https:' + url;
}

function priceHandle(price) {
	var temp;
	if(price.match('-') === null) {
		return price;
	} else {
		temp = price.split('-');
		return temp[0];
	}
}

function toObj(str) {
	var temp = str.trim();
	if(temp.charAt(0) === "{") {
		return JSON.parse(temp);
	}
	return JSON.parse(str.slice(str.indexOf('(') + 1, str.lastIndexOf(')')));
}