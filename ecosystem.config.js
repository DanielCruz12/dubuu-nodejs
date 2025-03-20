module.exports = {
    apps: [
      {
        name: "dantours",
        script: "npm",
        args: "run start",
        env: {
          NODE_ENV: "development",
        },
      },
    ],
  };