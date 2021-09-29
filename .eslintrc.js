module.exports = {
  //   parser: "babel-eslint",
  //   extends: "airbnb",
  //   rules: {
  //     semi: "error",
  //     quotes: "off",
  //   },
  //   env: {
  //     browser: true,
  //     node: true,
  //   },
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
  },
};
