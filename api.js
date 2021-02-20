let _app;
const conf = require('./config');
var DB = require('./db/dbRouter');
let util =require('./base/util');
const http = require('http');
const https = require('https');
const fs = require('fs');
const imgConvert = require('./base/imgConvert');
const md5 = require('md5');
const path = require('path');

/***
静态文件存取均会去掉参数后操作，但是存数据库的url是全部，包括参数和hash
数据库存储，如果是html则 url字段不包括参数和hash
*/

let register = function(app){
    _app = app;
    let publicPath='./public/static/';
    let htmlPath = './public/html/';
    let jsCssPath = './public/jscss/';
    let fileMatch =/image|font/;

    let loadingState={
      map:{},
      add:function(_id){
        let sta = !loadingState.map[_id];
        sta && (loadingState.map[_id] = 1);
        return sta;
      },
      remove:function(_id){
        delete loadingState.map[_id];
      }
    }; //url 抓取状态

     /**
     * 代理请求三方数据
     *
     * */
    let fetchData = function(options, callback, _id){

       let {url,headers} = options;
       let opt={
        // 'if-modified-since': 'Thu, 15 Oct 2020 02:45:16 GMT',
        // 'if-none-match': 'W/"baf58-dvi3itFxi6ZiyWkVmugOpLLGzeA"'
       }
       headers['if-none-match']&&(opt['if-none-match']=headers['if-none-match']);
       headers['if-modified-since']&&(opt['if-modified-since']=headers['if-modified-since']);
       
       // update时如果重复，则不处理
       if(_id && !loadingState.add(_id)){
          return;
       }

       http.get(conf.outerHost+'/_3thd/'+url,{
        headers:opt
       }, (res) => {
          //删除加载状态
          _id && loadingState.remove(_id);

          // console.log('状态码:', res.statusCode);
          // console.log('响应头:', res.headers);
          let contentType =res.headers['content-type'];
          let encoding='';

          if(res.statusCode != 200) {
            callback({'url':url,data:null, headers:res.headers, msg:"这块需要细化5xx 和4xx"}, res.statusCode);
            return;
          }

          if(fileMatch.test(contentType)){
            res.setEncoding('binary');
            encoding= 'binary';
          }else{
            encoding = 'utf-8';
          }
          

          let dt =[],temp='', size=0;
          let imgBuffer;
          res.on('data', (chunk) => {
            dt.push(Buffer.from(chunk,encoding));
          });
          res.on('end', () => {
            imgBuffer = Buffer.concat(dt);
            dt = imgBuffer.toString(encoding);
            let contentIsOk = true;
            let urlKey = url;
            let tempUrl = '';
            urlKey = urlKey.split('#')[0];
            urlKey= urlKey.split('?')[0];
             
            if(res.headers['content-length'] && res.headers['content-length'] <= Buffer.byteLength(dt,encoding)){
              contentIsOk = true;
            }else if(!res.headers['content-length']){
              contentIsOk = true;
            }else{
              contentIsOk = false;
            }

            if(/text\/htm/.test(contentType)){
              tempUrl = htmlPath+md5(urlKey)+'.html';
              dt = util.replaceHtml(dt);
            }else if(fileMatch.test(contentType)){
              tempUrl = publicPath+md5(urlKey)+path.extname(urlKey);
              
              if(contentIsOk){
                fs.writeFile(tempUrl, dt, 'binary',function(err){
                    try{
                      if(err){
                        console.log('保存出错');
                      }else{
                        console.log('file save success');
                        if(/image/.test(contentType) && !/image\/gif/.test(contentType)){
                          imgConvert(tempUrl);
                        }
                      }
                    }catch(e){}
                  });
              }
            }else{
              tempUrl = jsCssPath+md5(urlKey)+path.extname(urlKey);
            }

            if(!fileMatch.test(contentType) && contentIsOk){
              fs.writeFile(tempUrl, dt, '',function(err){
                try{
                  if(err){
                    console.log('保存出错:',err);
                  }else{
                    console.log('html js css file save success');
                  }
                }catch(e){}
              });
            }
            
            temp = {'url': /text\/htm/.test(contentType) ? urlKey: url, filePath:tempUrl, headers:res.headers, 'data': dt};

            callback(temp, res.statusCode);
            temp.data="";

            if(contentIsOk){ //如果内容不全 则不存库
              if(_id){
                DB.dataDb.update({'_id':_id},{$set:temp},function (err,docs) {
                    //TODO 未来扩充到 错误日志
                    console.log('更新数据库error：', err)
                });
              }else{
                DB.dataDb.insert(temp);
              }
            }
            
          })

        }).on('error', (e) => {
          //删除加载状态
          _id && loadingState.remove(_id);
          console.error(e);
          callback({code:1,data:e,msg:"请求出错，请重试"},500);
        });
    };

    //断掉真正的.lp请求
    app.get('/.lp', function (req, res) {
      res.send('console.log("ok")');
    });

    //做代理请求，以及资源存储
    app.get('/*', function (req, res1) {
        // console.log(req.headers);
        // console.log('状态码:', res1.statusCode);
        let url = req.url;
        if(url.indexOf('smooth.js')!=-1){
          next();
          return;
        }

        let exp = new RegExp('^'+conf.thirdPath)
        let flag = exp.exec(url);
        if(flag){
          url = url.replace(exp,'');
          if(/^\/\//.test(url)){
            url='https:'+url;
          }else if(/^\//.test(url)){
            url=conf.siteHost+url;
          }
        }else{
          url = conf.siteHost + url;
        }
        let callback = function(val , status){
          
          if(val && val.code ==1){
            res1.status(status).end();
            return;
          }
          let contentType = val.headers['content-type'];
          if(status && status != 200){
            
            if(status == 302){
              //特殊处理302 去掉多余header
              res1.header({location:val.headers['location']}).status(status).end();
            }else{
              res1.status(status).end();
            }
            return;
          }else if(fileMatch.test(contentType)){
            res1.header('Content-Type',contentType).write(val.data,'binary');
            res1.end();
          }else{
             res1.header('Content-Type',contentType).send(val.data);
          }
        }
        new Promise((resolve, reject) => {
          let urlKey = url;
          if(!flag){
            // html 忽略参数部分
            urlKey = urlKey.split('#')[0];
            urlKey= urlKey.split('?')[0];
          }
          DB.dataDb.find({'url':urlKey},function (err,docs) {
            if(docs.length){
              docs = docs[0];
              docs.status=1;
              resolve(docs);
            }else{
                resolve({status:0,data:null});
            }
          });
        }).then((val) => {
          if(!val.status) {
            fetchData({url,'headers':req.headers},callback, null);
          }else {
            //html请求会异步发起一次内容获取
            let _headers={};
            val.headers['etag']&&(_headers['if-none-match']=val.headers['etag']);
            val.headers['last-modified']&&(_headers['if-modified-since']=val.headers['last-modified']);
       
            if(/text\/htm/.test(val.headers['content-type'])){
              fetchData({url,'headers':_headers},function(_val, status){
                //Do nothing
                // console.log('update文档回调header：', _val.headers);
              }, val._id);
            };

            if(fileMatch.test(val.headers['content-type'])){
              val.data=fs.readFileSync(val.filePath,'binary');
            }else{
              val.data=fs.readFileSync(val.filePath); 
            }
            callback(val, 200);
          }
        });
    });
}

module.exports = register;