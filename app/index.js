import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, StatusBar, ScrollView, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import NetworkPopup from './components/NetworkPopup';
import AppNav from './config/AppNav';
import lang from './lang';

console.disableYellowBox = true;

class App extends Component {
    constructor(props) {
        super(props)
    }
    componentDidMount() {
        lang.init();
    }
    
    render() {
        return (
            <View style={{flex: 1}}>
                
                <StatusBar barStyle="dark-content" />
                
                <SafeAreaView style={{flex: 1, position: 'relative'}}>
                    <KeyboardAvoidingView
                        style={{flex: 1, position: 'relative'}}
                        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
                    >
                        <ScrollView
                            contentInsetAdjustmentBehavior="automatic"
                            style={{flex: 1}}
                            contentContainerStyle={{flex: 1}}
                        >
                            <AppNav />
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
                
                <NetworkPopup />
                <FlashMessage position="top" duration={3000} />
                
            </View>
        )
    }
}

export default App;
