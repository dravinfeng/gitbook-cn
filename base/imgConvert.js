/**
* 图片存储前压缩处理
*/
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

let imgMap ={},list=[];
let convert = function(){
	let item;
	if(!list.length||list[0].state){
		return;
	}

	item= list[0];
	item.state = 1;
	imagemin([item.img],{
		destination: '../public/static/',
        plugins: [
            imageminJpegtran(),
            imageminPngquant({
                quality: [0.6, 0.8]
            })
        ]}).then(function(files){
        	console.log('compress success');
        	console.log(list.length)
        	list.shift();
		    delete imgMap[item.img];
		    if(list.length){
		    	convert();
		    }
        });

}

/**
* img : imgname,
* opts:{
	quality:75
}
**/
module.exports= function(img,opts){
	if(imgMap[img]){
		return;
	}else{
		imgMap[img]= {state:0};
		list.push({
			'img': img,
			'static':0,
			'opts':opts||{}
		});
		convert();
	}
}