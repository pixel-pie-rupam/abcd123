module.exports = {
  apps: [{
    name: 'pragni-backend',
    script: './backend/src/server.js',
    cwd: '/var/www/pragni',
    instances: 'max',         // cluster mode — use all CPU cores
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '400M',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
    },
    error_file: '/var/log/pm2/pragni-error.log',
    out_file: '/var/log/pm2/pragni-out.log',
    log_file: '/var/log/pm2/pragni-combined.log',
    time: true,
    // Auto-restart on crashes
    autorestart: true,
    max_restarts: 10,
    restart_delay: 4000,
  }]
};
