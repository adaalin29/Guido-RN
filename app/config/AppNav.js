import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import api from '../api';
import emitter from 'tiny-emitter/instance';
import * as Sentry from '@sentry/react-native';

import Loading from '../screens/Loading';
import Home from '../screens/Home/Home';
import StaticPage from '../screens/User/StaticPage';
import ChangeCity from '../screens/Home/ChangeCity';

// First Screens
import Welcome from '../screens/FirstScreens/Welcome';
import ActivationCode from '../screens/FirstScreens/ActivationCode';
import SelectCategories from '../screens/FirstScreens/SelectCategories';

// User
import Profile from '../screens/User/Profile';
import MyCards from '../screens/User/MyCards';
import AddCard from '../screens/User/AddCard';
import ViewCard from '../screens/User/ViewCard';

// Location
import LocationList from '../screens/Location/LocationList';
import LocationDetail from '../screens/Location/LocationDetail';

// Voucher
import VoucherList from '../screens/Voucher/VoucherList';
import VoucherDetail from '../screens/Voucher/VoucherDetail';

const Stack = createStackNavigator();
const navigationRef = React.createRef();

export function navigate(name, params) {
    navigationRef.current && navigationRef.current.navigate(name, params);
}

class AppNav extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logged: null,
        }
    }
    
    componentDidMount() {
        api.oauth.check().then(auth => {
            this.setState({logged: auth.logged});
            if (Sentry)
            if (auth.logged) {
                Sentry.setUser({
                    id:       auth.user.id,
                    username: auth.user.remoteId,
                    email:    auth.user.email,
                });
            } else {
                Sentry.configureScope(scope => scope.setUser(null));
            }
        })
        emitter.on('auth', () => {
            let auth = api.oauth.getAuth();
            this.setState({logged: auth.logged});
        });
    }
    
    render() {
        return (
            <NavigationContainer
                ref={navigationRef}
                onStateChange={() => {
                    let currentRouteName = navigationRef.current.getCurrentRoute().name;
                    emitter.emit('route-changed', currentRouteName);
                }}
            >
                <Stack.Navigator screenOptions={{
                    headerShown: false,
                    gestureEnabled: true,
                    gestureDirection: this.state.logged ? 'horizontal' : 'vertical',
                    cardStyleInterpolator: this.state.logged ? CardStyleInterpolators.forHorizontalIOS : CardStyleInterpolators.forVerticalIOS,
                }}>
                    {this.state.logged === null ? (
                        // loading user data
                        <Stack.Screen name="Loading" component={Loading} />
                    ) : this.state.logged === false ? (
                        // not logged in
                        <>
                            <Stack.Screen name="Welcome" component={Welcome} />
                        </>
                    ) : (
                        // user logged in
                        <>
                            <Stack.Screen name="Home" component={Home} />
                            <Stack.Screen name="ActivationCode" component={ActivationCode} />
                            <Stack.Screen name="SelectCategories" component={SelectCategories} />
                            <Stack.Screen name="StaticPage" component={StaticPage} />
                            <Stack.Screen name="ChangeCity" component={ChangeCity} />
                            {/* User */}
                            <Stack.Screen name="Profile" component={Profile} />
                            <Stack.Screen name="MyCards" component={MyCards} />
                            <Stack.Screen name="AddCard" component={AddCard} />
                            <Stack.Screen name="ViewCard" component={ViewCard} />
                            {/* Location */}
                            <Stack.Screen name="LocationList" component={LocationList} />
                            <Stack.Screen name="LocationDetail" component={LocationDetail} />
                            {/* Voucher */}
                            <Stack.Screen name="VoucherList" component={VoucherList} />
                            <Stack.Screen name="VoucherDetail" component={VoucherDetail} />
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        );
    }
}

export default AppNav;
