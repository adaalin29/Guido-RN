import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView} from 'react-native';
import TagButton from '../../components/TagButton.js';
import styles from '../../css/commons';
import Logo from '../../images/logo.svg';
import api from '../../api';
import lang from '../../lang';

class SelectCategories extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tags: [],
        }
    }
    
    componentDidMount() {
        api.get('/tags').then(response => {
            this.setState({tags: response.data.tags});
        });
    }
    
    onToggle(item, value) {
        item.value = value;
    }
    
    continue() {
        let selectedTags = [];
        this.state.tags.map(item => {
            if (item.value) selectedTags.push(item.tag_id);
        })
        api.post('/user/tags', {tags: selectedTags}).then(response => {
            if (response.data.success == true) {
                let auth = api.oauth.getAuth();
                auth.user.tags = response.data.tags;
                api.oauth.updateAuth(auth);
                this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
            }
        })
    }
    
    render() {
        return (
            <View style={[styles.container,styles.containerFlex]}>
                <Logo width={99} height={36} style={{marginTop: 30}} />
                <Text style={[styles.selectCategoriesText]}>
                    {lang.get('welcome3-page-header', 'Tell us what you like, and we’ll select the bestvouchers for you.')}
                </Text>
                <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', marginTop: 10}}>
                    <View style={{backgroundColor: '#B9B9B9', width: 8, height: 8, borderRadius: 8, marginLeft: 5, marginRight: 5, marginTop: 5, marginBottom: 5}} />
                    <View style={{backgroundColor: '#B9B9B9', width: 8, height: 8, borderRadius: 8, marginLeft: 5, marginRight: 5, marginTop: 5, marginBottom: 5}} />
                    <View style={{backgroundColor: '#2E67B2', width: 12, height: 12, borderRadius: 12, marginLeft: 5, marginRight: 5, marginTop: 5, marginBottom: 5}} />
                </View>
                <ScrollView style={{marginTop:20, marginBottom:0}} contentContainerStyle={styles.selectCategoriesContainer}>
                    {this.state.tags.map(item => {
                        if (item.in_app != 1) return false;
                        lang.translateModel(item, ['name']);
                        return (
                            <TagButton
                                key={item.id}
                                text={item.name}
                                onChange={(value) => this.onToggle(item, value)}
                            />
                        );
                    })}
                </ScrollView>
                <TouchableOpacity onPress={() => this.continue()} style={[styles.continueButton, {marginBottom:20}]}>
                    <Text style={styles.continueButtonText}>{lang.get('welcome3-continue-button', 'Continue')}</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

export default SelectCategories;
