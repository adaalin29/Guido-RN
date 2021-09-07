import React, { Component } from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import * as Sentry from '@sentry/react-native';
import Header from '../../components/Header/Header.js';
import Account from '../../images/account.svg';
import { SvgCssUri  } from 'react-native-svg';
import styles from '../../css/commons';
import api from '../../api';
import lang from '../../lang';

class ChanceCity extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            activeCity: null,
            cities: [],
        }
    }
    
    componentDidMount() {
        AsyncStorage.getItem('city').then(city => {
            if (!city) return;
            city = JSON.parse(city);
            if (!city) return;
            this.setState({activeCity: city.id})
        });
        api.get('/cities')
        .then(response => {
            if (response.data.success) {
                let cities = [];
                response.data.cities.map(city => {
                    if (city.language.toLowerCase() == lang.activeLang) cities.push(city);
                });
                response.data.cities.map(city => {
                    if (city.language.toLowerCase() != lang.activeLang) cities.push(city);
                });
                this.setState({cities: cities});
            }
        });
    }
    
    changeCity(city) {
        this.setState({activeCity: city.id});
        AsyncStorage.setItem('city', JSON.stringify(city));
        if (Sentry) Sentry.setTag('city.id', city.city_id);
        if (Sentry) Sentry.setTag('city.name', city.name);
        this.props.navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    }
    
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Header parentProps={this.props} key={this.state.activeCity} />
                </View>
                <ScrollView style={styles.homeScrollView}>
                    <View style={styles.cityContainer}>
                        
                        {this.state.cities.map((city, key) => {
                            let active = this.state.activeCity == city.id;
                            let imageType = city.image ? city.image.toLowerCase().split('.').pop() : null;
                            if (imageType == 'png' || imageType == 'jpg' || imageType == 'jpeg') imageType = 'image';
                            lang.translateModel(city, ['name']);
                            return (
                                <TouchableOpacity
                                    onPress={() => this.changeCity(city)}
                                    style={[styles.cityCard, (active? {backgroundColor:'#2E67B2'} :{})]}
                                    key={'id'+key+'a'+active}
                                >
                                    {city.image ? (
                                        imageType == 'svg' ? (
                                            <SvgCssUri uri={city.image} width="100%" height="100%" />
                                        ) :
                                        imageType == 'image' ? (
                                            <Image source={{uri: city.image}} style={{width: '100%', height: '100%'}} resizeMode={'contain'} />
                                        ) :
                                        null
                                    ) : (
                                        <Text style={[styles.cityText, {fontSize: 20}]}>{city.name}</Text>
                                    )}
                                </TouchableOpacity>
                            )
                        })}
                        
                    </View>
                    
                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('Profile')} style={[styles.myAccount, {marginBottom:30}]}>
                        <Account width={23} height={23} />
                        <Text style={styles.myAccountText}>{lang.get('my-account-button', 'My account')}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        )
    }
}

export default ChanceCity;
