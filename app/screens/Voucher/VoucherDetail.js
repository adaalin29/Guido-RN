import React, { Component } from 'react';
import { View, Image, Text, TextInput, ImageBackground, TouchableOpacity, Animated, Linking, ActivityIndicator } from 'react-native';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import Share from 'react-native-share';
import HeaderTransparent from '../../components/Header/HeaderTransparent.js';
import ShareIcon from '../../images/share.svg';
import Location from '../../images/location.svg';
import CompanyIcon from '../../images/company.svg';
import Finger from '../../images/finger.svg';
import Success from '../../images/success.svg';
import styles from '../../css/commons';
import api from '../../api';
import lang from '../../lang';
import helpers from '../../helpers';
import { showMessage } from 'react-native-flash-message';

class VoucherDetail extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            showClaimConfirmation: false,
            showClaimSuccess: false,
            claimBarcode: null,
            voucher: {},
        }
        if (props.route.params && props.route.params.voucher) {
            this.state.voucher = props.route.params.voucher;
            this.state.voucher.usageInfo = null;
        }
    }
    
    isMountedComponent = false
    backListener = null
    
    componentDidMount() {
        this.isMountedComponent = true;
        this.init();
        this.backListener = this.props.navigation.addListener('focus', () => this.init())
        
        if (this.state.voucher.voucher_id) {
            this.getVoucher(this.state.voucher.voucher_id);
        }
    }
    getVoucher(voucher_id) {
        let data = {voucher_id: voucher_id};
        if (this.state.voucher && this.state.voucher.location) {
            data.location_id = this.state.voucher.location.location_id;
        }
        api.post('/voucher-details', data).then(response => {
            if (response.data.success) {
                response.data.voucher.usageInfo = helpers.getVoucherUsageInfo(response.data.voucher);
                this.setState({voucher: response.data.voucher});
            }
        });
    }
    
    componentWillUnmount() {
        this.isMountedComponent = false;
        if (this.backListener) this.backListener();
    }
    
    init() {
        if (!this.isMountedComponent) return;
    }
    
    updateRef(refName, ref) {
        this[refName] = ref;
        // if (this.voucherContentView && this.paralaxScroll) {
        //     setTimeout(() => {
        //         this.voucherContentView.measureInWindow((x, y, width, height) => {
        //             if (height < 600 && this.paralaxScroll) {
        //                 this.paralaxScroll.setNativeProps({style: {flex: 1, overflow: 'hidden', marginBottom: -500}});
        //             }
        //         });
        //     }, 10);
        // }
    }
    
    shareVoucher() {
        const { voucher } = this.state;
        Share.open({
            title: lang.get('voucher-share-popup', 'Choose an app to share'),
            message: voucher.title + ' ' + 'https://app-backend.guido.be/voucher-' + voucher.voucher_id + '/' + helpers.slug(voucher.title),
        })
        .then(res => { console.log(res) })
        .catch(err => { err && console.log(err); });
    }
    
    openNavigation() {
        const { voucher } = this.state;
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = voucher.location.latitude + ',' + voucher.location.longitude;
        const label = voucher.company ? voucher.company.company_name : '';
        const url = Platform.select({
            ios: scheme + label + '@' + latLng,
            android: scheme + latLng + '(' + label + ')',
        });
        Linking.openURL(url);
    }
    
    startClaimVoucher() {
        // // if (this.paralaxScroll) this.paralaxScroll.scrollTo(0);
        const { voucher } = this.state;
        if (!voucher.usageInfo.canUse) {
            return showMessage({type: 'warning', message: lang.get('voucher-enter-code', 'Enter a city guide activation app to start using the vouchers!')});
        }
        this.setState({showClaimConfirmation: true});
    }
    claimVoucher() {
        const { voucher } = this.state;
        if (!voucher.usageInfo.canUse) {
            return showMessage({type: 'warning', message: lang.get('voucher-enter-code', 'Enter a city guide activation app to start using the vouchers!')});
        }
        api.post('/claim-voucher', {voucher_id: voucher.voucher_id}).then(response => {
            console.log(response.data);
            if (response.data.success) {
                showMessage({type: 'success', message: lang.get('voucher-claimed', 'Voucher successfully claimed!')});
                voucher.usageInfo.canUse = response.data.canUseAgain;
                this.state.showClaimConfirmation = false;
                this.state.showClaimSuccess = true;
                if (response.data.barcode_image) this.state.claimBarcode = response.data.barcode_image;
                this.forceUpdate();
            } else {
                this.setState({showClaimConfirmation: false});
                if (response.data.error == 'voucher-not-found') {
                    showMessage({type: 'danger', message: lang.get('voucher-not-found', 'Voucher not found!')});
                }
                if (response.data.error == 'cannot-use') {
                    showMessage({type: 'danger', message: lang.get('voucher-can-not-use', 'You can not use this voucher!')});
                }
            }
        }).catch(response => {
            this.setState({showClaimConfirmation: false});
        });
    }
    
    paralaxScroll = null
    voucherContentView = null
    render() {
        const { voucher } = this.state;
        lang.translateModel(voucher, ['title', 'advantage', 'description']);
        let usageText = null;
        if (voucher.usageInfo) {
            if (voucher.usageInfo.type == 'peruser' && voucher.usageInfo.perUser === 1) {
                usageText = lang.get('voucher-usage-peruser').replace('{{nr}}', voucher.usageInfo.perUser);
            }
            if (voucher.usageInfo.type == 'peruser' && voucher.usageInfo.perUser !== 1) {
                usageText = lang.get('voucher-usage-peruser-more').replace('{{nr}}', voucher.usageInfo.perUser);
            }
            if (voucher.usageInfo.type == 'total' && voucher.usageInfo.total === 1) {
                usageText = lang.get('voucher-usage-total').replace('{{nr}}', voucher.usageInfo.total);
            }
            if (voucher.usageInfo.type == 'total' && voucher.usageInfo.total !== 1) {
                usageText = lang.get('voucher-usage-total-more').replace('{{nr}}', voucher.usageInfo.total);
            }
        }
        return (
            <View style={{width:'100%',height:'100%'}}>
                <View style={styles.transparentHeaderContainer}>
                    <HeaderTransparent parentProps={this.props} hideCity={true} />
                </View>
                <ParallaxScrollView
                    ref={ref => this.updateRef('paralaxScroll', ref)}
                    style={{flex: 1, overflow: 'hidden'}}
                    backgroundSpeed={10}
                    parallaxHeaderHeight={250}
                    renderScrollComponent={() => <Animated.ScrollView contentContainerStyle={{flexGrow:1, justifyContent:'center', paddingBottom: 0}} />}
                    renderBackground={() => (
                        <View style={{ height: '100%', flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop:100 }}>
                            <ImageBackground
                                source={voucher.image ? {uri: api.img('width:600;height:300', voucher.image)} : require('../../images/dashboard.png')}
                                style={{width:'100%', height: 300, position:'relative'}}
                                resizeMode='cover'
                            >
                                {usageText ? (
                                    <View style={styles.expiredContainer}>
                                        <View style={styles.expiredVoucherElement}>
                                            <View style={{width:'100%',height:'100%',position:'relative',top:0,left:0,zIndex:5,backgroundColor:'black',opacity:0.4}}></View>
                                            <View style={styles.voucherElementOverlay}>
                                                <Text style={styles.expiredVoucherText}>{usageText}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ) :null}
                                {voucher.usageInfo && voucher.usageInfo.expired ? (
                                    <>
                                        <View style={[styles.overlay,{opacity:0.5}]}></View>
                                        <View style={styles.expiredContainer}>
                                            <View style={styles.expiredElement}>
                                                <Text style={styles.expiredText}>{lang.get('voucher-expired', 'Expired')}</Text>
                                            </View>
                                        </View>
                                    </>
                                ) :null}
                            </ImageBackground>
                        </View>
                    )}
                >
                    <View
                        ref={ref => this.updateRef('voucherContentView', ref)}
                        style={{flex: 1, minHeight:100, backgroundColor:'white', borderTopLeftRadius:50, borderTopRightRadius:50, marginTop:-40, paddingBottom:0}}
                    >
                        <View style={[styles.container,styles.dashboardContainer]}>
                            {voucher.company && voucher.company.logo ?
                            <View style={{position:'absolute',width:108,height:108,alignSelf:'center',top:-50,borderRadius:50, borderWidth: 3,borderColor: '#FFFFFF', backgroundColor:'#ffffff'}}>
                                <Image
                                    style={{width:'100%',height:'100%',borderRadius:50}}
                                    source={{uri: api.img('width:200;height:200', voucher.company.logo)}}
                                    resizeMode='cover'
                                />
                            </View>
                            :null}
                            
                            {this.state.showClaimConfirmation == false && this.state.showClaimSuccess == false ? (
                                <View style={styles.dashboardInside}>
                                    
                                    {voucher.shareable == '1' && voucher.usageInfo && !voucher.usageInfo.expired ? (
                                        <TouchableOpacity style={styles.shareContainer} onPress={() => this.shareVoucher()}>
                                            <ShareIcon width={20} height={10} />
                                            <Text style={styles.shareText}>{lang.get('voucher-share', 'Share with friends')}</Text>
                                        </TouchableOpacity>
                                    ) :null}
                                    
                                    <Text style={styles.detaliuVoucherTitle}>{voucher.title}</Text>
                                    <Text style={styles.detaliuVoucherText}>
                                        {voucher.advantage}
                                    </Text>
                                    <Text style={styles.detaliuVoucherText}>
                                        {voucher.description}
                                    </Text>
                                    
                                    <View style={styles.informationsContainer}>
                                        {voucher.company && voucher.company.company_name ? (
                                            <TouchableOpacity style={styles.informationsElement} onPress={() => this.props.navigation.navigate('LocationDetail', {location: voucher.location, title: voucher.location?voucher.location.category_name:''})}>
                                                <CompanyIcon width={23} height={23} />
                                                <View style={styles.informationsElementTextContainer}>
                                                    <Text style={styles.discountTitle}>{lang.get('voucher-company', 'Company')}</Text>
                                                    <Text style={styles.discountAddress}>{voucher.company.company_name}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ) :null}
                                        {voucher.location && voucher.location.street ? (
                                            <View style={styles.informationsElement}>
                                                <Location fill="black" fill="black" width={23} height={23} />
                                                <View style={[styles.informationsElementTextContainer, {paddingRight: 120}]}>
                                                    <Text style={styles.discountTitle}>{lang.get('location-location', 'Location')}</Text>
                                                    <View style={{flexDirection: 'row'}}>
                                                        <Text style={[styles.discountAddress, {flexShrink: 1}]}>{voucher.location.street+(voucher.location.city?', '+voucher.location.city:'')}</Text>
                                                    </View>
                                                </View>
                                                {voucher.location.latitude && voucher.location.longitude ? (
                                                    <TouchableOpacity style={styles.gpsButton} onPress={() => this.openNavigation()}>
                                                        <Text style={styles.gpsText}>{lang.get('location-gps', 'GPS')}</Text>
                                                    </TouchableOpacity>
                                                ) :null}
                                            </View>
                                        ) :null}
                                    </View>
                                    
                                    {voucher.usageInfo ? voucher.usageInfo.expired ? (
                                        <View style={styles.useVoucherButton}>
                                            <Text style={styles.useVoucherText}>{lang.get('voucher-expired', 'Expired')}</Text>
                                        </View>
                                    ) : (voucher.usageInfo.canUse ? (
                                        <TouchableOpacity
                                            onPress={() => this.startClaimVoucher()}
                                            style={[styles.useVoucherButton,{backgroundColor:'#2E67B2'}]}
                                        >
                                            <Text style={[styles.useVoucherText,{color:'white'}]}>{lang.get('voucher-use-button', 'Use Voucher')}</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.useVoucherButton}>
                                            <Text style={styles.useVoucherText}>{lang.get('voucher-use-button-disabled', 'You can not use this voucher')}</Text>
                                        </View>
                                    )) : (
                                        <ActivityIndicator size="large" color="#005D6B" style={{marginTop: 20, transform: [{ scale: 2 }]}} />
                                    )}
                                    
                                </View>
                            ) : null}
                            {this.state.showClaimConfirmation == true ? (
                                <View style={styles.dashboardInside}>
                                    <Text style={styles.detaliuVoucherTitle}>{voucher.title}</Text>
                                    <Text style={styles.detaliuVoucherText}>
                                        {voucher.advantage}
                                    </Text>
                                    <Text style={styles.detaliuVoucherText}>
                                        {lang.get('voucher-use-page-text1', 'Show this screen at the counter.')+"\n"}
                                        {lang.get('voucher-use-page-text2', 'Claim your voucher, confirm by pushing the button.')}
                                    </Text>
                                    <TouchableOpacity onPress={() => this.claimVoucher()} style={styles.butonTrimite}>
                                        <Finger width={45} height={61} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.setState({showClaimConfirmation: false})} style={styles.useVoucherButton}>
                                        <Text style={styles.useVoucherText}>{lang.get('voucher-use-cancel-button', 'Cancel')}</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : null}
                            {this.state.showClaimSuccess == true ? (
                                <View style={styles.dashboardInside}>
                                    <Text style={styles.detaliuVoucherTitle}>{voucher.title}</Text>
                                    <Text style={styles.detaliuVoucherText}>
                                        {voucher.advantage}
                                    </Text>
                                    <Success style={styles.succesImage} width={70} height={115} />
                                    <Text style={[styles.detaliuVoucherText,styles.succesText]}>
                                        {lang.get('voucher-use-success', 'The voucher was successfuly used for you to have fun.')}
                                    </Text>
                                    {this.state.claimBarcode ? (
                                        <Image
                                            source={{ uri: this.state.claimBarcode }}
                                            style={{ width: '100%', height: 200, marginBottom: 20}}
                                            resizeMode='contain'
                                        />
                                    ) :null}
                                    
                                    {voucher.shareable == '1' && voucher.usageInfo && !voucher.usageInfo.expired ? (
                                        <TouchableOpacity style={styles.shareContainer} onPress={() => this.shareVoucher()}>
                                            <ShareIcon width={20} height={10} />
                                            <Text style={styles.shareText}>{lang.get('voucher-share', 'Share with friends')}</Text>
                                        </TouchableOpacity>
                                    ) :null}
                                </View>
                            ) : null}
                        </View>
                    </View>
                </ParallaxScrollView>
            </View>
        )
    }
}

export default VoucherDetail;
