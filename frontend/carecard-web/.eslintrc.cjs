/** ESLint root config – unngår dobbel lasting av react-plugin på Windows (mappe-casing). */
module.exports = {
  root: true,
  extends: [
    require.resolve('eslint-config-react-app'),
    require.resolve('eslint-config-react-app/jest'),
  ],
};
