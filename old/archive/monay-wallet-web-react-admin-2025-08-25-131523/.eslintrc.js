// module.exports = {
//   env: {
//     browser: true,
//     es2021: true
//   },
//   extends: [
//     'plugin:react/recommended',
//     'standard'
//   ],
//   parserOptions: {
//     ecmaFeatures: {
//       jsx: true
//     },
//     ecmaVersion: 12,
//     sourceType: 'module'
//   },
//   plugins: [
//     'react',    	
//     'react-hooks'
//   ],
//   rules: {
//   }
// }

module.exports = {
  "extends": ["react-app"],
  "rules": {
  },
  "overrides": [
    {
      "files": ["**/*.js?(x)"],
      "rules": {
        // ******** add ignore rules here *********
        "react/no-unescaped-entities": "off",
        "react/display-name": "off",
        "react/prop-types": "off",
      }
    }
  ]
}