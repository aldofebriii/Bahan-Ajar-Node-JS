const server = require('./lib/server');
const worker = require('./lib/worker');

const app = {};

app.init = function(){
    //Initialize Server
    server.init();

    worker.init();
};

app.init();

module.exports = app;