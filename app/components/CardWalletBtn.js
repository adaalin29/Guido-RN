import React, { Component } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import styles from '../css/commons';
import Wallet from '../images/wallet.svg';

class CardWalletBtn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isic_cards: [],
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
        AsyncStorage.getItem('isic_cards')
        .then(isic_cards => {
            if (!isic_cards) return;
            isic_cards = JSON.parse(isic_cards);
            if (!isic_cards) return;
            this.setState({isic_cards: this.processIsicCards(isic_cards)});
        })
        .catch(e => {})
    }
    
    processIsicCards(cards) {
        let newCards = [];
        Object.values(cards).map(card => {
            if (card.cards && card.cards.length > 0) {
                card.cards.map(cardItem => {
                    if (cardItem.length > 0) {
                        newCards.push(card);
                    }
                });
            }
        });
        return newCards;
    }
    
    render() {
        let cardNumber = 0;
        if (this.state.isic_cards) cardNumber = this.state.isic_cards.length;
        const { navigate } = this.props.navigation;
        
        return (
            <TouchableOpacity onPress={() => navigate('MyCards')} style={styles.voucher}>
                <View style={styles.vouchersInside}>
                    <Text style={styles.voucherText}>{cardNumber}</Text>
                </View>
                <Wallet width={45} height={40} />
            </TouchableOpacity>
        );
    }
};

export default CardWalletBtn;
