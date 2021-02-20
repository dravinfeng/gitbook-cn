var config = require('./config');
module.exports = {
  apps : [{
    name: config.name,
    script: './bin/www',
    cwd: './',
    error_file: './log/err.log',
    out_file: './log/access.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    node_args: '--max-old-space-size='+config.maxOldSpace
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
