$(function(){
	//去多余字符次数
	var k=10;
	//加载延迟时间。
	//如果一进入就加载，页面的dom结构还没生成完，这样就加载不了采集按钮。所以需要延迟时间。
	//可以根据情况设置，单位为毫秒
	var time=500;
	
	//清除换行和空格
	function clear(str){
		//去换行符
		str=str.replace(/(\n)+|(\r\n)+/g,"");
		//去空格
		str=str.replace(/(^\s*)|(\s*$)/g,"");
		return(str);
	}
	//当前访问的url地址
	var myhref=window.location.href;
	//目标url地址
	var staobaocom="https://s.taobao.com/search";
	var kemanshitmallcom="https://kemanshi.tmall.com/search.htm";
	var darenindex="http://we.taobao.com/daren/index.htm";
	var darenhealthCenter="http://we.taobao.com/daren/healthCenter.htm";
	var darenfeedManager="http://we.taobao.com/daren/feedManager.htm";
	var accountModify="http://we.taobao.com/allspark/accountModify.htm";
	var item="https://item.taobao.com/item.htm";

	//通过比较url执行相应操作
	if(myhref.indexOf(staobaocom)>=0){
		//延迟调用函数
		setTimeout(function(){addbutton1();addbutton2();select1();select2();},time);

		function addbutton1(){
			//添加采集按钮
			//$("div.item").not("div.activity").find("img.J_ItemPic").parent().parent().prepend("<div class='btn btn-info btn-sm mydiv1'>采集</div>");
		}
		
		function addbutton2(){
			//添加采集按钮
			//$("a:contains('掌柜热卖')").parent().next().find("img").parent().parent().prepend("<div class='btn btn-info btn-sm mydiv2' style='padding-top:4px;'>采集</div>");

		}

		function select1(){
			//单击采集按钮时采集
			$("div.mydiv1").click(function(){
				var now=$(this).parent().parent().parent().parent();
				
				var ahref=$(now).find("a.pic-link").attr("data-nid");
				var imgsrc=$(now).find("img.J_ItemPic").attr("src");
				//数组存储
				var tag=new Array();
				$(now).find("span.text").each(function(i){
					tag[i]=$(this).html();
				});
				//组合数组为字符串
				var tags="\n";
				for(var i=0;i<tag.length;i++){
					tags=tags+i+":"+tag[i]+"\n";
				}

				var price=$(now).find("strong").html();
				var dealcnt=$(now).find("div.deal-cnt").html();
				var atlink=$(now).find("a.J_ClickStat:last").html();
				for(var i=0;i<k;i++){
					//去多余字符
					atlink=atlink.replace("<span class=\"baoyou-intitle icon-service-free\"></span>","");
					atlink=atlink.replace("<span class=\"H\">","");
					atlink=atlink.replace("</span>","");
				}
				atlink=clear(atlink);

				var ashopaddress=$(now).find("a.shopname").attr("href");

				var ashopname=$(now).find("a.shopname").children("span:last").html();
				var location=$(now).find("div.location").html();
				var shoprate=$("div.rank-box").find("span.rate").html();
				
				// var shopinfo=$("ul.scores").html();
				// if(shopinfo!=null){
				// 	for(var i=0;i<k;i++){
				// 		shopinfo=shopinfo.replace("<li class=\"score morethan\">","");
				// 		shopinfo=shopinfo.replace("<li class=\"score lessthan\">","");
				// 		shopinfo=shopinfo.replace("<li class=\"score equalthan\">","");
				// 		shopinfo=shopinfo.replace("<span class=\"text\">","");
				// 		shopinfo=shopinfo.replace("<span class=\"highlight\">","");
				// 		shopinfo=shopinfo.replace("<span class=\"percent\">","");
				// 		shopinfo=shopinfo.replace("</span>","");
				// 		shopinfo=shopinfo.replace("</li>","");
				// 	}
				// // shopinfo=clear(shopinfo);
				// }




				alert(
					"ahref:"+ahref+"\n"+
					"imgsrc:"+imgsrc+"\n"+
					"price:"+price+"\n"+
					"dealcnt:"+dealcnt+"\n"+
					"atlink:"+atlink+"\n"+
					"ashopaddress:"+ashopaddress+"\n"+
					"ashopname:"+ashopname+"\n"+
					"location:"+location+"\n"+
					"tags:"+tags+"\n"+
					"shoprate:"+shoprate+"\n"+
					""
					);

				var reportContent={
					ahref:ahref,
					imgsrc:imgsrc,
					price:price,
					dealcnt:dealcnt,
					atlink:atlink,
					ashopaddress:ashopaddress,
					ashopname:ashopname,
					location:location,
					tags:tags,
					shoprate:shoprate
				};
			// send(reportContent);
			
			return false;

		});
		}

		function select2(){
			//单击采集按钮时采集
			$("div.mydiv2").click(function(){
				var now=$(this).parent().parent();
				
				var ahref=$(now).find("a[class*='-imglink']").attr("href");
				var imgsrc=$(now).find("img:first").attr("src");
				var price=$(now).find("em:contains('¥')").parent("a").html();
				//去多余字符
				price=price.replace("<em>¥</em>","");
				var sell=$(now).find("em:eq(1)").html();
				var redtitle=$(now).find("div[class*='-redtitle']").html();

				var hover=new Array();
				$(now).find("span[class*='-property']").each(function(i){
					hover[i]=$(this).html();
				});

				var hovers="\n";
				for(var i=0;i<hover.length;i++){
					hovers=hovers+i+":"+hover[i]+"\n";
				}

				alert(
					"ahref:"+ahref+"\n"+
					"imgsrc:"+imgsrc+"\n"+
					"price:"+price+"\n"+
					"sell:"+sell+"\n"+
					"redtitle:"+redtitle+"\n"+
					"hovers:"+hovers+"\n"+
					""
					);
				var reportContent={
					ahref:ahref,
					imgsrc:imgsrc,
					price:price,
					sell:sell,
					redtitle:redtitle,
					hovers:hovers
				};
			// send(reportContent);

			return false;

		});
		}

	}

	if(myhref.indexOf(kemanshitmallcom)>=0){
		setTimeout(function(){addbutton1();select1();},time);
		function addbutton1(){
			//添加采集按钮
			//$("dl.item").children("dt").children("a").prepend("<div class='btn btn-info btn-sm mydiv1'>采集</div>");
		}
		function select1(){
			//单击采集按钮时采集
			$("div.mydiv1").click(function(){
				var now=$(this).parent().parent().parent();

				var ahref=$(now).find("a.J_TGoldData:first").attr("href");
				var imgsrc=$(now).find("img:first").attr("src");
				var itemName=$(now).find("a.item-name").html();
				itemName=clear(itemName);
				var price=$(now).find("span.c-price").html();
				price=clear(price);
				var saleNum=$(now).find("span.sale-num").html();
				var rates=$(now).find("span:contains('评价')").html();
				if(rates!=null) rates=rates.replace("评价: ","");

				alert(
					"ahref:"+ahref+"\n"+
					"imgsrc:"+imgsrc+"\n"+
					"itemName:"+itemName+"\n"+
					"price:"+price+"\n"+
					"saleNum:"+saleNum+"\n"+
					"rates:"+rates+"\n"+
					""
					);

				var reportContent={
					ahref:ahref,
					imgsrc:imgsrc,
					itemName:itemName,
					price:price,
					saleNum:saleNum,
					rates:rates
				};
			// send(reportContent);

			return false;
		});
		}

	}


	if(myhref.indexOf(accountModify)>=0){
		
		setTimeout(function(){select();},time);
		function select(){
			var tbhym=$("p:contains('淘宝会员名')").children("span").html();
			var zfbzh=$("p:contains('支付宝账号')").children("span").html();
			var zfbsm=$("p:contains('支付宝实名')").children("span").html();
			var lxrxm=$("span:contains('联系人姓名')").next("input").val();
			var lxrsj=$("span:contains('联系人手机')").next("input").val();
			var yxdz=$("span:contains('邮箱地址')").next("input").val();
			var zhmc=$("span:contains('账号名称')").next("input").val();
			var zhjj=$("span:contains('账号简介')").next("textarea").val();
			

			var reportContent={
				淘宝会员名:tbhym,
				支付宝账号:zfbzh,
				支付宝实名:zfbsm,
				联系人姓名:lxrxm,
				联系人手机:lxrsj,
				邮箱地址:yxdz,
				账号名称:zhmc,
				账号简介:zhjj
			};
			send("6",reportContent);


		}
	}

	if(myhref.indexOf(darenfeedManager)>=0){
		setTimeout(function(){select();},time);
		function select(){

			var page=0;
			$("ul.pagination").find("a").each(function(i){
				page=i+1;
			})
			var reportContent={
				页数:page
			};
			send("5",reportContent);
			

		}
	}

	if(myhref.indexOf(darenhealthCenter)>=0){
		setTimeout(function(){select();},time);
		function select(){
			var name=$("span.name").html();
			var fs=$("div:contains('粉丝')").children("span").html();
			var zzly=$("p:contains('专注领域')").next().html();
			zzly=zzly.replace("<div class=\"name no-match\">","");
			zzly=zzly.replace("<div class=\"tips-box\">",",");
			zzly=zzly.replace("<i></i>","");
			zzly=zzly.replace("<div>","");
			zzly=zzly.replace("</div></div>","");
			var cqdvrz=$("div.certification").children("a").html();

			var reportContent={
				名称:name,
				粉丝:fs,
				专注领域:zzly,
				申请大V认证:cqdvrz
			};
			send("4",reportContent);

		}
	}

	if(myhref.indexOf(darenindex)>=0){
		setTimeout(function(){select();},time);
		function select(){
			var xzuv=$("td:contains('小站uv')").children("span").html();
			var xzpv=$("td:contains('小站pv')").children("span").html();
			var xzfs=$("td:contains('新增粉丝')").children("span").html();
			var z=$("td:contains('赞')").children("span").html();
			var pl=$("td:contains('评论')").children("span").html();
			var fx=$("td:contains('分享')").children("span").html();
			var rchfn=$("td:contains('二次回访率')").children("span").html();
			var reportContent={
				小站uv:xzuv,
				小站pv:xzpv,
				新增粉丝:xzfs,
				赞:z,
				评论:pl,
				分享:fx,
				二次回访率:rchfn
			};
			send("3",reportContent);

		}
	}


	//上报达人管理
	function send(reportType,reportContent){
		//获取公共信息
		var darenName=$("span.name").html();
		var taoaoName=$("div.menu-hd").children("a").html();
		var darenId=$("script#tb-beacon-aplus").attr("exparams");
		darenId=darenId.substring(17,27);
		var darenUrl="http://uz.taobao.com/home/"+darenId+"/";
		
		if(reportType=="1"){
			darenId="";
			darenUrl="";
		}

		reportContent=JSON.stringify(reportContent);
		var data={
			reportType:reportType,
			darenName:darenName,
			darenId:darenId,
			darenUrl:darenUrl,
			taoaoName:taoaoName,
			wangwangName:"",
			reportContent:reportContent
		};
		data=JSON.stringify(data);


		var port = chrome.runtime.connect({name: 'ycs_script'});
		port.postMessage({action : "getUserStatus"});
		port.onMessage.addListener(function(msg) {
		    // console.log(msg);
		    if(msg.data==null){
		    	return("user is not login");
		    }

		    var key=msg.data.token;
			// testen(data,key);
			data=Encrypt(data,key);
			var url="http://123.57.213.217:8998/wb/user/getSystemConfigV1.do";
			var args={
				"userId":msg.data.userId,
				"userInfo":"",
				"versionCode":"1.0",
				"data":data
			};
			console.log(args);
			// console.log(key);
			var space=0;
			if(getNowT()!=getBeforeT()){
				$.post(url,args,function(data){
					console.log(data.success);
				});
			}else{
				var now=getNowM();
				if(now<getBeforeM())now=now+60;
				if(now-getBeforeM()>=space){
					$.post(url,args,function(data){
						console.log(data.success);
					});
				}
			}
			setNow();

		});

	}




	function setNow(){
		$.cookie("time",getTime(),{expires:7,path:'/'});
		$.cookie("minute",getMinute(),{expires:7,path:'/'});
	}
	function getBeforeT(){
		return(parseInt($.cookie("time")));
	}
	function getNowT(){
		return(parseInt(getTime()));
	}
	function getBeforeM(){
		return(parseInt($.cookie("minute")));
	}
	function getNowM(){
		return(parseInt(getMinute()));
	}
		//获得分钟
		function getMinute(){
			return(parseInt(new Date().getMinutes()));
		}
		//获得时间，不包括分钟
		function getTime(){
			var s="";
			d = new Date();
			s += d.getYear();
			s += (d.getMonth()+1);
			s += d.getDate();
			s += d.getHours();
			s=s.substring(1);
			return(parseInt(s));
		}

		/**
		 * 用于加密解密测试
		 * @param data [待加密的数据]
		 * @param key  [用于加密、解密的token]
		 */
		function testen(data,key){
			//对数据进行加密
			var e=Encrypt(data,key);
			//打印加密之后的数据
			console.log(e);
			//对加密之后的数据进行解密，使用相同的key
			var d=Decrypt(e,key);
			//打印解密后的数据
			console.log(d);
		}

		/**
		 * 用于AES加密
		 * @param data [待加密的数据]
		 * @param key  [用于加密的token]
		 * @return [返回加密之后的数据]
		 */
		function Encrypt(data,key){
			var data = CryptoJS.enc.Utf8.parse(data);  
			var key= CryptoJS.enc.Utf8.parse(key);
			var encrypted = CryptoJS.AES.encrypt(data, key, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});  
			return encrypted.toString();  
		}  
		/**
		 * 用于AES解密
		 * @param  data [待解密的数据]
		 * @param  key  [用于解密的token]
		 * @return  [返回解密之后的数据]
		 */
		function Decrypt(data,key){
			var key= CryptoJS.enc.Utf8.parse(key);
			var decrypt = CryptoJS.AES.decrypt(data, key, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});  
			return CryptoJS.enc.Utf8.stringify(decrypt).toString();  
		}





	});
