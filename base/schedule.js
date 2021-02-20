let schedule = require('node-schedule');
let config = require('../config');
let exec = require('child_process').exec;
let cmd ='sh do.sh restart '+config.name;
let time = '01 00 01 * * *'; //1点00分01秒
let parseTime = function(date){
	let dt = [date.getFullYear(),date.getMonth()+1,date.getDate()];
	dt[1]<10 && (dt[1]='0'+dt[1]);
	dt[2]<10 && (dt[2]='0'+dt[2]);
	return dt.join('');
}
module.exports = function(){
	// restart
	config.schedule&& config.schedule.forEach(function(d,i){
		schedule.scheduleJob(d, function(){
			exec(cmd, function(err,stdout,stderr){
				console.log(arguments)
			})
			console.log('scheduleTime:',new Date());
		});
	});

	// database backup
	schedule.scheduleJob(time, function(){
		let date = new Date();
		exec('cp -f ./db/data.db ./db/data.db-'+parseTime(date), function(err,stdout,stderr){
			console.log(arguments)
		});
		exec('tar -zcvf public/html-'+parseTime(date)+'.tar.gz ./public/html', function(err,stdout,stderr){
			console.log(arguments)
		})
		console.log('database and html backup:',new Date());
	});

	// // logs backup
	// schedule.scheduleJob('01 46 14 * * *', function(){
	// 	let date = new Date();
	// 	let cmd =[
	// 		'cp -f ./log/err.log ./log/err.log-'+parseTime(date),
	// 		'echo "" > ./log/err.log',
	// 		'cp -f ./log/out.log ./log/out.log-'+parseTime(date),
	// 		'echo "" > ./log/out.log',

	// 	];
	// 	cmd.forEach(function(d,i){
	// 		exec(d, function(err,stdout,stderr){
	// 			console.log(arguments)
	// 		})	
	// 	})
	// 	console.log('logs backup:',date);
	// });
}