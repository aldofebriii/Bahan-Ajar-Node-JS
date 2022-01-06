const server = require('./lib/server');
const worker = require('./lib/worker');
const cli = require('./lib/cli');

const app = {};

app.init = function(cb){
    //Initialize Server
    server.init();
    //Initialize Worker
    worker.init();
    //Start the cli at the last one so we set into the asynchronus
    setTimeout(function(){
        cli.init();
        cb();
    },50)
};
if(require.main === module){
    app.init(function(){});
};

module.exports = app;