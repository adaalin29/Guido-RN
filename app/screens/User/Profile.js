import React, { Component } from 'react';
import { View, Image, Text, ImageBackground, Dimensions, TouchableOpacity, ScrollView, Platform } from 'react-native';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import AsyncStorage from '@react-native-community/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import { OutlinedTextField } from 'react-native-material-textfield';
import { showMessage } from 'react-native-flash-message';
import UserAvatar from '../../components/UserAvatar';
import TagButton from '../../components/TagButton.js';
import HeaderWhite from '../../components/Header/HeaderWhite.js';
import Globe from '../../images/global.svg';
import Logout from '../../images/logout.svg';
import LanguageArrow from '../../images/languageArrow.svg';
import styles from '../../css/commons';
import emitter from 'tiny-emitter/instance';
import api from '../../api';
import lang from '../../lang';
const windowWidth = Dimensions.get('window').width;

class Profile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            firstname: '',
            lastname: '',
            email: '',
            canSave: false,
            tags: [],
            selectedTags: [],
            language: lang.activeLang,
        }
        let auth = api.oauth.getAuth();
        this.state.firstname = auth.user.firstname;
        this.state.lastname = auth.user.lastname;
        this.state.email = auth.user.email;
        if (auth.user.tags) {
            auth.user.tags.map(item => {
                this.state.selectedTags.push(item.tag_id);
            })
        }
        this.languages = Object.keys(lang.languages).map(langCode => ({ value: langCode, label: lang.languages[langCode] }));
    }
    languages = []
    
    componentDidMount() {
        api.get('/tags').then(response => {
            response.data.tags.map(item => {
                item.value = this.state.selectedTags.indexOf(item.tag_id) !== -1;
            });
            this.setState({tags: response.data.tags});
        });
    }
    inputs = []
    
    tagToggle(item, value) {
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
        this.forceUpdate();
        this.saveTags();
    }
    saveTags() {
        api.post('/user/tags', {tags: this.state.selectedTags}).then(response => {
            if (response.data.success == true) {
                let auth = api.oauth.getAuth();
                auth.user.tags = response.data.tags;
                api.oauth.updateAuth(auth);
            }
        })
    }
    
    onInputChange(key, value) {
        this.state[key] = value;
        this.state.canSave = true;
        this.forceUpdate();
    }
    
    updateProfile() {
        let auth = api.oauth.getAuth();
        auth.user.firstname = this.state.firstname;
        auth.user.lastname = this.state.lastname;
        auth.user.email = this.state.email;
        api.oauth.updateAuth(auth);
        this.setState({canSave: false});
        showMessage({type: 'success', message: lang.get('saved', 'Saved !')});
    }
    
    changeLang(value) {
        if (!value) return;
        lang.changeLang(value);
        this.setState({language: value});
    }
    
    logout() {
        AsyncStorage.removeItem('activation_code');
        AsyncStorage.removeItem('isic_cards');
        AsyncStorage.removeItem('city');
        api.oauth.updateAuth({logged: false});
        emitter.emit('auth');
        this.props.navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
        });
    }
    
    render() {
        return (
            <View style={{width:'100%',height:'100%'}}>
                <View style={styles.whiteHeaderContainer}>
                    <HeaderWhite parentProps={this.props} />
                </View>
                <ParallaxScrollView
                    backgroundSpeed={10}
                    parallaxHeaderHeight={230}
                    renderBackground={() => (
                        <View style={{height:'100%',flex: 1, alignItems:'center', justifyContent:'center', paddingTop:100}}>
                            <ImageBackground source={require('../../images/profileBackground.png')} style={{width:'100%',height:300, resizeMode:'contain'}}>
                            </ImageBackground>
                        </View>
                    )}
                >
                    <View style={{minHeight: 100,backgroundColor:'white',borderTopLeftRadius:50,borderTopRightRadius:50,marginTop:-40,paddingBottom:60}}>
                        <View style={[styles.container,styles.dashboardContainer]}>
                            <UserAvatar />
                            <View style={styles.dashboardInside}>
                                <View style={styles.accountDetails}>
                                    <View style={styles.inputContainer}>
                                        <OutlinedTextField
                                            key={this.state}
                                            style={{}}
                                            labelOffset={{y0:-6}}
                                            inputContainerStyle={{borderRadius:20,borderWidth:1, borderColor: '#2E67B2',height:50}}
                                            labelTextStyle={{backgroundColor: 'white', alignSelf: 'flex-start', paddingLeft:5,paddingRight:5}}
                                            textColor="black"
                                            fontSize={16}
                                            labelFontSize={16}
                                            lineWidth={1}
                                            activeLineWidth={1}
                                            baseColor="#9F9F9F"
                                            tintColor="#2E67B2"
                                            label={lang.get('profile-firstname-field', 'First name')}
                                            lineType={'none'}
                                            onChangeText={value => this.onInputChange('firstname', value)}
                                            value={this.state.firstname}
                                            ref={ref => this.inputs['firstname'] = ref}
                                        />
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <OutlinedTextField
                                            key={this.state}
                                            style={{}}
                                            labelOffset={{y0:-6}}
                                            inputContainerStyle={{borderRadius:20,borderWidth:1, borderColor: '#2E67B2',height:50}}
                                            labelTextStyle={{backgroundColor: 'white', alignSelf: 'flex-start', paddingLeft:5,paddingRight:5}}
                                            textColor="black"
                                            fontSize={16}
                                            labelFontSize={16}
                                            lineWidth={1}
                                            activeLineWidth={1}
                                            baseColor="#9F9F9F"
                                            tintColor="#2E67B2"
                                            label={lang.get('profile-lastname-field', 'Last name')}
                                            lineType={'none'}
                                            onChangeText={value => this.onInputChange('lastname', value)}
                                            value={this.state.lastname}
                                            ref={ref => this.inputs['lastname'] = ref}
                                        />
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <OutlinedTextField
                                            key={this.state}
                                            style={{}}
                                            labelOffset={{y0:-6}}
                                            inputContainerStyle={{borderRadius:20,borderWidth:1, borderColor: '#2E67B2',height:50}}
                                            labelTextStyle={{backgroundColor: 'white', alignSelf: 'flex-start', paddingLeft:5,paddingRight:5}}
                                            textColor="black"
                                            fontSize={16}
                                            labelFontSize={16}
                                            lineWidth={1}
                                            activeLineWidth={1}
                                            baseColor="#9F9F9F"
                                            tintColor="#2E67B2"
                                            label={lang.get('profile-email-field', 'Email')}
                                            lineType={'none'}
                                            onChangeText={value => this.onInputChange('email', value)}
                                            value={this.state.email}
                                            ref={ref => this.inputs['email'] = ref}
                                        />
                                    </View>
                                    {this.state.canSave ?
                                        <TouchableOpacity style={styles.continueButton} onPress={() => this.updateProfile()}>
                                            <Text style={styles.continueButtonText}>{lang.get('profile-save', 'Save changes')}</Text>
                                        </TouchableOpacity>
                                    :null}
                                </View>
                                
                                <Text style={[styles.pageTitleText,{color:"black",marginBottom:10}]}>{lang.get('profile-interest-tags', 'I\'m interested in ...')}</Text>
                                <ScrollView style={{height:'auto', maxHeight:200}} contentContainerStyle={styles.selectCategoriesProfile} nestedScrollEnabled={true}>
                                    {this.state.tags.map(item => {
                                        if (item.in_app != 1) return false;
                                        lang.translateModel(item, ['name']);
                                        return (
                                            <TagButton
                                                key={item.id}
                                                text={item.name}
                                                value={item.value}
                                                onChange={(value) => this.tagToggle(item, value)}
                                            />
                                        );
                                    })}
                                </ScrollView>
                                
                                <TouchableOpacity style={styles.selectLanguage} onPress={() => this.languagePicker.togglePicker()}>
                                    <View style={{flex: 1, flexDirection:'row',alignItems:'center'}}>
                                        <Globe fill="black" width={25} height={25} style={{marginRight:10}} />
                                        <RNPickerSelect
                                            style={pickerStyle}
                                            touchableWrapperProps={{style:{width:'84%'}}}
                                            ref={ref => this.languagePicker = ref}
                                            useNativeAndroidPickerStyle={false}
                                            placeholder={{label: lang.get('profile-change-language', 'Change app language'), value: null}}
                                            textInputProps={{color:'black'}}
                                            onValueChange={value => this.changeLang(value)}
                                            items={this.languages}
                                            value={this.state.language}
                                        />
                                    </View>
                                    <LanguageArrow width={15} height={15} style={{flex: 1}} />
                                </TouchableOpacity>
                                
                                <View style={styles.aboutGuido}>
                                    <TouchableOpacity onPress={()=>this.logout()} style={styles.aboutGuidoButton}>
                                        <Text style={styles.aboutGuidoButtonText}>{lang.get('profile-logout', 'Logout')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('StaticPage', {page: 'app-gdpr'})} style={styles.aboutGuidoButton}>
                                        <Text style={styles.aboutGuidoButtonText}>{lang.get('profile-privacy', 'Privacy')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('StaticPage', {page: 'app-about'})} style={styles.aboutGuidoButton}>
                                        <Text style={styles.aboutGuidoButtonText}>{lang.get('profile-about', 'About GUIDO')}</Text>
                                    </TouchableOpacity>
                                </View>
                                
                            </View>
                        </View>
                    </View>
                </ParallaxScrollView>
            </View>
        )
    }
}

export default Profile;

const options = {
    title: 'Select Avatar',
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
};

const pickerStyle={
	inputIOS: {
		color: 'white',
		paddingTop: 13,
		paddingHorizontal: 10,
        paddingBottom: 12,
        width: windowWidth - 140,
    },
	inputAndroid: {
		color: 'white',
	},
	placeholderColor: 'white',
    underline: { borderTopWidth: 0 },
	icon: {
		position: 'absolute',
		backgroundColor: 'transparent',
		borderTopWidth: 5,
		borderTopColor: '#00000099',
		borderRightWidth: 5,
		borderRightColor: 'transparent',
		borderLeftWidth: 5,
		borderLeftColor: 'transparent',
		width: 0,
		height: 0,
		top: 20,
		right: 15,
	},
};