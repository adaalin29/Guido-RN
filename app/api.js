import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import { showMessage } from 'react-native-flash-message';
import config from './config';
import lang from './lang';

var api = {};
var apiAuth = { logged: false };
var newTokenInProgress = false;
var apiUrl = config.services.api.endpoint

api.post = (url, data) => {
    return api.request('POST', url, data);
};

api.get = (url, data) => {
    return api.request('GET', url, data);
};

// Prepare a request to send
api.request = (method, url, data) => {
    return new Promise((resolve, reject) => {
        method = method.toUpperCase();
        url = apiUrl + url;
        let headers = {};
        if (apiAuth && apiAuth.logged && apiAuth.token) {
            headers = api.oauth.authorizationHeader(apiAuth.token);
        }
        headers['Content-Type'] = 'application/json';
        headers['APP-Version'] = config.app.version;
        headers['APP-Language'] = lang.activeLang;
        
        api.sendRequest(method, url, headers, data)
        .then(response => {
            resolve(response);
        })
        .catch(response => {
            if (response.status === 401) {
                // Token expired. Refresh the token
                if (newTokenInProgress === true) {
                    reject(response);
                    return false;
                }
                newTokenInProgress = true;
                api.oauth.refreshToken(apiAuth)
                .then(auth => {
                    // Refresh success !
                    // try the current request again
                    newTokenInProgress = false;
                    headers = {};
                    if (auth.logged && auth.token) {
                        headers = api.oauth.authorizationHeader(auth.token);
                    }
                    headers['Content-Type'] = 'application/json';
                    headers['APP-Version'] = config.app.version;
                    headers['APP-Language'] = lang.activeLang;
                    api.sendRequest(method, url, headers, data)
                    .then(response => resolve(response))
                    .catch(response => reject(response));
                })
                .catch(response => {
                    // Could not refresh. Could be network or server error, or expired refresh token
                    newTokenInProgress = false;
                    api.oauth.updateAuth({ logged: false });
                    reject(response);
                });
            } else {
                reject(response);
            }
        });
    });
};

// Send the actual http request
api.sendRequest = (method, url, headers, data) => {
    return new Promise((resolve, reject) => {
        let options = {
            method: method,
            url: url,
            headers: headers,
        };
        if (method == 'GET') options.params = data;
        else options.data = data;
        
        axios(options)
        .then(response => {
            resolve(response);
        })
        .catch(({ response }) => {
            resolve(response);
        });
    });
};

// Oauth2 implementation functions
api.oauth = {};

// Create the authorization header for a request
api.oauth.authorizationHeader = token => {
    return { Authorization: token.token_type + ' ' + token.access_token };
};

// Update apiAuth var
api.oauth.updateAuth = auth => {
    apiAuth = auth;
    AsyncStorage.setItem('auth', JSON.stringify(auth));
};
//get auth
api.oauth.getAuth = () => {
    return apiAuth;
};

// When we get a new token we need to calculate the time when it will expire
api.oauth.processNewToken = token => {
    let token_expires_in = token.expires_in || 0;
    token.issued_at = Math.floor(new Date().getTime() / 1000);
    token.expires_at = token.issued_at + token_expires_in;
    return token;
};

// Check if provided token's timestamp is expired
api.oauth.verifyIfTokenExpired = token => {
    let time_now = Math.floor(new Date().getTime() / 1000);
    let token_expiration = token.expires_at || 0;
    return time_now > token_expiration ? true : false;
};

