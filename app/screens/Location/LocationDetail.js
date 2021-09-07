import React, { Component } from 'react';
import { Platform, View, Image, Text, ImageBackground, TouchableOpacity, ScrollView, Animated, Linking, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import MapView, { Marker }  from 'react-native-maps';
import { showMessage } from 'react-native-flash-message';
import HeaderWhite from '../../components/Header/HeaderWhite.js';
import Clock from '../../images/clock.svg';
import PhoneIcon from '../../images/phoneIcon.svg';
import Facebook from '../../images/facebook.svg';
import GlobeIcon from '../../images/globeIcon.svg';
import Location from '../../images/location.svg';
import Discount from '../../images/discount.svg';
import MarkerIcon from '../../images/marker.svg';
import Account from '../../images/account.svg';
import styles from '../../css/commons';
import api from '../../api';
import lang from '../../lang';

class LocationDetail extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            title: '',
            location: {},
            vouchers: [],
            hasActivationCode: null,
        }
        if (props.route.params && props.route.params.location) {
            this.state.location = props.route.params.location;
        }
        if (props.route.params && props.route.params.title) {
            this.state.title = props.route.params.title;
        } else {
            if (this.state.location && this.state.location.company) {
                this.state.title = this.state.location.company.company_name;
            }
        }
    }
    
    componentDidMount() {
        if (this.state.location.location_id) {
            this.getLocation(this.state.location.location_id);
        }
        AsyncStorage.getItem('activation_code').then(activationCode => {
            this.setState({hasActivationCode: activationCode ? true : false});
        }).catch(e => {
            this.setState({hasActivationCode: false});
        });
    }
    
    getLocation(id) {
        api.post('/vouchers-location', {location_id: id}).then(response => {
            if (response.data.success) {
                if (!this.state.title && response.data.location && response.data.location.company) {
                    this.state.title = response.data.location.company.company_name;
                }
                this.setState({
                    location: response.data.location,
                    vouchers: response.data.vouchers,
                });
            }
        })
    }
    
    openNavigation() {
        const { location } = this.state;
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = location.latitude + ',' + location.longitude;
        const label = location.company ? location.company.company_name : '';
        const url = Platform.select({
            ios: scheme + label + '@' + latLng,
            android: scheme + latLng + '(' + label + ')',
        });
        Linking.openURL(url);
    }
    
    openVoucher(voucher) {
        if (this.state.hasActivationCode === false && voucher.free != '1') {
            this.props.navigation.navigate('VoucherList');
            showMessage({type: 'warning', message: lang.get('error-enter-activation-code', 'Enter your activation code to use this voucher')});
            return;
        }
        let voucherDetails = {...voucher};
        voucherDetails.location = this.state.location;
        this.props.navigation.push('VoucherDetail', {voucher: voucherDetails});
    }
    
    render() {
        const { location, vouchers } = this.state;
        if (location.review) lang.translateModel(location.review, ['description']);
        return (
            <View style={{width:'100%',height:'100%', backgroundColor: '#ffffff'}}>
                <View style={styles.whiteHeaderContainer}>
                    <HeaderWhite parentProps={this.props} title={this.state.title} />
                </View>
                <ParallaxScrollView
                    key={vouchers}
                    style={{flex: 1, overflow: 'hidden'}}
                    backgroundSpeed={10}
                    parallaxHeaderHeight={250}
                    renderScrollComponent={() => <Animated.ScrollView contentContainerStyle={{flexGrow:1, justifyContent:'center', paddingBottom: 60}} />}
                    renderBackground={() => (
                        <View style={{ height: '100%', flex: 1, alignItems: 'center', justifyContent: 'center',paddingTop:100 }}>
                            <ImageBackground
                                source={location.image ? {uri: api.img('width:600;height:300', location.image)} : require('../../images/dashboard.png')}
                                style={{width:'100%',height:300}}
                                resizeMode='cover'
                            >
                                {/* <Image source={this.state.avatarSource} style={styles.uploadAvatar} /> */}
                            </ImageBackground>
                        </View>
                    )}
                >
                    <View style={{ minHeight: 100,backgroundColor:'white',borderTopLeftRadius:50,borderTopRightRadius:50,marginTop:-40,paddingBottom:0}}>
                        {!location.company ? (
                            <ActivityIndicator size="large" color="#2E67B2" style={{marginTop:120, transform: [{ scale: 2 }]}} />
                        ) : (
                            <View style={[styles.container, styles.dashboardContainer]}>
                                {location.company.logo ?
                                <View style={{position:'absolute',width:108,height:108,alignSelf:'center',top:-50,borderRadius:50, borderWidth: 3,borderColor: '#FFFFFF', backgroundColor:'#ffffff'}}>
                                    <Image
                                        style={{width:'100%',height:'100%',borderRadius:50}}
                                        source={{uri: api.img('width:200;height:200', location.company.logo)}}
                                        resizeMode='cover'
                                    />
                                </View>
                                :null}
                                <View style={styles.dashboardInside}>
                                    
                                    {vouchers.length > 0 ? (
                                        <ScrollView style={{width:'100%',height:60}} horizontal={true}>
                                            {vouchers.map(voucher => {
                                                let disabledVoucher = this.state.hasActivationCode === false && voucher.free != '1';
                                                lang.translateModel(voucher, ['title', 'advantage', 'description']);
                                                return (
                                                    <TouchableOpacity
                                                        onPress={() => this.openVoucher(voucher)}
                                                        style={[styles.detailCard, {height:80}, (disabledVoucher ? {backgroundColor:'#eaeaea'} : {})]}
                                                    >
                                                        <Discount width={41} height={41} fill={"#2E67B2"} />
                                                        <View style={styles.detailCardContainer}>
                                                            <Text style={styles.detailCardTitle}>{voucher.title}</Text>
                                                            <Text style={styles.detailCardText}>{voucher.advantage}</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                        
                                    ) : null}
                                    
                                    {location.company.company_name ? (
                                        <Text style={styles.detaliuVoucherTitle}>{location.company.company_name}</Text>
                                    ) :null}
                                    {location.review ?
                                        <Text style={styles.detaliuVoucherText}>
                                            {location.review.description}
                                        </Text>
                                    :null}
                                    
                                    <View style={styles.informationsContainer}>
                                        {location.opening_hours ? (
                                            <View style={styles.informationsElement}>
                                                <Clock width={23} height={23} />
                                                <View style={styles.informationsElementTextContainer}>
                                                    <Text style={styles.discountTitle}>{lang.get('location-opening-hours', 'Opening Hours')}</Text>
                                                    <Text style={styles.discountAddress}>{location.opening_hours}</Text>
                                                </View>
                                            </View>
                                        ) :null}
                                        {location.phone_number ? (
                                            <TouchableOpacity style={styles.informationsElement} onPress={() => {Linking.openURL('tel:'+location.phone_number)}}>
                                                <PhoneIcon fill="black" width={23} height={23} />
                                                <View style={styles.informationsElementTextContainer}>
                                                    <Text style={styles.discountTitle}>{lang.get('location-phone', 'Telephone')}</Text>
                                                    <Text style={styles.discountAddress}>{location.phone_number}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ) :null}
                                        {location.company.facebook_page_parsed ? (
                                            <TouchableOpacity style={styles.informationsElement} onPress={() => {Linking.openURL(location.company.facebook_page_parsed)}}>
                                                <Facebook fill="black" width={23} height={23} />
                                                <View style={styles.informationsElementTextContainer}>
                                                    <Text style={styles.discountTitle}>{lang.get('location-facebook', 'Facebook')}</Text>
                                                    <Text style={styles.discountAddress}>{lang.get('location-facebook-text', 'Visit our facebook page')}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ) :null}
                                        {location.company.website_parsed ? (
                                            <TouchableOpacity style={styles.informationsElement} onPress={() => {Linking.openURL(location.company.website_parsed)}}>
                                                <GlobeIcon fill="black" width={23} height={23} />
                                                <View style={styles.informationsElementTextContainer}>
                                                    <Text style={styles.discountTitle}>{lang.get('location-website', 'Website')}</Text>
                                                    <Text style={styles.discountAddress}>{lang.get('location-website-text', 'Visit our website')}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ) :null}
                                        {location.street ? (
                                            <View style={styles.informationsElement}>
                                                <Location fill="black" fill="black" width={23} height={23} />
                                                <View style={[styles.informationsElementTextContainer, {paddingRight: 120}]}>
                                                    <Text style={styles.discountTitle}>{lang.get('location-location', 'Location')}</Text>
                                                    <View style={{flexDirection: 'row'}}>
                                                        <Text style={[styles.discountAddress, {flexShrink: 1}]}>{location.street+(location.city?', '+location.city:'')}</Text>
                                                    </View>
                                                </View>
                                                {location.latitude && location.longitude ? (
                                                    <TouchableOpacity style={styles.gpsButton} onPress={() => this.openNavigation()}>
                                                        <Text style={styles.gpsText}>{lang.get('location-gps', 'GPS')}</Text>
                                                    </TouchableOpacity>
                                                ) :null}
                                            </View>
                                        ) :null}
                                    </View>
                                    
                                    {location.latitude && location.longitude ? (
                                        <View style={styles.mapContainer}>
                                            <MapView
                                                style={styles.map}
                                                region={{
                                                    latitude: parseFloat(location.latitude),
                                                    longitude: parseFloat(location.longitude),
                                                    latitudeDelta: 0.015,
                                                    longitudeDelta: 0.0121,
                                                }}
                                            >
                                                <Marker
                                                    title={location.street}
                                                    description={location.city}
                                                    anchor={{ x: 0.35, y: 0.35 }}
                                                    coordinate={{
                                                        latitude: parseFloat(location.latitude),
                                                        longitude: parseFloat(location.longitude),
                                                    }}
                                                >
                                                    <View><MarkerIcon width={48} height={48} /></View>
                                                </Marker>
                                            </MapView>
                                        </View>
                                    ) :null}
                                    
                                </View>
                            </View>
                        )}
                    </View>
                </ParallaxScrollView>
                
                <View style={styles.guidoAccountBtnAbsolute}>
                    <TouchableOpacity style={styles.myAccount} onPress={() => this.props.navigation.navigate('Profile')}>
                            <Account width = {23} height = {23}></Account>
                            <Text style={styles.myAccountText}>{lang.get('my-account-button', 'My account')}</Text>
                    </TouchableOpacity>
                </View>
                
            </View>
        )
    }
}

export default LocationDetail;
