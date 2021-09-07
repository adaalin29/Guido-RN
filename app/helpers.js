import api from './api';
import moment from 'moment';

var helpers = {};

helpers.getFreeVouchers = (city_id) => {
    return api.post('/recommended-vouchers', {
        city_id: city_id,
        activation_code: null,
    });
};

helpers.getVoucherUsageInfo = (voucher) => {
    var usageInfo = {
        type: '', // 'unlimited', 'peruser', 'total', 'date'
        perUser: 0, // total per user usages
        total: 0, // total usages left
        date: {
            object: null, // js Date object
            formated: '' // formatted expires on date
        },
        expired: false,
        canUse: false // if you can use it or not
    };
    usageInfo.type = 'unlimited';
    usageInfo.date.object = new Date(voucher.valid_until_date.replace(' ','T'));
    if (usageInfo.date.object.getFullYear() === 2099) {
        if (voucher.number_per_person != '0') {
            usageInfo.type = 'peruser';
        }
        if (voucher.total != '0') {
            usageInfo.type = 'total';
        }
    } else {
        usageInfo.type = 'date';
    }
    if (usageInfo.type === 'unlimited') {
        usageInfo.canUse = voucher.canUse;
    }
    if (usageInfo.type === 'peruser') {
        usageInfo.perUser = parseInt(voucher.number_per_person, 10);
        usageInfo.canUse = voucher.canUse;
    }
    if (usageInfo.type === 'total') {
        usageInfo.total = parseInt(voucher.total, 10);
        usageInfo.canUse = voucher.canUse;
    }
    if (usageInfo.type === 'date') {
        usageInfo.date.formated = moment(usageInfo.date.object).format("DD/MM/YYYY");
        usageInfo.expired = (new Date().getTime() > usageInfo.date.object.getTime());
        usageInfo.canUse = voucher.canUse;
    }
    return usageInfo;
};

helpers.slug = (str) => {
    str = str.replace(/^\s+|\s+$/g, '');
    str = str.toLowerCase();
    // remove accents
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    str = str.replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    return str;
}

export default helpers;