module.exports = {
  root: true,
  extends: '@react-native-community',
  "eslint.workingDirectories": [
    { directory: "./client/", changeProcessCWD: true },
    { directory: "./server/", changeProcessCWD: true },
  ],
};
