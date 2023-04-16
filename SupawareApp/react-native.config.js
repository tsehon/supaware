// This file is used to configure the react-native-vector-icons library
// This lets us avoid xcode auto-linking the library 
module.exports = {
    dependencies: {
        'react-native-vector-icons': {
            platforms: {
                ios: null,
            },
        },
    },
};