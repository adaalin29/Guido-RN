import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Keyboard, Linking } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as Animatable from 'react-native-animatable';
import { OutlinedTextField } from 'react-native-material-textfield';
import AsyncStorage from '@react-native-community/async-storage';
import { showMessage } from 'react-native-flash-message';
import * as Sentry from '@sentry/react-native';
import Logo from '../../images/logo.svg';
import styles from '../../css/commons';
import api from '../../api';
import config from '../../config';
import lang from '../../lang';

class ActivationCode extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            activationCode: '',
        }
    }
    
    keyboardShow = null
    keyboardHide = null
    componentDidMount() {
        this.keyboardShow = Keyboard.addListener('keyboardDidShow', () => {
            if (this.headerRef) this.headerRef.setNativeProps({style: {display:'none'}})
        });
        this.keyboardHide = Keyboard.addListener('keyboardDidHide', () => {
            if (this.headerRef) this.headerRef.setNativeProps({style: styles.welcomeTop})
        });
    }
    componentWillUnmount() {
        if (this.keyboardShow) this.keyboardShow.remove();
        if (this.keyboardHide) this.keyboardHide.remove();
    }
    
    buyActivationCode() {
        Linking.openURL(config.services.api.endpoint + '/redirect-to/guido-buy-guide-' + lang.activeLang);
    }
    
    continue() {
        let activationCode = this.state.activationCode;
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
                }
                this.props.navigation.navigate('SelectCategories');
            } else {
                if (response.data.error == 'invalid') response.data.error = 'code-invalid';
                showMessage({type: 'danger', message: lang.get('error-'+response.data.error, response.data.error)});
            }
        });
    }
    
    headerRef = null
    render() {
        return (
            <View style={[styles.container,{padding:0,}]}>
                <View style={styles.welcomeTop} ref={ref => this.headerRef = ref}>
                    <Logo width={99} height={36} />
                    <Text style={styles.welcomeText}>
                        {lang.get('welcome2-page-greetings', 'Hello, {{name}} !').replace('{{name}}', api.oauth.getAuth().user.firstname)}
                    </Text>
                    <Text style={[styles.selectCategoriesText,{marginTop:10}]}>
                        {lang.get('welcome2-page-header', 'Please add your activation code. You can add this later, after the registration process')}
                    </Text>
                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', marginTop: 10}}>
                        <View style={{backgroundColor: '#B9B9B9', width: 8, height: 8, borderRadius: 8, marginLeft: 5, marginRight: 5, marginTop: 5, marginBottom: 5}} />
                        <View style={{backgroundColor: '#2E67B2', width: 12, height: 12, borderRadius: 12, marginLeft: 5, marginRight: 5, marginTop: 5, marginBottom: 5}} />
                        <View style={{backgroundColor: '#B9B9B9', width: 8, height: 8, borderRadius: 8, marginLeft: 5, marginRight: 5, marginTop: 5, marginBottom: 5}} />
                    </View>
                </View>
                <Animatable.View duration={1000} animation="bounceInUp" useNativeDriver={true} style={styles.welcomeContainer}>
                    <ScrollView style={{width:'100%',height:'100%',padding:20}} contentContainerStyle={{flexGrow:1, justifyContent:'center', paddingBottom:20}}>
                        <View style={styles.inputContainer}>
                            <OutlinedTextField
                                labelOffset={{y0:-6}}
                                inputContainerStyle={{borderRadius:20,borderWidth:1, borderColor: '#2E67B2',height:50}}
                                labelTextStyle={{backgroundColor: '#efefef', alignSelf: 'flex-start', paddingLeft:5,paddingRight:5}}
                                textColor="black"
                                fontSize={16}
                                labelFontSize={16}
                                lineWidth={1}
                                activeLineWidth={1}
                                baseColor="#9F9F9F"
                                tintColor="#2E67B2"
                                label={lang.get('welcome2-activation-field', 'Activation Code')}
                                autoCapitalize='characters'
                                lineType={'none'}
                                onChangeText={val => this.setState({activationCode: val})}
                                value={this.state.activationCode}
                            />
                        </View>
                        <Text style={[styles.selectCategoriesText,{marginTop:20,marginBottom:0,marginLeft:'auto',marginRight:'auto'}]}>
                            {lang.get('welcome2-page-subheader', 'Use the activation code in your Guido Guide to get access to all the vouchers.')}
                        </Text>
                        <TouchableOpacity onPress={()=>this.continue()} style={[styles.continueButton,{marginTop:20,marginBottom:20}]}>
                            <Text style={styles.continueButtonText}>{lang.get('welcome2-continue-button', 'Continue registration')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.props.navigation.navigate('SelectCategories')} style={{marginTop:0}}>
                            <Text style={[styles.continueButtonText,{color:'#2E67B2', fontSize:20}]}>{lang.get('welcome2-activation-skip', 'Skip this')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.buyActivationCode()} style={{marginTop:30,marginBottom:20}}>
                            <Text style={[styles.continueButtonText,{color:'#8D8D8D'}]}>
                                {lang.get('welcome2-buy-guido-guide', 'Buy a Guido Guide with free activation code')}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animatable.View>
            </View>
        )
    }
}

export default ActivationCode;
