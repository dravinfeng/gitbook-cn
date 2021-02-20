#!/bin/bash
name=""
if [ $2 = "eadocs" ];then
	name="eadocs"
else
	name="arkdocs"
fi

if [ $1 = "stop" ] || [ $1 = "restart" ];then
	pm2 $1 $name
	echo "$1 success"
elif [ $1 = "start" ];then
	pm2 start ecosystem.config.js
	echo "$1 success"
elif [ $1 = "delete" ];then
	pm2 $1 $name
	echo "$1 $name success"
else
	echo "input score is wrong, only for: start, restart, stop, delete"
fi