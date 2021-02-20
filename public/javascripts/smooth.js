(function(window){
	var utils= {
		types:['script', 'link', 'img'],
		hostReg:new RegExp('^'+location.origin),
		getHost:function(){
			return location.origin;
		},
		getAheadPath : function(){
			return '/arkthird/';
		},
		newUrl:function(url){
			if(!url || url.indexOf('/smooth.js')!=-1 || new RegExp('^'+utils.getAheadPath()).test(url) || utils.hostReg.test(url)){
				return false;
			};
			return [utils.getAheadPath(),url].join('');
		},
		replace:function(tagName, nodeList){
			var key,ls,temp;
			if(!nodeList){
				ls = utils.$(tagName);
				// console.log(ls)
			}else{
				ls = nodeList;
			}
			for(var i=0;i<ls.length;i++){
				tagName = ls[i].tagName.toLowerCase();
				key = tagName == 'link' ? 'href':'src';
				temp = utils.newUrl(ls[i][key]);
				console.log(temp);
				temp && ls[i].setAttribute(key,temp);
			}
		},
		filter:function(list){
			var temp;
			var nodeList = Array.prototype.filter.call(list,function(d){

				// 搜索时 直接刷页

				if(d.tagName && d.tagName.toLowerCase() =='div' && /loadingSpinnerPanel/i.test(d.className)){
					console.log('search quick jump', location.href)
					setTimeout(function(){
						window.location.reload();
					},10);
				}

				return !d.tagName ? false : utils.types.indexOf(d.tagName.toLowerCase())!=-1;
			});
			utils.replace('',nodeList);
		},
		replaceAll:function(){
			var list = utils.types;
			for(var i=0; i <list.length; i++){
				utils.replace(list[i]);
			}
		}
	}
	var addEvent = function(el, type, oFunc,sta) {
        if (el.attachEvent) {
            el.attachEvent('on' + type, oFunc);
        }
        else if (el.addEventListener) {
            el.addEventListener(type, oFunc,sta || false);
        }
        else {
            el['on' + type] = oFunc;
        }
    }
	var bindEvent=function(){
		var observe=new MutationObserver(function (mutations,observe){
		    var temp;
		    aa= mutations;
		    for(var i =0;i<mutations.length;i++){
		    	temp = mutations[i];
		    	temp.type=='childList' && (utils.filter(temp.addedNodes));
		    }
		    console.log(mutations);
		    //observe.discount();     
		});
		observe.observe(document.documentElement,{ childList: true,subtree: true});

		addEvent(document.body,'click',function(evt){
			if (!evt.target) {
				evt.target = evt.srcElement;
				evt.pageX = evt.x;
				evt.pageY = evt.y;
			}
			var node = evt.target;
			while(node && node.tagName && node.tagName.toLowerCase()!="a" && !node.getAttribute('role')){
				node=node.parentNode;
			}
			if(node && node.tagName &&  node.tagName.toLowerCase()=='a' && !/javascript/.test(node.href)){
				evt.cancelBubble =true;
				evt.returnValue = false;
				window.location.href = node.href;
			}
		})
	}
	var init =function(){
		bindEvent();
		// utils.replaceAll();
		try{
			window.GITBOOK_STATE.config.cdn.blobsurl = utils.getAheadPath()+ window.GITBOOK_STATE.config.cdn.blobsurl;
			window.GITBOOK_STATE.config.firebase.databaseURL = utils.getHost();
		}catch(e){
			console.log(e);
		}
	}
	init();
	// document.addEventListener("DOMContentLoaded", init(), false);
})(window);