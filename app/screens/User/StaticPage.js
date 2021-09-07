import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import HTMLView from 'react-native-htmlview';
import HeaderWhite from '../../components/Header/HeaderWhite.js';
import styles from '../../css/commons';
import api from '../../api';
import lang from '../../lang';

class StaticPage extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            title: '',
            html: null,
        }
    }
    
    componentDidMount() {
        let pageSlug = null;
        if (this.props.route.params && this.props.route.params.page) {
            pageSlug = this.props.route.params.page;
        }
        if (!pageSlug) return;
        if (pageSlug == 'app-gdpr')  this.setState({title: lang.get('profile-privacy', 'Privacy')})
        if (pageSlug == 'app-about') this.setState({title: lang.get('profile-about', 'About GUIDO')})
        api.get('/pages/get/' + pageSlug + '-' + lang.activeLang).then(response => {
            if (response.data.success) {
                this.setState({loading: false, html: response.data.content});
            } else {
                this.setState({loading: false});
            }
        }).catch(response => {
            this.setState({loading: false});
        });
    }
    
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <HeaderWhite parentProps={this.props} title={this.state.title} />
                </View>
                <ScrollView style={styles.homeScrollView}>
                    
                    {this.state.loading ? (
                        <ActivityIndicator size="large" color="#2E67B2" style={{marginTop:120, transform: [{ scale: 2 }]}} />
                    ) : this.state.html ? (
                        <View style={{paddingVertical: 20, paddingHorizontal: 10}}>
                            <HTMLView
                                value={this.state.html}
                                imagesMaxWidth={Dimensions.get('window').width}
                                stylesheet={viewStyles}
                                addLineBreaks={false}
                            />
                        </View>
                    ) : null}
                    
                </ScrollView>
            </View>
        )
    }
}

const viewStyles = StyleSheet.create({
    p: {
        padding: 0,
        margin: 0,
        marginVertical: -10,
        fontFamily:'NunitoSans-Regular',
        fontSize: 14,
        lineHeight: 18,
    },
    br: {
        padding: 0,
        margin: 0,
        height: 0,
    },
});

export default StaticPage;
