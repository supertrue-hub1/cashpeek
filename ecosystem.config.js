module.exports = {
  apps: [{
    name: 'newmfo',
    script: '.next/standalone/server.js',
    cwd: '/root/newmfo',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
