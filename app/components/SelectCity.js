import React, { Component } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import lang from '../lang';
import styles from '../css/commons';
import Pin from '../images/pin.svg';
import Menu from '../images/menu.svg';
import PinWhite from '../images/pin-white.svg';
import MenuWhite from '../images/menu-white.svg';

class SelectCity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            city: null,
        }
    }
    
    isMountedComponent = false
    backListener = null
    componentDidMount() {
        this.isMountedComponent = true;
        this.init();
        this.backListener = this.props.navigation.addListener('focus', () => this.init())
    }
    componentWillUnmount() {
        this.isMountedComponent = false;
        if (this.backListener) this.backListener();
    }
    
    init() {
        if (!this.isMountedComponent) return;
        AsyncStorage.getItem('city')
        .then(city => {
            if (!city) return;
            city = JSON.parse(city);
            if (!city) return;
            this.setState({city: city});
        })
        .catch(e => {})
    }
    
    render() {
        let { city } = this.state;
        let transparent = this.props.transparent || false;
        const { navigate } = this.props.navigation;
        if (city) lang.translateModel(city, ['name']);
        return (
            <TouchableOpacity
                onPress={() => navigate('ChangeCity')}
                style={[styles.searchCity, (transparent? styles.searchCityTransparent :{})]}
            >
                <View style={styles.searchCityLeft}>
                    {transparent ? <PinWhite width={10} height={15} /> : <Pin width={10} height={15} />}
                    <Text style={[styles.headerMyCityBig, (transparent? {color:'#005D6B'} :{})]} numberOfLines={1}>
                        {city ? city.name : lang.get('select-city-header', 'Select City')}
                    </Text>
                </View>
                {transparent ? <MenuWhite width={21} height={10} /> : <Menu width={21} height={10} />}
            </TouchableOpacity>
        )
    }
};

export default SelectCity;
