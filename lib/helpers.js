const crypto = require('crypto');
const config = require('./config');
const client = require('twilio-node')
const helpers = {};

//SHA256 HASH
helpers.hash = function(str){
    if(typeof str !== 'string' && str.length < 0){
        return false;
    };
    //HMAC = HASHBASED MESSAGE AUTHENTICATION CODE
    const hmac = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    //Digest merupakan represent dari data yang dihas bisa berbentuk librrary(default), hex atau base64
    return hmac;
};

helpers.JSONParserCatch = function(str){
    try {
      const parsedStr = JSON.parse(str);
      return parsedStr;
    } catch(err) {
        return {};
    };
};

helpers.createRandomString = function(length){
    let randomString = '';
    const randomChar = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for(let i = 0; i < length; i++){
        randomString += randomChar[Math.floor(Math.random() * randomChar.length)];
    };
    return randomString
};

helpers.sendTwilionSms = function(phone, msg, cb){
    //Validate Parameter
    const phone = typeof(phone) === 'string' ? phone.trim().length >= 10 && phone.trim().length <= 12 ? phone.trim() : false : false;
    const msg = typeof(msg) === 'string' ? msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false : false;

    if(!phone || !msg){
        return cb(true);
    };



};

module.exports = helpers;
