const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');

const crud = require('./crud');
const helpers = require('./helpers');

const workworkerrs = {};

worker.gatherAllChecks = function(){
    crud.list('checks', function(err, checks){
        if(err){
            return Error("No Check was found");
        };
        for(let i = 0; i < checks.length; i++){
            
        };
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