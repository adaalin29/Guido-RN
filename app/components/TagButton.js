import React, { Component } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import styles from '../css/commons';

class TagButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pressed: false,
        };
        if (props.value) this.state.pressed = props.value;
    }
    
    colors = {
        off: {
            backgroundColor: '#FFFFFF',
            textColor: '#2E67B2',
            borderColor: '#2E67B2',
        },
        on: {
            backgroundColor: '#2E67B2',
            textColor: '#FFFFFF',
            borderColor: '#2E67B2',
        },
    }
    
    toggle() {
        let newState = this.state.pressed ? false : true;
        this.setState({pressed: newState});
        if (this.props.onChange) this.props.onChange(newState);
    }
    
    render() {
        const colors = this.state.pressed ? this.colors.on : this.colors.off;
        let text = '';
        if (this.props.text) {
            text = this.props.text.charAt(0).toUpperCase() + this.props.text.slice(1);
        }
        return (
            <View style={this.props.styleContainer}>
                <TouchableOpacity
                    onPress={() => this.toggle()}
                    style={{
                        borderColor: colors.borderColor,
                        backgroundColor: colors.backgroundColor,
                        marginRight:5,
                        borderWidth: 1,
                        borderRadius:16,
                        marginBottom:10,
                        justifyContent:'center',
                        alignItems:'center',
                        flexDirection:'row',
                        paddingLeft:10,
                        paddingRight:10,
                        paddingTop:5,
                        paddingBottom:5,
                        height:30,
                    }}
                >
                    <Text style={[styles.tagText, {color: colors.textColor}]}>{text}</Text>
                </TouchableOpacity >
            </View>
        )
    }
};

export default TagButton;
