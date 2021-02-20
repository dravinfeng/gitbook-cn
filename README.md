## 方舟文档代理服务

A multiple entries project. (express + nodejs)

## Setup
安装node > 12 的LTS版本，https://nodejs.org/en/


```sh
# install dependencies
npm install

# startup development server (defaults to 3001)
# -> http://localhost:3001
npm run dev

# pm2用法

# install
npm install  pm2 -g
npm install uglify-js -g
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
