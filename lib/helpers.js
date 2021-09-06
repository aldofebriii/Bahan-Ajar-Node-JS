const crypto = require('crypto');
const config = require('./config');
const helpers = {};
const client = require('twilio')(config.accountSid, config.authToken);

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
    //Validate Parameter, number fomat : +6281378449352
    phone = typeof(phone) === 'string' ? phone.trim().length >= 12 && phone.trim().length <= 14 ? phone.trim() : false : false;
    msg = typeof(msg) === 'string' ? msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false : false;

    if(!phone || !msg){
        return cb(true);
    };

    client.messages.create({
        from: 'whatsapp:+6281378449352',
        body: 'Hallo Aji',
        to: 'whatsapp:+6285327316051'
    })
    .then(message  => cb(false));

};

module.exports = helpers;
