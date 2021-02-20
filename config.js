module.exports = {
	name: 'arkdocs',
	port: '3002',
	outerHost: 'http://170.106.67.122:39297',
	maxOldSpace: 4096,
	// pm2 重启规则
	schedule:[
		// '01 30 00 * * *', //00点30分01
		'01 30 12 * * *' //12点30分01
	],
	thirdPath:'/ea/arkthird/',
	// thirdPath:'/arkthird/',
	firstPath:'/ea',
	// firstPath:'',
	siteHost: 'https://analysys.gitbook.io'  //ea
	// siteHost: 'https://arkdocs.analysys.cn' //ark
	
}