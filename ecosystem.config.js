// PM2 Configuration for production deployment
module.exports = {
    apps: [{
        name: 'magister-portal',
        script: './server.js',
        instances: 1, // Use 'max' for cluster mode
        exec_mode: 'fork',
        env: {
            NODE_ENV: 'development',
            PORT: 3000
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: process.env.PORT || 3000
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        autorestart: true,
        max_memory_restart: '1G',
        watch: false, // Set to true for development
        ignore_watch: ['node_modules', 'logs', 'uploads'],
        max_restarts: 10,
        min_uptime: '10s'
    }]
};

