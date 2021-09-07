import React, { Component } from 'react';
import { View, Image, Text, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { OutlinedTextField } from 'react-native-material-textfield';
import { showMessage } from 'react-native-flash-message';
import HeaderWhite from '../../components/Header/HeaderWhite.js';
import DatePickerModal from '../../components/DatePickerModal';
import styles from '../../css/commons';
import moment from 'moment';
import api from '../../api';
import lang from '../../lang';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const windowWidth = Dimensions.get('window').width;

class AddCard extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            isic_cards: {},
            cardNumber: '',
            birthdate: new Date(),
            birthdateText: '',
            showBirthdatePicker: false,
            cardPreview: null,
            cardPreviewWidth: 355,
            cardPreviewHeight: 224,
        }
    }
    
    componentDidMount() {
        AsyncStorage.getItem('isic_cards')
        .then(isic_cards => {
            if (!isic_cards) return;
            isic_cards = JSON.parse(isic_cards);
            if (!isic_cards) return;
            this.setState({isic_cards: isic_cards});
        })
        .catch(e => {})
    }

    onDateChange(date) {
        this.setState({
            birthdate: date,
            birthdateText: moment(date).format('Y-MM-DD'),
        });
        this.onCardChange(this.state.cardNumber);
    }
    
    onCardChange(value) {
        value = (''+value).trim();
        if (value.length >= 14) {
            this.state.loading = true;
            api.post('/user/isic-card', {
                card_number: value,
                birthdate:   moment(this.state.birthdate).format('Y-MM-DD'),
            }).then(response => {
                this.state.loading = false;
                if (response.data.success) {
                    if (response.data.cards && response.data.cards.length > 0 && response.data.cards[0].length > 0) {
                        this.state.loading = true;
                        this.state.cardPreview = response.data.cards[0][0];
                        Image.getSize(this.state.cardPreview, (width, height) => {
                            this.setState({cardPreviewWidth: width, cardPreviewHeight: height});
                        });
                    }
                }
                this.forceUpdate();
            }).catch(() => {
            });
        }
        this.state.cardPreview = null;
        this.setState({cardNumber: value});
    }
    
    saveCard() {
        api.post('/user/isic-card', {
            card_number: this.state.cardNumber,
            birthdate:   moment(this.state.birthdate).format('Y-MM-DD'),
        }).then(response => {
            if (response.data.success) {
                this.state.isic_cards[response.data.number] = {
                    number: response.data.number,
                    status: response.data.status,
                    expires_at: response.data.expires_at,
                    cards: response.data.cards,
                };
                AsyncStorage.setItem('isic_cards', JSON.stringify(this.state.isic_cards)).then(() => {
                    this.props.navigation.goBack();
                    showMessage({type: 'success', message: lang.get('saved', 'Saved !')});
                });
            } else {
                showMessage({type: 'danger', message: response.data.error});
            }
        }).catch(response => {
            showMessage({type: 'danger', message: lang.get('error-unknown', 'Error')});
        });
    }
    
    openDateModal() {
        if (this.datePickerModalRef) this.datePickerModalRef.open();
        this.setState({showBirthdatePicker: true});
    }
    
    datePickerModalRef = null;
    render() {
        const { cardPreview, cardPreviewWidth, cardPreviewHeight } = this.state;
        return (
            <View style={{width:'100%',height:'100%'}}>
                <View style={styles.whiteHeaderContainer}>
                    <HeaderWhite parentProps={this.props} />
                </View>
                <ScrollView style={{flex:1,background: '#ffffff'}} contentContainerStyle={{flexGrow: 1, justifyContent: 'space-between', padding:0}}>
                    <View style={{flex:1,backgroundColor:'white', paddingBottom:0}}>
                        <View style={[styles.container,styles.dashboardContainer]}>
                            
                            <View style={[styles.dashboardInside, {flex:1, justifyContent: 'space-between'}]}>
                                
                                <View style={styles.inputContainer}>
                                    <OutlinedTextField
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
                                        label={lang.get('isic-card-card-number', 'Card number')}
                                        lineType={'none'}
                                        autoCapitalize='characters'
                                        onChangeText={value => this.onCardChange(value)}
                                        value={this.state.cardNumber}
                                    />
                                </View>
                                
                                <TouchableWithoutFeedback
                                    style={[styles.inputContainer, {position: 'relative', paddingTop: 10}]}
                                    onPress={() => this.openDateModal()}
                                >
                                    <View style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2}}></View>
                                    <OutlinedTextField
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
                                        label={lang.get('isic-card-birthdate', 'Birthdate')}
                                        lineType={'none'}
                                        value={this.state.birthdateText}
                                        key={this.state.birthdateText}
                                    />
                                </TouchableWithoutFeedback>
                                <DatePickerModal
                                    ref={ref => this.datePickerModalRef = ref}
                                    value={this.state.birthdate}
                                    onChange={(date) => this.onDateChange(date)}
                                />
                                
                                <View style={[styles.imageCard]}>
                                    {this.state.loading ? (
                                        <View style={{width: '100%', height:cardPreviewHeight*((windowWidth-42)/cardPreviewWidth), alignItems: 'center', justifyContent: 'center', position:'absolute', top:0, left:0}}>
                                            <ActivityIndicator size="large" color="#2E67B2" style={{transform: [{scale: 2}]}} />
                                        </View>
                                    ) :null}
                                    <Image
                                        style={{width: '100%', height:cardPreviewHeight*((windowWidth-42)/cardPreviewWidth), opacity: cardPreview? 1: 0.4}}
                                        source={cardPreview ? {uri: cardPreview} : require('../../images/card.png')}
                                        resizeMode="cover"
                                        onLoadEnd={() => this.setState({loading: false})}
                                    />
                                </View>
                                
                                <TouchableOpacity onPress={() => this.saveCard()} style={styles.addCard}>
                                    <Text style={styles.addCardText}>{lang.get('activation-box-save-button', 'Save')}</Text>
                                </TouchableOpacity>
                                
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        )
    }
}

export default AddCard;
