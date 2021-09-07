import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import lang from '../../lang';
import BackBlue from '../../images/backBlue.svg';
import CardWalletBtn from '../CardWalletBtn';
import styles from '../../css/commons';

class HeaderWhite extends Component {
    
    render () {
        const props = this.props.parentProps;
        const actualPage = props.route.name;
        return (
            <View style={[styles.headerWhite]}>
                
                <View style={{width:45,height:40}}>
                    <TouchableOpacity
                        onPress={()=> props.navigation.goBack()}
                        style={{width: 40, height:'100%', paddingVertical:6, paddingHorizontal: 12}}
                    >
                        <BackBlue width={13} height={28} />
                    </TouchableOpacity>
                </View>
                
                { actualPage === 'Profile' ? <Text style={styles.headerText}>{lang.get('profile-page-title', 'My profile')}</Text> : null }
                { actualPage === 'MyCards' ?  <Text style={styles.headerText}>{lang.get('isic-card-my-cards', 'My Cards')}</Text> : null }
                { actualPage === 'ViewCard' ?  <Text style={styles.headerText}>{lang.get('isic-card-my-card', 'My Card')}</Text> : null }
                { actualPage === 'AddCard' ?  <Text style={styles.headerText}>{lang.get('isic-card-add-button', 'Add a card')}</Text> : null }
                { actualPage === 'LocationDetail' ?  <Text style={styles.headerText}>{this.props.title}</Text> : null }
                { actualPage === 'StaticPage' ?  <Text style={styles.headerText}>{this.props.title}</Text> : null }
                
                {!this.props.hideCard ? (
                    <CardWalletBtn navigation={props.navigation} />
                ) : (
                    <View style={styles.voucher}></View>
                )}
                
            </View>
        );
    }
}

export default HeaderWhite;
