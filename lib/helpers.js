const crypto = require('crypto');
const config = require('./config');
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

module.exports = helpers;
