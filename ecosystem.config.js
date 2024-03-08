module.exports = {
  apps : [{
    name   : "chainge_activity_node",
    script : "./app.js",
    instances: 2,
    watch: true,
    watch_delay: 8000,
    max_memory_restart: '150M',
    env_production: {
      NODE_ENV: "production",
      PORT: 3020,
    },
    log_date_format: "YYYY-MM-DD HH:mm Z"
  }]
}
