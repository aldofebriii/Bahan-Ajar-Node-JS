const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');

const crud = require('./crud');
const helpers = require('./helpers');

const worker = {};

worker.gatherAllChecks = function(){
    crud.list('checks', function(err, checks){
        if(err){
            console.log("Error: Failed on listing the checks");
        };
        if(checks.length === 0){
            console.log("Error: There's no checks");
        };
        checks.forEach(check => {
            crud.read('checks', check, function(err, data){
                if(err || !data){
                    return console.log("Error on checking the checks");
                };
                worker.validateCheckData(data);
            });
        });
    });
};

worker.validateCheckData = function(check){
    //actually only validate the data that equally to string or object or else. Just validate the checks
    check.id = typeof check.id === 'string' && check.id.length === 20 ? check.id : false;
    check.userPhone = typeof check.userPhone === 'string' && check.userPhone.length >= 5 && check.userPhone.length <= 13 ? check.userPhone : false;
    check.protocol = typeof check.protocol === 'string' && ['http', 'https'].indexOf(check.protocol) >= 0 ? check.protocol : false;
    check.method = typeof check.method === 'string' && ['post', 'put', 'delete', 'get'].indexOf(check.method) >= 0 ? check.method : false;
    check.successCodes = check.successCodes instanceof Array ? check.successCodes : false;
    check.timeoutSeconds = typeof check.timeoutSeconds === 'number' ? check.timeoutSeconds : false;

    //The keys that indicate whether the check is already checked or not and also set they key for the first time check
    check.state = typeof check.state === 'string' && ['up', 'down'].indexOf(check.state) >= 0 ? check.state : 'down'; //set to down for the firs time
    check.lastChecked = typeof check.lastChecked === 'number' ? check.lastChecked : false;
    
    //If we pass all the check we want to perform the check
    if( check.id &&
        check.userPhone &&
        check.method &&
        check.successCodes &&
        check.timeoutSeconds ){
            worker.performCheck(check);
    } else {
        console.log("Failed on checking one of the check, so we skipping it.");
    };
};

worker.performCheck = function(check){
    //Initial Outcome Object
    const outcomeCheck = {
        error: false,
        responseCode: false
    };
    //Key to make sure that the outcome already sent
    let outcomeSent = false;

    //Parsed the url that coming from 
    const parsedUrl = new URL(`${check.protocol}://${check.url}`);
    
    const reqDetails = {
        protocol: parsedUrl.protocol ,
        hostname: parsedUrl.hostname,
        method: check.method,
        path: parsedUrl.pathname + parsedUrl.search,
        timeout: check.timeoutSeconds * 1000
    };
    //Choose the right module based on the user protocol
    const request = check.protocol === 'http' ? http.request : https.request;
    //Creating a request
    const req =  request(reqDetails, function(res){
        const statusCode = res.statusCode;
        //Updating the data
        outcomeCheck.responseCode = statusCode;
        //Sending the output
        if(!outcomeSent){
            worker.processOutcomeCheck(check, outcomeCheck);
            outcomeSent = true;
        };
    });
    //Binding the error
    req.on('error', function(err){
        outcomeCheck.error = {
            error: true,
            value: err
        };
        if(!outcomeSent){
            worker.processOutcomeCheck(check, outcomeCheck);
            outcomeSent = true;
        };
    });
    //Binding the timeout
    req.on('timeout', function(){
        outcomeCheck.error = {
            error: true,
            value: 'timeout'
        };
    });

    req.end();
};

worker.processOutcomeCheck = function(check, outcomeCheck){
    //Check the right state for check. If the check is error or its change the responeCode then we set into down
    const state = !outcomeCheck.error && outcomeCheck.responseCode && check.successCodes.indexOf(outcomeCheck.responseCode) > -1 ? 'up' : 'down';

    //Deciding the alert is warratend or not. So if it has been check before and it's change. If it's already down we dont need to alert it
    const isAlert = check.lastChecked && check.state !== state ? true : false;
    //Update the check
    check.state = state;
    check.lastChecked = Date.now();
    crud.update('checks', check.id, check, function(err){
        if(err){
            return console.log("Error: Failed on updating the checks");
        };
        if(isAlert){
            //Alerted
            worker.alertUserToStatusChange(check);
        } else {
            console.log("Checkout outcome hasn't change. Dont need alert")
        };
    });
};

worker.alertUserToStatusChange = function(check){
    const msg = `Alert: Your Check For ${check.method.toUpperCase()} ${check.url}`;
    helpers.sendTwilionSms(check.userPhone, msg, function(err){
        if(err){
            return console.log("Error: Failed to send SMS to changed user");
        };
        console.log("Success on sending SMS to change user");
    });
};

worker.loop = function(){
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000*60);
};

worker.init = function(){
    //Execute all the checks
    worker.gatherAllChecks();
    //Call a loop to keep the check
    worker.loop();
};

module.exports = worker;