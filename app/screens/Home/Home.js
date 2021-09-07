import React, { Component } from 'react';
import { View, Image, Text, ImageBackground, ActivityIndicator, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-community/async-storage';
import { showMessage } from 'react-native-flash-message';
import Header from '../../components/Header/Header.js';
import Close from '../../images/close.svg';
import Account from '../../images/account.svg';
import styles from '../../css/commons';
import api from '../../api';
import config from '../../config';
import lang from '../../lang';
import settings from '../../app-settings';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            vouchers: [],
            categories: [],
        }
    }
    
    isMountedComponent = false
    isFocused = false
    focusListener = null
    blurListener = null
    componentDidMount() {
        this.isMountedComponent = true;
        this.init();
        this.focusListener = this.props.navigation.addListener('focus', () => this.init())
        this.blurListener = this.props.navigation.addListener('blur', () => { this.isFocused = false; })
        
        api.get('/categories').then(response => {
            if (!this.isMountedComponent) return;
            if (response.data.success) {
                this.setState({categories: response.data.categories});
            }
        })
    }
    componentWillUnmount() {
        this.isMountedComponent = false;
        if (this.focusListener) this.focusListener();
        if (this.blurListener) this.blurListener();
    }
    
    init() {
        this.isFocused = true;
        if (!this.isMountedComponent) return;
        this.forceUpdate();
        AsyncStorage.getItem('activation_code').then(activationCode => {
            this.getCity(activationCode);
        }).catch(e => {
            this.getCity(null);
        });
        settings.fetch().then(allSettings => {
            this.forceUpdate();
        });
    }
    
    // currentCityId = null
    getCity(activationCode) {
        AsyncStorage.getItem('city')
        .then(city => {
            if (!city) return this.noCity();
            city = JSON.parse(city);
            if (!city) return this.noCity();
            this.getVouchers(city.city_id, activationCode);
            this.setState({loading: true});
            // if (this.currentCityId != city.city_id) {
            //     this.setState({loading: true});
            //     this.currentCityId = city.city_id;
            //     this.getVouchers(city.city_id, activationCode);
            // }
        })
        .catch(e => {
            this.noCity();
        });
    }
    noCity() {
        setTimeout(() => {
            if (!this.isFocused) return;
            showMessage({type:'info', message: lang.get('error-select-city', 'Select a city first!')});
            this.props.navigation.navigate('ChangeCity');
        }, 300);
    }
    
    getVouchers(city_id, activation_code) {
        api.post('/recommended-vouchers', {
            city_id: city_id,
            activation_code: activation_code,
        }).then(response => {
            if (!this.isMountedComponent) return;
            if (response.data.success) {
                this.setState({
                    loading: false,
                    vouchers: response.data.vouchers,
                });
            } else {
                this.setState({loading: false});
            }
        }).catch(response => {
            if (!this.isMountedComponent) return;
            this.setState({loading: false});
        });
    }

    getBannerUrl() {
        return settings.get('banner_url')+'?lang='+lang.activeLang;
    }
    
    bannerWebviewWrapperRef = null;
    bannerWebviewRef = null;
    render() {
        const { vouchers } = this.state;
        vouchers.forEach(voucher => {
            lang.translateModel(voucher, ['title', 'advantage', 'description']);
        })
        return (
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Header parentProps={this.props} />
                </View>
                
                <ScrollView style={styles.homeScrollView}>
                    
                    {settings.get('show_banner', false) && settings.get('banner_url') ? (
                        <View style={{flex: 1, marginBottom: 20}} ref={ref => this.bannerWebviewWrapperRef = ref}>
                            <WebView
                                ref={ref => this.bannerWebviewRef = ref}
                                originWhitelist={['*']}
                                source={{
                                    uri: this.getBannerUrl(),
                                    headers: {
                                        'APP-Version':  config.app.version,
                                        'APP-Language': lang.activeLang,
                                    },
                                }}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                onMessage={event => {
                                    if (!this.bannerWebviewWrapperRef) return;
                                    let newStyle = {flex: 1, height: 0, marginBottom: 0};
                                    let newHeight = parseInt(event.nativeEvent.data);
                                    if (newHeight > 0) newStyle = {flex: 1, height: newHeight, marginBottom: 20};
                                    this.bannerWebviewWrapperRef.setNativeProps({style: newStyle});
                                }}
                                onShouldStartLoadWithRequest={request => {
                                    let isExternalLink = Platform.OS === 'ios' ? request.navigationType === 'click' : true;
                                    if (!isExternalLink) return true;
                                    if (request.url == this.getBannerUrl()) return true;
                                    Linking.canOpenURL(request.url).then(supported => {
                                        if (supported) Linking.openURL(request.url);
                                    });
                                    return false;
                                }}
                            />
                        </View>
                    ) :null}
                    
                    {/* card voucher */}
                    {/* <TouchableOpacity style={styles.card}>
                        <ImageBackground style={styles.cardBackground} source={require('../../images/oferta.png')} resizeMode='cover'>
                        </ImageBackground>
                    </TouchableOpacity> */}
                    
                    {this.state.loading ? (
                        <View style={{justifyContent: 'center'}}>
                            <View style={[styles.card, {justifyContent: 'center', backgroundColor: '#ececec'}]}>
                                <ActivityIndicator size="large" color="#2E67B2" style={{transform: [{ scale: 2 }]}} />
                            </View>
                            <View style={styles.cardContainer}>
                                <View style={[styles.smallCard, {backgroundColor: '#ececec'}]}></View>
                                <View style={[styles.smallCard, {backgroundColor: '#ececec'}]}></View>
                            </View>
                        </View>
                    ) : vouchers.length > 0 ? (
                        <>
                            {vouchers[0] ? (
                            <TouchableOpacity onPress={()=>this.props.navigation.navigate('VoucherDetail', {voucher: vouchers[0]})} style={styles.card}>
                                <ImageBackground style={styles.cardBackgroundBottom} source={{uri: api.img('width:600;height:300', vouchers[0].image)}} resizeMode='cover'>
                                    <View style={styles.overlay}></View>
                                    {vouchers[0].company ?
                                        <Text style={styles.companyName}>{vouchers[0].company.company_name}</Text>
                                    :null}
                                    <View style={styles.voucherContainer}>
                                        <Text style={styles.voucherTextCardBig}>{vouchers[0].title}</Text>
                                        <Text style={styles.voucherTextCardSmall}>{vouchers[0].advantage}</Text>
                                    </View>
                                </ImageBackground>
                            </TouchableOpacity>
                            ) :null}
                            <View style={styles.cardContainer}>
                                {vouchers[1] ? (
                                <TouchableOpacity onPress={()=>this.props.navigation.navigate('VoucherDetail', {voucher: vouchers[1]})} style={styles.smallCard}>
                                    <ImageBackground style={styles.cardBackgroundBottom} source={{uri: api.img('width:600;height:300', vouchers[1].image)}} resizeMode='cover'>
                                        <View style={styles.overlay}></View>
                                        {vouchers[1].company ?
                                            <Text style={[styles.companyName, {fontSize:12}]}>{vouchers[1].company.company_name}</Text>
                                        :null}
                                        <View style={styles.voucherContainer}>
                                            <Text style={styles.smallCardText}>{vouchers[1].title}</Text>
                                        </View>
                                    </ImageBackground>
                                </TouchableOpacity>
                                ) :null}
                                {vouchers[2] ? (
                                <TouchableOpacity onPress={()=>this.props.navigation.navigate('VoucherDetail', {voucher: vouchers[2]})} style={styles.smallCard}>
                                    <ImageBackground style={styles.cardBackgroundBottom} source={{uri: api.img('width:600;height:300', vouchers[2].image)}} resizeMode='cover'>
                                        <View style={styles.overlay}></View>
                                        {vouchers[2].company ?
                                            <Text style={[styles.companyName, {fontSize:14}]}>{vouchers[2].company.company_name}</Text>
                                        :null}
                                        <View style={styles.voucherContainer}>
                                            <Text style={styles.smallCardText}>{vouchers[2].title}</Text>
                                        </View>
                                    </ImageBackground>
                                </TouchableOpacity>
                                ) :null}
                            </View>
                        </>
                    ) : null}
                    
                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('VoucherList')} style={styles.seeVouchersButton}>
                        <Text style={styles.seeVouchersText}>{lang.get('see-all-vouchers', 'See all vouchers')}</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.navigateCity}>
                        <Text style={[styles.pageTitleText,{color:"black"}]}>
                            {lang.get('navigate-the-city', 'Navigate the city')}
                        </Text>
                        <View style={[styles.cityTags,{marginTop:20}]}>
                            {this.state.categories.map((item, index) => {
                                lang.translateModel(item, ['name']);
                                return (
                                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('LocationList', {category: item})} style={styles.tag} key={index}>
                                        <Text style={styles.tagText}>{item.name}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                    
                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('Profile')} style={styles.myAccount}>
                        <Account width={23} height={23} />
                        <Text style={styles.myAccountText}>{lang.get('my-account-button', 'My account')}</Text>
                    </TouchableOpacity>
                    
                </ScrollView>
            </View>
        )
    }
}

export default Home;
