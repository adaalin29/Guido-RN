import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image} from 'react-native';
import moment from 'moment';
import HeaderWhite from '../../components/Header/HeaderWhite.js';
import CardFlip from 'react-native-card-flip';
import BackBlack from '../../images/backBlack.svg';
import Change from '../../images/change.svg';
import styles from '../../css/commons';
import lang from '../../lang';

class ViewCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timestamp: '',
            card: {},
            selectedCard: 0,
        }
        if (props.route.params && props.route.params.card) {
            this.state.card = props.route.params.card;
        }
    }
    
    isMountedComponent = false
    dateTimer = null
    componentDidMount() {
        this.isMountedComponent = true;
        this.updateTimer();
        this.dateTimer = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }
    componentWillUnmount() {
        this.isMountedComponent = false;
        if (this.dateTimer) clearInterval(this.dateTimer);
    }
    
    updateTimer() {
        if (!this.isMountedComponent) return;
        this.setState({timestamp: moment().format('DD.MM.YYYY hh:mm:ss')});
    }
    
    switchCard(index) {
        const { card } = this.state;
        if (card.cards && card.cards.length > 0 && card.cards[index].length > 0) {
            this.setState({selectedCard: index});
        }
    }
    
    flipCard() {
        if (this.cardRef) this.cardRef.flip();
    }
    
    cardRef = null
    render() {
        const { card, selectedCard } = this.state;
        let cardImages = [];
        if (card.cards && card.cards.length > 0 && card.cards[selectedCard].length > 0) {
            cardImages = card.cards[selectedCard];
        }
        return (
            <View style={{flex:1,width:'100%',height:'100%'}}>
                <View style={{flex:1,width:'100%',height:'100%',backgroundColor:'white'}}>
                    
                    <View style={styles.cardStatus}>
                        <View style={[styles.cardStatusBubble, {backgroundColor:this.state.card.status=='VALID'?'#22BB44':'#FF0000'}]}></View>
                        <Text style={styles.cardStatusText}>{this.state.card.status}</Text>
                        <Text style={styles.cardStatusTime}>{this.state.timestamp}</Text>
                    </View>
                    
                    <CardFlip style={styles.cardFlip} ref={card => this.cardRef = card}>
                        {cardImages.map((cardImg, cardIndex) => (
                            <TouchableOpacity style={styles.cardImageSide} onPress={() => this.flipCard()}>
                                {cardIndex == 0 ? <Image style={styles.cardImageOverlay} source={require('../../images/isic-overlay.gif')} resizeMode='contain' /> : null}
                                <Image style={styles.cardImageImg} source={{uri: cardImg+'?rotate=true'}} resizeMode='contain' />
                            </TouchableOpacity>
                        ))}
                    </CardFlip>
                    {card.cards && card.cards.length > 1 ? (
                        <View style={[styles.cardSwitch, {height:card.cards.length*40, transform: [{translateY: -card.cards.length*20}]}]}>
                            {card.cards.map((item, index) => (
                                <TouchableOpacity style={styles.cardSwitchBtn} onPress={() => this.switchCard(index)}>
                                    <View style={[styles.cardSwitchBullet, {backgroundColor: selectedCard==index?'#2E67B2':'#eeeeee'}]}></View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) :null}
                    
                    <View style={styles.myCardBottomActions}>
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={styles.myCardBottomAction}>
                            <View style={{width:25,height:25,alignItems:'center'}}><BackBlack width={13} height={25} /></View>
                            <Text style={styles.myCardBottomActionText}>{lang.get('isic-card-go-back', 'Go back')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.flipCard()} style={styles.myCardBottomAction}>
                            <View style={{width:30,height:25,alignItems:'center'}}><Change fill="black" width={25} height={25} /></View>
                            <Text style={styles.myCardBottomActionText}>{lang.get('isic-card-turn-card', 'Turn card')}</Text>
                        </TouchableOpacity>
                    </View>
                    
                </View>
            </View>
        )
    }
}

export default ViewCard;
