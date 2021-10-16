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
            return Error("Error on listing the checks");
        };
        checks.forEach(check => {
            crud.read('checks', check, function(err, checkData){
                if(!err && checkData){
                    worker.validateCheckData(checkData);
                } else {
                    console.log("Error on reading one file data");
                };
            });
        });
    });
};

worker.validateCheckData = function(checkData){
    const validatedCheckData = typeof checkData === 'object' && checkData !== null ? checkData : {};
    validatedCheckData.id = typeof validatedCheckData.id === 'string' && validatedCheckData.length === 20 ? validatedCheckData.id.trim() : false;
    validatedCheckData.userPhone = typeof validatedCheckData.userPhone === 'string' ? validatedCheckData.userPhone.trim() : false; 
    validatedCheckData.protocol = typeof validatedCheckData.protocol === 'string' && ['http', 'https'].indexOf(validatedCheckData.protocol) >= 0 ? validatedCheckData.protocol : false;
    va
    
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