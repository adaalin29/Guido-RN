import React, { Component } from 'react';
import { View, Image, Text, ActivityIndicator, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import _ from 'lodash';
import Header from '../../components/Header/Header.js';
import TagButton from '../../components/TagButton.js';
import Food from '../../images/food.svg';
import FoodWhite from '../../images/foodWhite.svg';
import BlueArrow from '../../images/blueArrow.svg';
import Discount from '../../images/discount.svg';
import CompanyIcon from '../../images/company.svg';
import ButtonLogo from '../../images/buttonLogo.svg';
import Account from '../../images/account.svg';
import styles from '../../css/commons';
import api from '../../api';
import lang from '../../lang';

class LocationList extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            // locations: [],
            visibleLocations: [],
            category: {},
            // categories: [],
            // selectedCategories: [],
        }
    }
    
    isMountedComponent = false
    backListener = null
    componentDidMount() {
        this.isMountedComponent = true;
        this.init();
        this.backListener = this.props.navigation.addListener('focus', () => this.init())
        
        if (this.props.route.params && this.props.route.params.category) {
            this.setState({category: this.props.route.params.category});
            // this.state.selectedCategories.push(this.props.route.params.category.category_id);
            // this.state.selectedCategories.push(this.props.route.params.category.category_id);
        }
        // api.get('/categories').then(response => {
        //     if (!this.isMountedComponent) return;
        //     if (!response.data.success) return;
        //     let moveFirstIndex = false;
        //     let categories = response.data.categories;
        //     categories.map((item, index) => {
        //         item.value = this.state.selectedCategories.indexOf(item.category_id) !== -1;
        //         if (item.value) moveFirstIndex = index;
        //     });
        //     if (moveFirstIndex !== false) {
        //         let reorderedCategories = [categories[moveFirstIndex]];
        //         categories.splice(moveFirstIndex, 1);
        //         categories.map(tag => reorderedCategories.push(tag));
        //         categories = reorderedCategories;
        //     }
        //     this.setState({categories: categories});
        // });
    }
    
    componentWillUnmount() {
        this.isMountedComponent = false;
        if (this.backListener) this.backListener();
    }
    
    currentCityId = null
    init() {
        if (!this.isMountedComponent) return;
        AsyncStorage.getItem('city')
        .then(city => {
            if (!city) return;
            city = JSON.parse(city);
            if (!city) return;
            if (this.currentCityId != city.city_id) {
                this.setState({loading: true});
                this.currentCityId = city.city_id;
                this.getLocations(city.city_id);
            }
        })
        .catch(e => {
            this.getLocations();
        })
    }
    
    getLocations(city_id) {
        api.post('/locations', {city_id: city_id}).then(response => {
            if (!this.isMountedComponent) return;
            if (response.data.success) {
                this.setState({
                    loading: false,
                    // locations: response.data.locations,
                    visibleLocations: this.filterLocations(response.data.locations),
                })
            } else {
                this.setState({loading: false});
            }
        }).catch(response => {
            if (!this.isMountedComponent) return;
            this.setState({loading: false});
        });
    }
    
    filterLocations(locations) {
        locations = _.sortBy(locations, ['company.company_name']);
        if (this.state.category) {
            locations = locations.filter(location => {
                let locationVisible = false;
                if (location.category_id) {
                    if (this.state.category.category_id == location.category_id) {
                        locationVisible = true;
                    }
                }
                return locationVisible;
            });
        }
        // if (this.state.selectedCategories && this.state.selectedCategories.length) {
        //     locations = locations.filter(location => {
        //         let locationVisible = false;
        //         if (location.category_id) {
        //             if (this.state.selectedCategories.indexOf(location.category_id) !== -1) {
        //                 locationVisible = true;
        //             }
        //         }
        //         return locationVisible;
        //     });
        // }
        let newLocs = [];
        locations.map(location => { if (location.hasVouchers) newLocs.push(location) })
        locations.map(location => { if (!location.hasVouchers) newLocs.push(location) })
        return newLocs;
        // return _.sortBy(locations, ['-hasVouchers', 'company.company_name']);
    }
    
    // onToggle(item, value) {
    //     if (value) {
    //         if (this.state.selectedCategories.indexOf(item.category_id) === -1) {
    //             this.state.selectedCategories.push(item.category_id);
    //         }
    //     } else {
    //         let tagIndex = this.state.selectedCategories.indexOf(item.category_id);
    //         if (tagIndex !== -1) {
    //             this.state.selectedCategories.splice(tagIndex, 1);
    //         }
    //     }
    //     this.setState({visibleLocations: this.filterLocations(this.state.locations)});
    // }
    
    renderItem(item) {
        let location = item.item;
        let title = '';
        if (location.company) title = location.company.company_name;
        return (
            <>
                <TouchableOpacity
                    onPress={() => this.props.navigation.navigate('LocationDetail', {location: location, title: this.state.category.name})}
                    style={styles.listElement}
                >
                    <View style={{width:'100%',justifyContent:'space-between',alignItems:'center',flexDirection:'row'}}>
                        <View style={styles.listElementLeft}>
                            {location.hasVouchers ? (
                                // <Discount width={40} height={40} />
                                <Image source={require('../../images/has-voucher.png')} resizeMode='contain' style={{width: 40, height: 40}} />
                            ) : location.image ?
                                // <Image source={{uri: api.img('width:100;height:100', location.image)}} resizeMode='cover' style={{width: 40, height: 40}} />
                                <CompanyIcon width={30} height={30} />
                            :null}
                            <View style={[styles.discountTextContainer, (location.image ? {} : {marginLeft: 0})]}>
                                <Text style={styles.discountTitle}>{title}</Text>
                                <Text style={styles.discountAddress}>{location.street}</Text>
                            </View>
                        </View>
                        <BlueArrow width={10} height={15} />
                    </View>
                </TouchableOpacity>
                {item.index+1 == this.state.visibleLocations.length ?
                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('Profile')} style={[styles.myAccount,{marginTop:20,}]}>
                        <Account width={23} height={23} />
                        <Text style={styles.myAccountText}>{lang.get('my-account-button', 'My account')}</Text>
                    </TouchableOpacity>
                :null}
            </>
        )
    }
    
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Header parentProps={this.props} />
                </View>
                
                {this.state.category ?
                    <Text style={styles.ListHeaderText}>{this.state.category.name}</Text>
                :null}
                
                {/* <View>
                    <ScrollView style={styles.categories} horizontal={true} showsHorizontalScrollIndicator={false}>
                        {this.state.categories.map((item, index) => {
                            lang.translateModel(item, ['name']);
                            return (
                                <TagButton
                                    key={index}
                                    text={item.name}
                                    value={item.value}
                                    onChange={(value) => this.onToggle(item, value)}
                                />
                            );
                        })}
                    </ScrollView>
                </View> */}
                
                <View style={{flex: 1, marginTop: 10}}>
                    {this.state.loading ? (
                        <ActivityIndicator size="large" color="#005D6B" style={{marginTop:120, transform: [{ scale: 2 }]}} />
                    ) : (
                        this.state.visibleLocations.length > 0 ? (
                            <FlatList
                                data={this.state.visibleLocations}
                                renderItem={item => this.renderItem(item)}
                                keyExtractor={location => location.location_id}
                            />
                        ) : (
                            <Text style={{textAlign:'center',marginTop:80}}>{lang.get('location-no-loc-found', 'No location found')}</Text>
                        )
                    )}
                </View>
                
                {this.state.visibleLocations.length == 0 ?
                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('Profile')} style={[styles.myAccount, {marginTop:20}]}>
                        <Account width={23} height={23} />
                        <Text style={styles.myAccountText}>{lang.get('my-account-button', 'My account')}</Text>
                    </TouchableOpacity>
                :null}
            </View>
        )
    }
}

export default LocationList;
