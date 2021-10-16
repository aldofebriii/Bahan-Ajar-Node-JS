const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const helpers = {};
const querystring = require('querystring');

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
    phone = typeof(phone) === 'string' ? phone.trim().length >= 10 ? phone.trim() : false : false;
    msg = typeof(msg) === 'string' ? msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false : false;

    if(!phone || !msg){
        return cb(true);
    };

    //Message payload to send
    const messagePayload = {
        From: config.twilio.fromPhone,
        To: '+1'+phone,
        Body: msg
    };

    //String payload @update from deprereacted querystring object into using a URLSearchParams
    const strPayload = new URLSearchParams(messagePayload).toString();

    const req = https.request({
        protocol: "https:",
        hostname:"api.twilio.com",
        path: `2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(strPayload)
        },
        auth: `${config.twilio.accountSid}:${config.twilio.authToken}`
    }, function(res){
        let str;
        if(res.statusCode === 200 || res.statusCode === 201){
            res.on('data', function(chunks){
                str += chunks.toString();
            });

            res.on('end', function(){
                console.log(str);
                cb(false);
            });

            res.on('error', function(err){
                cb(true);
            });
        } else {
            cb('Status code returned was '+ res.statusCode);
        };
    });

    req.write(strPayload);
    req.end();

};

module.exports = helpers;
