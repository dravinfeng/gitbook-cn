/**
* 每次启动服务时会自动build一份smooth-min.js 并且根据conf配置做资源地址配置
*/
let uglify = require('uglify-js');
let fs = require('fs');
const Path = require('path');
let inSource = Path.resolve('./public/javascripts/smooth.js');
let outSource = Path.resolve('./public/javascripts/smooth-min.js');
let conf = require('../config');

let js = fs.readFileSync(inSource);

let exp = new RegExp("return '/arkthird/'");
js = js.toString().replace(exp,"return '"+conf.thirdPath+"'");
fs.writeFile(outSource,uglify.minify(js).code,function(err){
	if(err){
		console.log('build err:', err);
	}
});