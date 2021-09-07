
import React, { Component } from 'react';
import { StyleSheet, Text, Image, View, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import * as AppNav from '../config/AppNav';
import NetInfo from "@react-native-community/netinfo";
import emitter from 'tiny-emitter/instance';
import lang from '../lang';

var isOnlineStatus = true;
export function isOnline() {
    return isOnlineStatus;
}

class NetworkPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            online: true,
            disabled: false,
        }
        this.popupOpacity = new Animated.Value(0);
        this.netStateChange = this.netStateChange.bind(this);
    }
    
    componentDidMount() {
        NetInfo.fetch().then(this.netStateChange);
        NetInfo.addEventListener(this.netStateChange);
        
        emitter.on('route-changed', routeName => {
            let allowedRoutes = ['MyCards', 'ViewCard'];
            this.state.disabled = allowedRoutes.indexOf(routeName) != -1;
            this.forceUpdate();
            this.updatePopup();
        });
    }
    
    componentWillUnmount() {
        emitter.off('route-changed');
    }
    
    netStateChange(state) {
        if (state.isConnected && state.isInternetReachable) {
            isOnlineStatus = true;
            this.state.online = true;
        } else {
            isOnlineStatus = false;
            this.state.online = false;
        }
        this.forceUpdate();
        this.updatePopup();
    }
    
    updatePopup() {
        if (!this.state.online && !this.state.disabled) {
            this.show();
        } else {
            this.hide();
        }
    }
    
    show() {
        this.setState({show: true});
        Animated.timing(this.popupOpacity, {
            toValue: 1,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
        }).start();
    }
    
    hide() {
        Animated.timing(this.popupOpacity, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            this.setState({show: false});
        });
    }
    
    render() {
        if (!this.state.show) return null;
        return (
            <Animated.View style={[styles.container, {opacity: this.popupOpacity}]}>
                
                <Image style={styles.image} source={require('../images/no-internet-connection.png')}  resizeMode='contain' />
                
                <Text style={styles.title}>{lang.get('offline-title', 'Wake up your connection')}</Text>
                <Text style={styles.description}>{lang.get('offline-info1', 'You don\'t seem to have an active internet connection')}</Text>
                <Text style={styles.description}>{lang.get('offline-info2', 'Connect to wifi or enable mobile data to access the Guido Guide App vouchers')}</Text>
                
                <View style={{marginBottom: 80}}></View>
                
                <TouchableOpacity onPress={() => AppNav.navigate('MyCards')} style={styles.isicButton}>
                    <Text style={styles.isicButtonText}>{lang.get('offline-view-isic-cards', 'View ISIC Cards')}</Text>
                </TouchableOpacity>
                
            </Animated.View>
        );
    }
}

export default NetworkPopup;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 100,
        backgroundColor: '#EFEFEF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '50%',
        opacity: 0.8,
    },
    title: {
        fontFamily: 'NunitoSans-Bold',
        fontWeight: 'bold',
        fontSize: 22,
        color: '#005D6B',
        marginBottom: 40,
        width: '90%',
        textAlign: 'center',
    },
    description: {
        fontFamily: 'NunitoSans-Light',
        fontSize: 16,
        color: '#535252',
        marginBottom: 10,
        width: '90%',
        textAlign: 'center',
    },
    button: {
        marginTop: 40,
        paddingVertical: 24,
        paddingHorizontal: 44,
        fontFamily: 'NunitoSans-Bold',
        fontWeight: 'bold',
        fontSize: 22,
        color: '#005D6B',
    },
    isicButton: {
        backgroundColor: '#005D6B',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginTop: 20,
        marginBottom: 40,
        paddingHorizontal: 40,
    },
    isicButtonText: {
        fontFamily: 'NunitoSans-Bold',
        fontWeight: 'bold',
        fontSize: 16,
        color: 'white',
    },
});
