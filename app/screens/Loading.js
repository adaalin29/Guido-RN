import React, { Component } from 'react';
import { View, Button, ActivityIndicator } from 'react-native';

// Imagini
import Logo from '../images/logo.svg';

class Loading extends Component {
    render() {
        return (
            <View style={{width:'100%', height:'100%', justifyContent:'center', alignItems:'center'}}>
                <Logo width={200} height={73} />
                <ActivityIndicator size="large" color="#2E67B2" style={{marginTop:80, transform: [{ scale: 2 }]}} />
            </View>
        )
    }
}

export default Loading;
