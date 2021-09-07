import React, { Component } from 'react';
import { View, Image, Text, ImageBackground, TouchableOpacity, Linking, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import { isOnline } from '../../components/NetworkPopup';
import Swiper from 'react-native-swiper';
import UserAvatar from '../../components/UserAvatar';
import HeaderWhite from '../../components/Header/HeaderWhite.js';
import Plus from '../../images/plus.svg';
import styles from '../../css/commons';
import config from '../../config';
import api from '../../api';
import lang from '../../lang';

const windowWidth = Dimensions.get('window').width;

class MyCards extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isic_cards: {},
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
                        newCards.push({...card, ...{cards: [cardItem]}});
                    }
                });
            }
        });
        return newCards;
    }
    
    buyIsicCard() {
        Linking.openURL(config.services.api.endpoint + '/redirect-to/isic-buy-card-' + lang.activeLang);
    }
    
    render() {
        const cards = Object.values(this.state.isic_cards);
        return (
            <View style={{width:'100%',height:'100%'}}>
                <View style={styles.whiteHeaderContainer}>
                    <HeaderWhite parentProps={this.props} />
                </View>
                <ParallaxScrollView
                    backgroundSpeed={10}
                    parallaxHeaderHeight={180}
                    renderBackground={() => (
                        <View style={{ height: '100%', flex: 1, alignItems: 'center', justifyContent: 'center',paddingTop:100 }}>
                            <ImageBackground source={require('../../images/profileBackground.png')} style={{width:'100%',height:300, resizeMode:'contain'}}>
                            </ImageBackground>
                        </View>
                    )}
                >
                    <View style={{ minHeight: 100,backgroundColor:'white',borderTopLeftRadius:50,borderTopRightRadius:50,marginTop:-40,paddingBottom:60,}}>
                        <View style={[styles.container,styles.dashboardContainer]}>
                            <UserAvatar />
                            <View style={styles.dashboardInside}>
                                
                                {cards.length == 0 ? (
                                    <>
                                        <Text style={[styles.cardsTitle, {marginBottom:40}]}>
                                            {lang.get('isic-card-add-first', 'Add your first card')}
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.cardsTitle}>{lang.get('isic-card-choose-one', 'Choose your ISIC card')}</Text>
                                        <View style={styles.swiperContainer}>
                                            <Swiper
                                                key={cards.length}
                                                loadMinimalSize={2}
                                                style={styles.wrapper}
                                                loop={false}
                                                showsButtons={false}
                                                paginationStyle={{bottom:5}}
                                                activeDot={
                                                    <View style={{backgroundColor: '#DB6B5A', width: 12, height: 12, borderRadius: 12, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />
                                                }
                                            >
                                                {cards.map(card => {
                                                    return (
                                                        <MyCardSlide key={card} card={card} onPress={() => this.props.navigation.navigate('ViewCard', {card: card})} />
                                                    );
                                                })}
                                            </Swiper>
                                        </View>
                                    </>
                                )}
                                
                                {isOnline() ? (
                                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('AddCard')} style={styles.addCard}>
                                        <Plus width={16} height={16} />
                                        <Text style={styles.addCardText}>{lang.get('isic-card-add-button', 'Add a card')}</Text>
                                    </TouchableOpacity>
                                ) : null}
                                
                            </View>
                        </View>
                    </View>
                </ParallaxScrollView>
            </View>
        )
    }
}

class MyCardSlide extends Component {
    constructor(props) {
        super(props);
        this.state = {
            card: {},
            cardImage: null,
            cardWidth: 355,
            cardHeight: 224,
            refreshImage: 0,
        }
        if (props.card) {
            this.state.card = props.card;
            if (props.card.cards && props.card.cards.length > 0 && props.card.cards[0].length > 0) {
                this.state.cardImage = props.card.cards[0][0];
            }
        }
    }
    componentDidMount() {
        if (this.state.cardImage && (''+this.state.cardPreview).indexOf('.jpg') != -1) {
            Image.getSize(this.state.cardPreview, (width, height) => {
                this.setState({cardWidth: width, cardHeight: height, refreshImage: Date.now()});
            });
        }
        this.setState({refreshImage: Date.now()});
        setTimeout(() => this.setState({refreshImage: Date.now()}), 50);
    }
    render() {
        const { card, cardImage, cardWidth, cardHeight } = this.state;
        return (
            <View style={{flex: 1, width: '100%', height: '100%', justifyContent:'center', alignItems:'center'}}>
                <TouchableOpacity onPress={() => this.props.onPress(card)} style={styles.slide}>
                    <Image
                        key={this.state.refreshImage}
                        style={{width:'100%', height: cardHeight*((windowWidth-62)/cardWidth)}}
                        source={cardImage ? {uri: cardImage} : require('../../images/card.png')}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

export default MyCards;
