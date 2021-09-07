import React, { Component } from 'react';
import { View, Image, Text, ImageBackground, Linking, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { OutlinedTextField } from 'react-native-material-textfield';
import * as Sentry from '@sentry/react-native';
import _ from 'lodash';
import { showMessage } from 'react-native-flash-message';
import Header from '../../components/Header/Header.js';
import TagButton from '../../components/TagButton.js';
import Account from '../../images/account.svg';
import styles from '../../css/commons';
import Fuse from 'fuse.js'
import api from '../../api';
import config from '../../config';
import lang from '../../lang';
import helpers from '../../helpers';

class VoucherList extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            tags: [],
            selectedTags: [],
            freeVouchers: [],
            vouchers: [],
            visibleVouchers: [],
            hasActivationCode: null,
            newActivationCode: '',
            showSearchLoading: false,
            searchQuery: '',
        }
    }
    
    isMountedComponent = false
    backListener = null
    componentDidMount() {
        this.isMountedComponent = true;
        this.init();
        this.backListener = this.props.navigation.addListener('focus', () => this.init());
        
        api.get('/tags').then(response => {
            if (!this.isMountedComponent) return;
            response.data.tags.map(tag => {
                lang.translateModel(tag, ['name']);
                tag.firstLetter = 'zzz';
                var fl = tag.name.toLowerCase().match(/([a-z])/);
                if (fl && fl[1]) tag.firstLetter = fl[1];
                return tag;
            });
            response.data.tags.sort((a, b) => {
                if (a.firstLetter < b.firstLetter) return -1;
                if (a.firstLetter > b.firstLetter) return 1;
                return 0;
            })
            this.setState({tags: response.data.tags});
        });
    }
    
    componentWillUnmount() {
        this.isMountedComponent = false;
        if (this.backListener) this.backListener();
    }
    
    currentCityId = null
    init() {
        if (!this.isMountedComponent) return;
        AsyncStorage.getItem('activation_code').then(activationCode => {
            this.setState({hasActivationCode: activationCode ? true : false});
            this.getCity(activationCode);
        }).catch(e => {
            this.setState({hasActivationCode: false});
            this.getCity(null);
        });
    }
    getCity(activationCode) {
        AsyncStorage.getItem('city')
        .then(city => {
            if (!city) return;
            city = JSON.parse(city);
            if (!city) return;
            if (this.currentCityId != city.city_id) {
                this.setState({loading: true});
                this.currentCityId = city.city_id;
                this.getVouchers(city.city_id, activationCode);
            }
        })
        .catch(e => {
            // this.getVouchers(null, activationCode);
        });
    }
    
    getVouchers(city_id, activation_code) {
        if (!activation_code && this.state.freeVouchers.length == 0) {
            helpers.getFreeVouchers(city_id).then(response => {
                if (!this.isMountedComponent) return;
                if (response.data.success) {
                    this.setState({freeVouchers: response.data.vouchers});
                }
            });
        }
        api.post('/vouchers', {
            city_id: city_id,
            activation_code: activation_code,
        }).then(response => {
            if (!this.isMountedComponent) return;
            if (response.data.success) {
                this.setState({
                    loading: false,
                    vouchers: response.data.vouchers,
                    visibleVouchers: this.filterVouchers(response.data.vouchers),
                });
                this.searchEngine.index(response.data.vouchers);
            } else {
                this.setState({loading: false});
            }
        }).catch(response => {
            if (!this.isMountedComponent) return;
            this.setState({loading: false});
        });
    }
    
    filterVouchers(vouchers) {
        if (this.state.searchQuery && this.state.searchQuery.length > 1 && this.searchEngine.engine) {
            let searchFoundIds = {};
            let searchResults = this.searchEngine.search(this.state.searchQuery);
            if (searchResults) {
                searchResults.map(result => {
                    searchFoundIds[result.item.id] = result.score;
                });
            }
            vouchers = vouchers.filter(voucher => {
                let voucherVisible = searchFoundIds.hasOwnProperty(voucher.voucher_id);
                if (voucherVisible) voucher.searchScore = searchFoundIds[voucher.voucher_id];
                return voucherVisible;
            });
            vouchers.sort((a, b) => {
                if (a.searchScore < b.searchScore) return -1;
                if (a.searchScore > b.searchScore) return 1;
                return 0;
            })
        }
        if (this.state.selectedTags && this.state.selectedTags.length) {
            vouchers = vouchers.filter(voucher => {
                let voucherVisible = false;
                if (voucher.tags) {
                    if (this.state.selectedTags.filter(value => voucher.tags.includes(value)).length > 0) {
                        voucherVisible = true;
                    }
                }
                return voucherVisible;
            });
        }
        if (this.state.hasActivationCode === false && this.state.freeVouchers.length > 0) {
            vouchers = vouchers.filter(voucher => voucher.free != '1');
            vouchers = [...this.state.freeVouchers, ...vouchers];
        }
        if (this.voucherScroll) this.voucherScroll.scrollToOffset({ animated: true, offset: 0 });
        return vouchers;
    }
    
    searchEngine = {
        engine: null,
        options: {
            shouldSort: true,
            includeScore: true,
            threshold: 0.5,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: ['id', 'name', 'company', 'description'],
        },
        search(query) {
            if (!this.engine) return;
            return this.engine.search(query);
        },
        update(items) {
            let options = _.clone(this.options);
            let fuseIndex = Fuse.createIndex(options.keys, items)
            this.engine = new Fuse(items, options, fuseIndex);
            return this.engine;
        },
        index(items) {
            if (!items) return null;
            let newItems = [];
            items.map(voucher => {
                newItems.push({
                    id: voucher.voucher_id,
                    name: voucher.title,
                    company: voucher.company ? voucher.company.company_name : '',
                    description: voucher.advantage,
                });
            });
            return this.update(newItems);
        },
    }
    
    searchTimeout = null
    onSearchChange(value) {
        this.setState({searchQuery: value, showSearchLoading: true});
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.setState({visibleVouchers: this.filterVouchers(this.state.vouchers), showSearchLoading: false});
        }, 250);
    }
    
    onToggle(item, value) {
        if (value) {
            if (this.state.selectedTags.indexOf(item.tag_id) === -1) {
                this.state.selectedTags.push(item.tag_id);
            }
        } else {
            let tagIndex = this.state.selectedTags.indexOf(item.tag_id);
            if (tagIndex !== -1) {
                this.state.selectedTags.splice(tagIndex, 1);
            }
        }
        this.setState({visibleVouchers: this.filterVouchers(this.state.vouchers)});
    }
    
    buyActivationCode() {
        Linking.openURL(config.services.api.endpoint + '/redirect-to/guido-buy-guide-' + lang.activeLang);
    }
    
    saveActivationCode() {
        let activationCode = this.state.newActivationCode;
        let auth = api.oauth.getAuth();
        api.post('/user/activation-code', {
            code:          activationCode,
            user_username: auth.user.email,
            user_source:   auth.user.language,
        }).then(response => {
            if (response.data.success) {
                AsyncStorage.setItem('activation_code', activationCode);
                if (Sentry) Sentry.setTag('activation_code', activationCode);
                if (response.data.city) {
                    AsyncStorage.setItem('city', JSON.stringify(response.data.city));
                    if (Sentry) Sentry.setTag('city.id', response.data.city.city_id);
                    if (Sentry) Sentry.setTag('city.name', response.data.city.name);
                } else {
                    if (!this.currentCityId) {
                        showMessage({type:'info', message: lang.get('error-select-city', 'Select a city first!')});
                        this.props.navigation.navigate('ChangeCity');
                    }
                }
                this.currentCityId = null;
                this.init();
            } else {
                if (response.data.error == 'invalid') response.data.error = 'code-invalid';
                showMessage({type: 'danger', message: lang.get('error-'+response.data.error, response.data.error)});
            }
        });
    }
    
    openVoucher(voucher) {
        if (this.state.hasActivationCode === false && voucher.free != '1') {
            return showMessage({type: 'warning', message: lang.get('error-enter-activation-code', 'Enter your activation code to use this voucher')});
        }
        this.props.navigation.navigate('VoucherDetail', {voucher: voucher});
    }
    
    renderItem(item) {
        let voucher = item.item;
        lang.translateModel(voucher, ['title', 'advantage', 'description']);
        return (
            <>
                <TouchableOpacity onPress={() => this.openVoucher(voucher)} style={styles.card}>
                    {/* <ImageBackground style={styles.cardBackgroundBottom} source={{uri: api.img('width:600;height:300', voucher.image)}} resizeMode='cover'>
                        <View style={styles.overlay}></View>
                        {this.state.hasActivationCode === false && voucher.free != '1' ? (
                            <View style={styles.disabledVoucher}></View>
                        ) :null}
                        {voucher.company ?
                            <Text style={styles.companyName}>{voucher.company.company_name}</Text>
                        :null}
                        <View style={styles.voucherContainer}>
                            <Text style={styles.voucherTextCardBig}>{voucher.title}</Text>
                            <Text style={styles.voucherTextCardSmall}>{voucher.advantage}</Text>
                        </View>
                    </ImageBackground>
                    <View style = {{backgroundColor:"#2E67B2",padding:20,borderBottomLeftRadius:15,borderBottomRightRadius:15}}>
                    <View style={styles.voucherContainer}>
                            <Text style={styles.voucherTextCardBig}>{voucher.title}</Text>
                            <Text style={styles.voucherTextCardSmall}>{voucher.advantage}</Text>
                        </View>
                    </View> */}
                    <Image source={{uri: api.img('width:600;height:300', voucher.image)}} style={{width:'100%',height:150}}/>
                    <View style = {{backgroundColor:"#2E67B2",padding:10,borderBottomLeftRadius:15,borderBottomRightRadius:15}}>
                        <View>
                            <Text style={styles.voucherTextCardBig}>{voucher.title}</Text>
                            
                            <View style ={{flex:1,flexDirection:'column',justifyContent:'flex-end',width:'100%',alignItems:'flex-end'}}>
                            {voucher.company ?
                            <Text style={[styles.companyNameModified,{fontSize:16,}]}>{voucher.company.company_name}</Text>
                            :null}
                            <Text style={styles.voucherTextCardSmall}>{voucher.advantage}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
                {item.index+1 == this.state.visibleVouchers.length ?
                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('Profile')} style={[styles.myAccount,{marginTop:20,}]}>
                        <Account width={23} height={23} />
                        <Text style={styles.myAccountText}>{lang.get('my-account-button', 'My account')}</Text>
                    </TouchableOpacity>
                :null}
            </>
        );
    }
    
    voucherScroll = null;
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Header parentProps={this.props} key={this.state.hasActivationCode} />
                </View>
                
                {/* <ScrollView style={[styles.categories, {flexShrink: 0, maxHeight:40}]} horizontal={true} showsHorizontalScrollIndicator={false}>
                    {this.state.tags.map(item => {
                        lang.translateModel(item, ['name']);
                        return (
                            <TagButton
                                key={item.id}
                                text={item.name}
                                onChange={(value) => this.onToggle(item, value)}
                            />
                        );
                    })}
                </ScrollView> */}
                
                <View style={{position:'relative',marginTop:16}}>
                    <OutlinedTextField
                        style={{}}
                        labelOffset={{y0:-6}}
                        inputContainerStyle={{borderRadius:20,borderWidth:1, borderColor: '#005D6B',height:50}}
                        labelTextStyle={{backgroundColor: 'white', alignSelf: 'flex-start', paddingLeft:5,paddingRight:5}}
                        textColor="black"
                        fontSize={16}
                        labelFontSize={16}
                        lineWidth={1}
                        activeLineWidth={1}
                        baseColor="#9F9F9F"
                        tintColor="#005D6B"
                        label={lang.get('voucher-list-search', 'Search')}
                        lineType={'none'}
                        onChangeText={value => this.onSearchChange(value)}
                        value={this.state.searchQuery}
                    />
                    {this.state.showSearchLoading ? (
                        <ActivityIndicator color="#005D6B" style={{position:'absolute',right:16,top:16}} />
                    ) :null}
                </View>
                
                {this.state.hasActivationCode === false ?
                    <View style={[styles.card,styles.adaugaVaucher]}>
                        <Text style={styles.adaugaVoucherText}>{lang.get('activation-box-title', 'Activation code')}</Text>
                        <View style={{flexDirection: 'row'}}>
                            <TextInput
                                style={styles.adaugaVoucherInput}
                                onChangeText={value => this.setState({newActivationCode: value})}
                                value={this.state.newActivationCode}
                                placeholder={lang.get('activation-box-field', 'Enter your activation code here')}
                                autoCapitalize='characters'
                                // placeholderTextColor="#005D6B"
                                paddingLeft={20}
                            />
                            <TouchableOpacity style={styles.saveNewActivationCode} onPress={() => this.saveActivationCode()}>
                                <Text style={styles.saveNewActivationCodeText}>{lang.get('activation-box-save-button', 'Save')}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.adaugaVoucherTextSmall}>
                            {lang.get('activation-box-description', 'Enter the activation code you find on the cover of your printed Guido Guide')}
                        </Text>
                        <View style={{flexDirection: 'row'}}>
                            <TouchableOpacity style={styles.buyActivation} onPress={() => this.buyActivationCode()}>
                                <Text style={styles.buyActivationText}>{lang.get('activation-box-buy-guido-guide', 'Buy a Guido Guide with free activation code')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                :null}
                
                <View style={[styles.homeScrollView, {marginTop: 0}]}>
                    {this.state.loading ? (
                        <ActivityIndicator size="large" color="#005D6B" style={{marginTop:120, transform: [{ scale: 2 }]}} />
                    ) : (
                        this.state.visibleVouchers.length > 0 ? (
                            <FlatList
                                ref={ref => this.voucherScroll = ref}
                                data={this.state.visibleVouchers}
                                renderItem={item => this.renderItem(item)}
                                style={{flex:1, height:'100%'}}
                                keyExtractor={(voucher, index) => index}
                            />
                        ) : (
                            <Text style={{textAlign:'center',marginTop:80}}>{lang.get('voucher-no-vouc-found', 'No voucher found')}</Text>
                        )
                    )}
                </View>
            </View>
        )
    }
}

export default VoucherList;
