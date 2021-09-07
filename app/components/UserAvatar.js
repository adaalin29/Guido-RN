import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { showMessage } from 'react-native-flash-message';
import EditIcon from '../images/edit.svg';
import styles from '../css/commons';
import api from '../api';
import lang from '../lang';

class UserAvatar extends Component {
    
    handleChoosePhoto() {
        ImagePicker.showImagePicker({
            title: lang.get('choose-profile-pic', 'Choose your profile picture'),
            mediaType: 'photo',
            quality: 0.8,
            noData: true,
            storageOptions: {
                skipBackup: true,
                cameraRoll: false,
                privateDirectory: true,
                waitUntilSaved: true,
                path: 'Guido',
            },
        }, response => {
            if (response.didCancel) return;
            if (response.uri) {
                let auth = api.oauth.getAuth();
                auth.user.avatar = response.uri;
                api.oauth.updateAuth(auth);
                this.forceUpdate();
            } else {
                let notification = {
                    type: 'warning',
                    message: lang.get('profile-pic-error', 'Error! Please try again later'),
                }
                if (response.error) {
                    notification.description = response.error;
                    console.log('imagepicker error', response.error);
                }
                showMessage(notification);
            }
        });
    }
    
    
    render() {
        const auth = api.oauth.getAuth();
        return (
            <View style={{position:'absolute',width:100,alignSelf:'center',top:-50, zIndex: 100}}>
                
                <View style={{width:100, height:100, borderRadius:100, borderWidth:3, borderColor:"#FFFFFF", zIndex:10}}>
                    <Image
                        style={{width:'100%', height:'100%', borderRadius:50, backgroundColor: '#ffffff', zIndex:11}}
                        source={auth.user && auth.user.avatar ? {uri: auth.user.avatar} : require('../images/user.png')}
                        resizeMode="cover"
                    />
                </View>
                
                <TouchableOpacity onPress={()=>this.handleChoosePhoto()} style={styles.avatarEditBtn} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
                    <EditIcon width={20} height={20} />
                </TouchableOpacity>
                
            </View>
        );
    }
}

export default UserAvatar;
