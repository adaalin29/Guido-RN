import React, { Component } from 'react';
import { View, Text, Dimensions, Modal, TouchableHighlight, StyleSheet, Animated, Easing, TouchableWithoutFeedback } from 'react-native';
import DatePicker from 'react-native-date-picker';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

class DatePickerModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            date: new Date(),
        };
        if (props.value) this.state.date = props.value;
        if (props.show) this.state.show = props.show;
    }
    componentDidMount(){
        if (this.props.show) this.open();
    }
    
    open() {
        this.setState({show: true});
        Animated.timing(this.animVal, {
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
            duration: 250,
            toValue: 1,
        }).start();
    }
    
    close() {
        Animated.timing(this.animVal, {
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
            duration: 250,
            toValue: 0,
        }).start(() => {
            this.setState({show: false});
            if (this.props.onClose) this.props.onClose();
        });
    }
    
    onDateChange(value) {
        this.setState({date: value});
    }
    
    confirm() {
        if (this.props.onChange) this.props.onChange(this.state.date);
        this.close();
    }
    
    cancel() {
        let date = new Date();
        if (this.props.value) date = this.props.value;
        this.setState({date: date});
        this.close();
    }
    
    animVal = new Animated.Value(0);
    render() {
        const backdropAnimatedStyle = {
            opacity: this.animVal.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.4],
            }),
        };
        const contentAnimatedStyle = {transform: [{
            translateY: this.animVal.interpolate({
                inputRange: [0, 1],
                outputRange: [deviceHeight, 0],
                extrapolate: 'clamp',
            }),
        }]};
        return (
            <>
                <Modal
                    animationType="none"
                    transparent={true}
                    visible={this.state.show}
                    onRequestClose={() => this.cancel()}
                >
                    <TouchableWithoutFeedback onPress={() => this.cancel()}>
                        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
                    </TouchableWithoutFeedback>
                    
                    {this.state.show && (
                        <Animated.View
                            style={[styles.content, contentAnimatedStyle]}
                            pointerEvents="box-none"
                        >
                            <View style={{flex: 1, justifyContent: 'flex-end', padding: 10, marginBottom: 20}}>
                                <View style={{borderRadius: 13, marginBottom: 8, overflow: 'hidden', backgroundColor:'white', alignItems: 'center'}}>
                                    <DatePicker
                                        mode="date"
                                        androidVariant="iosClone"
                                        date={this.state.date}
                                        onDateChange={(date) => this.onDateChange(date)}
                                        textColor="#000000"
                                        style={{width: deviceWidth-20}}
                                    />
                                    <TouchableHighlight
                                        style={{borderColor: '#d5d5d5', borderTopWidth: StyleSheet.hairlineWidth, height: 57, width: '100%', justifyContent: 'center', backgroundColor: 'transparent'}}
                                        underlayColor={'#ebebeb'}
                                        onPress={() => this.confirm()}
                                        accessible={true}
                                        accessibilityRole="button"
                                        accessibilityLabel={'Confirm'}
                                    >
                                        <Text style={{textAlign: 'center', color: '#007ff9', fontSize: 20, backgroundColor: 'transparent'}}>
                                            Confirm
                                        </Text>
                                    </TouchableHighlight>
                                </View>
                                <TouchableHighlight
                                    style={{borderRadius: 13, height: 57, justifyContent: 'center', backgroundColor: 'white'}}
                                    underlayColor={'#ebebeb'}
                                    onPress={() => this.cancel()}
                                    accessible={true}
                                    accessibilityRole="button"
                                    accessibilityLabel={'Cancel'}
                                >
                                    <Text style={{textAlign: 'center', color: '#007ff9', fontSize: 20, fontWeight: '600', backgroundColor: 'transparent'}}>
                                        Cancel
                                    </Text>
                                </TouchableHighlight>
                            </View>
                        </Animated.View>
                    )}
                </Modal>
            </>
        );
    }
}

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: deviceWidth,
        height: deviceHeight,
        backgroundColor: '#000',
        opacity: 0,
    },
    content: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        justifyContent: 'flex-end',
    },
});

export default DatePickerModal;
