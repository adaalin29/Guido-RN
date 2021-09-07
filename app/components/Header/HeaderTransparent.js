import React, { Component } from 'react';
import { View, Image, Text, ImageBackground, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Back from '../../images/back.svg';
import styles from '../../css/commons';
import SelectCity from '../SelectCity';

class HeaderTransparent extends Component {
    
    render () {
        const props = this.props.parentProps;
        return (
            <View style={[styles.headerTransparent,styles.headerTransparentModified]}>
                
                <TouchableOpacity
                    onPress={() => props.navigation.goBack()}
                    style={{width: 40, height:'100%', paddingVertical: 5, paddingHorizontal: 11, marginRight: 10}}
                >
                    <Back width={13} height={28} />
                </TouchableOpacity>
                
                {!this.props.hideCity ? (
                    <SelectCity navigation={props.navigation} transparent={true} />
                ) :null}
                
            </View>
        )
    }
}        

export default HeaderTransparent;
