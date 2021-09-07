import api from './api';

var settings = {};
var settingsData = {};

settings.get = (key, defaultText) => {
    return settingsData[key] || defaultText;
};

settings.fetch = () => {
    return new Promise((resolve, reject) => {
        api.get('/settings').then(response => {
            if (response.data) {
                settingsData = {...settingsData, ...response.data};
                resolve(response.data);
            }
        });
    });
};

export default settings;