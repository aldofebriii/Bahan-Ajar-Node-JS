const server = require('./lib/server');
const worker = require('./lib/worker');

const app = {};

app.init = function(){
    //Initialize Server
    server.init();

    //Initialize Worker
    worker.init();
};

app.init();

module.exports = app;