import React, { Component } from 'react';
import { View, Image, Text, ImageBackground, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Logo from '../../images/logo.svg';
import styles from '../../css/commons';
import SelectCity from '../SelectCity';
import CardWalletBtn from '../CardWalletBtn';

class Header extends Component {
    
    render () {
        const props = this.props.parentProps;
        return (
            <View style={styles.headerContainerContent}>
                
                <TouchableOpacity onPress={() => props.navigation.navigate('Home')} activeOpacity={1.0} style={styles.logoButton}>
                    <Logo width={93} height={40} />
                </TouchableOpacity>
                
                <SelectCity navigation={props.navigation} />
                
                {!this.props.hideCard ? (
                    <CardWalletBtn navigation={props.navigation} />
                ) :null}
                
            </View>
        )
    }
}        


export  default(Header);