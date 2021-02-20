const cheerio = require('cheerio');
const conf = require('../config');
function Replace($){
	this.$=$;
	this.types = ['script','link','img'];
};
Replace.prototype= {
	newUrl:function(url){
		if(!url || url.indexOf('/smooth.js')!=-1 ||  new RegExp('^'+conf.thirdPath).test(url)){
			return false;
		};
		return [conf.thirdPath,url].join('');
	},
	replaceStyle:function(){
		
		let self = this,html;
		this.$('style').each(function(i,item){
			html = self.$(item).html();
			html=html.replace(/https:\/\//g, conf.thirdPath+'https://');
			self.$(item).html(html);
		});
	},
	replace:function(tagName){
		let temp;
		let key = tagName == 'link' ? 'href':'src';
		let self = this;
		this.$(tagName).each(function(i,item){
			temp = self.newUrl(self.$(item).attr(key));
			// console.log(temp);
			temp && self.$(item).attr(key,temp);
		});

	},
	replaceAll:function(){
		var list = this.types;
		for(var i=0; i <list.length; i++){
			this.replace(list[i]);
		}
		this.replaceStyle();

	}
};
let util = {
	replaceHtml:function(html){
		let $ = cheerio.load(html);
		let rep = new Replace($);
		rep.replaceAll();
		$('body').append('<script src="'+conf.firstPath+'/public/javascripts/smooth-min.js"></script>');
		html = $.html();
		rep = null;
		return html;
	}
}
module.exports = util;