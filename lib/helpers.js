const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const fs = require('fs');
const path = require('path');
const helpers = {};

helpers.getANumber = function(){
    return 1;
};

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
        To: '+' + phone,
        Body: msg
    };
    //String payload
    const strPayload = new URLSearchParams(messagePayload).toString();
    const req = https.request({
        protocol: "https:",
        hostname:"api.twilio.com",
        path: `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(strPayload),
            "Connection": "keep-alive",
            "Accept-Encoding": "gzip, deflate, br",

        },
        auth: `${config.twilio.accountSid}:${config.twilio.authToken}`
    }, function(res){
        let str = '';
        res.on('data', function(d){
            str += d;
        });
        if(res.statusCode == 200 || res.statusCode == 201){
            cb(false);
        } else {
            cb('Status code returned was '+ res.statusCode);
        };
        res.on('end', function(){
            console.log(str);
        });
    });
    req.on('data', function(d){
        console.log(d);
    });

    req.on('error', function(err){
        console.log(err);
    });

    req.write(strPayload);
    req.end();

};

helpers.getTemplate = function(filename, data, cb){
    //Validate the filename 
    filename = typeof filename === 'string' ? filename : false;
    if(!filename){
        return cb('Filename is missing in parameter');
    };
    //Creating the bease directory
    const baseDir = path.join(__dirname, '..', 'template');
    //Read the template html file 
    fs.readFile(baseDir  + '/' + filename + '.html', 'utf-8', function(err, str){
        if(err || !str){
            console.log(err);
            return cb('Failed on opening file GUI', null);
        };
        //Do interpolate on the str
        const parsedStr = helpers.interpolate(str, data);
        cb(null, parsedStr);
    });
};

//To combine the template
helpers.addUniversalTemplates = function(strContent, data, cb){
    //Get the headers template
    helpers.getTemplate('_header', data, function(err, strHeader){
        if(err || !data){
            return cb('Failed on Getting Headers Template');
        };
        helpers.getTemplate('_footer', data, function(err, strFooter){
            if(err || !data){
                return cb('Failed on Getting Footer Template');
            };
            const joinedStr = strHeader + strContent + strFooter;
            cb(null, joinedStr);
        });
    });
};

//Sting interpolation to replace
helpers.interpolate = function(htmlStr, data){
    data = typeof data === 'object' && data !== null ? data : {};
    //Assign the data.global from the template global
    for(let key in config.templateGlobals){
        //Kita disini global tidak berfungsi sebagai object melainkan sebuah string dengan titik saja
        data['global.' + key] = config.templateGlobals[key];
    };
    //Replace the htmlStr with our current data
    for(let key in data){
        htmlStr = htmlStr.replace('{'+key+'}', data[key]);
    };
    //return the html that has been replaced
    return htmlStr;
};

helpers.getStaticAsset = function(filename, cb){
    const baseDir = path.join(__dirname, '..', 'public');
    fs.readFile(baseDir + '/' + filename, function(err, data){
        //Validation on Error
        if(err || !data){
            return cb("Failed on reading file", null);
        };
        return cb(null, data);
    });
};

module.exports = helpers;