// Check existing token(s)
api.oauth.check = () => {
    return new Promise((resolve, reject) => {
        let returnNotLogged = () => {
            api.oauth.updateAuth({ logged: false });
            resolve(apiAuth);
        };
        let returnRefreshToken = auth => {
            if (newTokenInProgress === true) {
                reject(auth);
                return false;
            }
            newTokenInProgress = true;
            api.oauth.refreshToken(auth)
            .then(response => {
                // Refresh success !
                newTokenInProgress = false;
                resolve(response);
            })
            .catch(response => {
                // Could not refresh. Could be network or server error, or expired refresh token
                if (response.message) {
                    showMessage({type: 'danger', message: response.message});
                }
                newTokenInProgress = false;
                return returnNotLogged();
            });
        };
        
        // Get authentication data from the local database
        AsyncStorage.getItem('auth').then(authString => {
            let auth = JSON.parse(authString);
            if (auth != null && auth && auth.logged === true) {
                // I was logged in. Let's check if our token is expired
                if (api.oauth.verifyIfTokenExpired(auth.token) === true) {
                    // Token expired. Refresh the token
                    return returnRefreshToken(auth);
                } else {
                    // Token is not expired, but check it on the server
                    api.oauth.checkRemote(auth.token)
                    .then(response => {
                        if (response.logged === true) {
                            // Token is valid. Update auth data and return
                            let user = auth.user ? auth.user : {};
                            api.oauth.updateAuth({
                                logged: true,
                                user: { ...user, ...response.user },
                                token: auth.token,
                            });
                            resolve(apiAuth);
                        } else {
                            // Server says token is not valid. Can be expired. Refresh token
                            return returnRefreshToken(auth);
                        }
                    })
                    .catch(response => {
                        // Could not check the token. Could be network or server error
                        resolve(auth);
                    });
                }
            } else {
                // I was not logged in
                return returnNotLogged();
            }
        }).catch(error => {
            // Could not access local database, or maybe the db is clean
            return returnNotLogged();
        });
    });
};

// Refresh access token if possible
api.oauth.refreshToken = auth => {
    return new Promise((resolve, reject) => {
        api.oauth.refreshRemote(auth.token.refresh_token)
        .then(response => {
            if (response.success === true) {
                // Got a fresh new token. Save it and return
                let new_processed_token = api.oauth.processNewToken(response.token);
                api.oauth.updateAuth({
                    logged: true,
                    user: response.user,
                    token: new_processed_token,
                });
                resolve(apiAuth);
            } else {
                // Refresh Token is expired.
                reject(response);
            }
        })
        .catch(response => {
            // Could not refresh. Could be network or server error
            reject(response);
        });
    });
};

// Check existing token on the remote api
api.oauth.checkRemote = token => {
    return new Promise((resolve, reject) => {
        api.sendRequest(
            'GET',
            apiUrl + '/user/check',
            api.oauth.authorizationHeader(token),
            {}
        )
        .then(response => {
            resolve(response.data);
        })
        .catch(response => {
            reject(response);
        });
    });
};

// Refresh expired token
api.oauth.refreshRemote = refresh_token => {
    return new Promise((resolve, reject) => {
        api.sendRequest(
            'POST',
            apiUrl + '/user/refresh',
            {},
            { refresh_token: refresh_token }
        )
        .then(response => {
            resolve(response.data);
        })
        .catch(response => {
            reject(response);
        });
    });
};

// IMG CDN script
api.img = (query, image) => {
    if (!image) return '';
    let queryArray = {};
    query.split(';').map(item => {
        if (item.indexOf(':') === -1) return;
        item = item.split(':');
        queryArray[item[0].trim()] = item[1].trim();
    });
    let imageWidth = null;
    if (queryArray.hasOwnProperty('width') && queryArray.width !== 'auto') {
        imageWidth = parseInt(queryArray.width);
    }
    let imageHeight = null;
    if (queryArray.hasOwnProperty('height') && queryArray.height !== 'auto') {
        imageHeight = parseInt(queryArray.height);
    }
    if (!imageWidth && !imageHeight) return image;
    
    //  CDN method - statically.io
    // let staticallyUrl = 'https://cdn.statically.io/img/' + image.replace(/https?\:\/\//i, '') + '?k';
    // if (imageWidth)  staticallyUrl += '&w=' + imageWidth;
    // if (imageHeight) staticallyUrl += '&h=' + imageHeight;
    // return staticallyUrl;
    
    // --- CDN method - images.weserv.nl
    let cdnurl = 'https://images.weserv.nl/?l=3&q=100&';
    if (imageWidth)  cdnurl += 'w=' + imageWidth + '&';
    if (imageHeight) cdnurl += 'h=' + imageHeight + '&';
    cdnurl += 'url=' + encodeURIComponent(image);
    cdnurl += '&errorredirect=' + encodeURIComponent(image);
    return cdnurl;
    
    // --- thumb.php old method
    // let thumb = 'thumb.php?'; // add base url in front!
    // if (imageWidth)  thumb += 'w=' + imageWidth + '&';
    // if (imageHeight) thumb += 'h=' + imageHeight + '&';
    // thumb += 'action=zc&border=none&';
    // thumb += 'src=image';
    // return thumb;
};

export default api;