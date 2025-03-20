module.exports = {
    apps: [
      {
        name: "dantours",
        script: "npm",
        args: "run dev",
        env: {
          NODE_ENV: "development",
        },
      },
    ],
  };