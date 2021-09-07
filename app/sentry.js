import * as Sentry from '@sentry/react-native';
import AsyncStorage from '@react-native-community/async-storage';
import config from './config';

const sentry = {
    
    init() {
        if (!Sentry) return;
        
        Sentry.init({
            dsn: 'https://bdf1d49d4a124ae0a6498ca182ac5a43@o78958.ingest.sentry.io/188401',
            enableAutoSessionTracking: true,
            release: config.app.version,
            environment: config.services.api.environment,
        });
        Sentry.setContext('App-Config', {
            url: config.services.api.endpoint,
        });
        
        this.updateTags();
    },
    
    updateTags() {
        if (!Sentry) return;
        
        AsyncStorage.getItem('activation_code').then(activationCode => {
            if (!activationCode) return;
            Sentry.setTag('activation_code', activationCode);
        });
        
        AsyncStorage.getItem('city').then(city => {
            if (!city) return;
            city = JSON.parse(city);
            if (!city) return;
            Sentry.setTag('city.id', city.city_id);
            Sentry.setTag('city.name', city.name);
        });
    }
    
};

export default sentry;
