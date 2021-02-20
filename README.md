## gitbook 文档国内代理服务

技术栈：express + nodejs + neBD + pm2

## Setup 前置操作

安装node > 12 的LTS版本，https://nodejs.org/en/

## 基本流程说明
1、克隆代码到开发者本机可以进行调试
2、首先全局安装nodejs 和pm2 具体参照下面教程
3、重点关注config.js 里面是具体的配置说明demo
```sh
module.exports = {
	name: 'arkdocs', //项目名，与每次项目启动的关键词保持一致 如 sh ./do.sh start arkdocs
	port: '3002', //服务的端口号，如不指定则默认3001
	outerHost: 'http://xxx', //真正提供服务的地址，可以是gitbook海外服务，或者是proxy机器
	maxOldSpace: 2048, //配置服务需要的内存(kb单位，建议2GB以上)
	// pm2 重启规则
	schedule:[
		// '01 30 00 * * *', //00点30分01 
		'01 30 12 * * *' // 每日12点30分01 重启一次 
	],
	firstPath:'',
	//firstPath:'/ea',
	thirdPath:'/arkthird/', //如果只有一个服务默认即可
	//thirdPath:'/ea/arkthird/', 比如这个公司多服务场景下，可以指定自己的一级目录 arkthird关键字不需要变更
	 
	siteHost: 'https://arkdocs.analysys.cn' //原有的服务地址 举例 arkdocs.analysys.cn为 方舟文档的访问地址
	//siteHost: 'https://analysys.gitbook.io'  //ea
	
}
```

```sh
# clone project to your service space
git clone git@github.com:dravinfeng/gitbook-cn.git

# install pm2
npm install  pm2 -g

# install dependencies
npm install

# startup development server (defaults to 3001)
# -> http://localhost:3001 
# test
npm run dev

# pm2用法


# 服务端启动

# 先修改config.js 
# name:'productname',
# port: '3000'

sh ./do.sh start arkdocs
# 服务端重启
sh ./do.sh restart arkdocs
# 服务端关闭服务
sh ./do.sh stop arkdocs
sh ./do.sh delete arkdocs

```
