import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Switch, Dimensions, Keyboard } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { ScrollView } from 'react-native-gesture-handler';
import { OutlinedTextField } from 'react-native-material-textfield';
import { showMessage } from 'react-native-flash-message';
import emitter from 'tiny-emitter/instance';
import api from '../../api';
import lang from '../../lang';
import Logo from '../../images/logo.svg';
import styles from '../../css/commons';

class Welcome extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            firstName: '',
            lastName: '',
            terms: false,
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
    
    register() {
        api.post('/user/register', {
            email:     this.state.email,
            firstname: this.state.firstName,
            lastname:  this.state.lastName,
            language:  'be-nl',
            optin:     this.state.terms,
        }).then(response => {
            if (response.data.success) {
                api.oauth.updateAuth({
                    logged: true,
                    user: response.data.user,
                    token: api.oauth.processNewToken(response.data.token),
                });
                emitter.emit('auth');
                this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'ActivationCode' }],
                });
            } else {
                showMessage({type: 'danger', message: response.data.error});
            }
        }).catch(response => {
            showMessage({type: 'danger', message: lang.get('error-unknown', 'Unknown error. Please try again later.')});
        });
    }
    
    headerRef = null
    render() {
        return (
            <View style={[styles.container,{padding:0}]}>
                <View style={styles.welcomeTop} ref={ref => this.headerRef = ref}>
                    <Logo width={99} height={36} />
                    <Text style={styles.welcomeText}>{lang.get('welcome1-page-greetings', 'Welcome')}</Text>
                    <Text style={[styles.selectCategoriesText,{marginTop:10}]}>
                        {lang.get('welcome1-page-header', 'Please complete your profile name and your email adress')}
                    </Text>
                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', marginTop: 10}}>
                        <View style={{backgroundColor: '#2E67B2', width: 12, height: 12, borderRadius: 12, marginLeft: 5, marginRight: 5, marginTop: 5, marginBottom: 5}} />
                        <View style={{backgroundColor: '#B9B9B9', width: 8, height: 8, borderRadius: 8, marginLeft: 5, marginRight: 5, marginTop: 5, marginBottom: 5}} />
                        <View style={{backgroundColor: '#B9B9B9', width: 8, height: 8, borderRadius: 8, marginLeft: 5, marginRight: 5, marginTop: 5, marginBottom: 5}} />
                    </View>
                </View>
                <Animatable.View duration={1000} animation="bounceInUp" useNativeDriver={true} style={styles.welcomeContainer}>
                    <ScrollView style={{width:'100%',height:'100%', padding:20}} contentContainerStyle={{flexGrow:1, justifyContent:'center', paddingBottom:20}}>
                        
                        <View style={styles.inputContainer}>
                            <OutlinedTextField
                                style={{}}
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
                                label={lang.get('welcome1-firstname-field', 'First name')}
                                lineType={'none'}
                                onChangeText={val => this.setState({firstName: val})}
                                value={this.state.firstName}
                            />
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <OutlinedTextField
                                style={{}}
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
                                label={lang.get('welcome1-lastname-field', 'Last name')}
                                lineType={'none'}
                                onChangeText={val => this.setState({lastName: val})}
                                value={this.state.lastName}
                            />
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <OutlinedTextField
                                style={{}}
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
                                label=''
                                autoCapitalize='none'
                                label={lang.get('welcome1-email-field', 'Email')}
                                lineType={'none'}
                                onChangeText={val => this.setState({email: val})}
                                value={this.state.email}
                            />
                        </View>
                        
                        <View style={[styles.termsContainer,{marginTop:20,marginBottom:20}]}>
                            <Switch
                                trackColor={{ false: "#767577", true: "#2E67B2" }}
                                thumbColor={this.state.terms ? "#FFFFFF" : "#FFFFFF"}
                                ios_backgroundColor={this.state.terms ? "#DB6B5A" : "#767577"}
                                onValueChange={value => this.setState({terms:value})}
                                value={this.state.terms}
                            />
                            <View style={[styles.termsTextContaner,{marginLeft:10}]}>
                                <Text style={styles.termeniText}>{lang.get('welcome1-accept-prefix', 'Accept the')}</Text>
                                <TouchableOpacity style={{marginRight:10}}>
                                    <Text style={styles.termsText}>{lang.get('welcome1-accept-terms', 'Terms of services')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{marginRight:10}}>
                                    <Text style={styles.termsText}>{lang.get('welcome1-accept-privacy', 'Privacy policy')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <TouchableOpacity onPress={() => this.register()} style={[styles.continueButton, {marginBottom:20}]}>
                            <Text style={styles.continueButtonText}>{lang.get('welcome1-continue-button', 'Continue registration')}</Text>
                        </TouchableOpacity>
                        
                    </ScrollView>
                </Animatable.View>
            </View>
        )
    }
}

export default Welcome;
