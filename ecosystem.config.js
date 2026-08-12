module.exports = {
  apps: [
    {
      name: "ecommerce-backend",
      script: "server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "customdev",
      },
    },
  ],
};