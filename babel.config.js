module.exports = {
  presets: [
    [
      "@babel/env",
      {
        targets: {
          browsers: [
            /* 
              FIXME: on commonjs build
              `Could not find module in path: 'core-js/modules/es7.symbol.async-iterator' relative to '/node_modules/pathon/lib/pathon.js'`
            */
            process.env.BABEL_ENV === "commonjs" && false
              ? "ie 11"
              : "last 2 Chrome versions"
          ]
        },
        useBuiltIns: "usage"
      }
    ]
  ],
  plugins: [
    "@babel/plugin-proposal-object-rest-spread"
  ]
};