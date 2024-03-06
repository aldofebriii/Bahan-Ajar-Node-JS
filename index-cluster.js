const server = require('./lib/server');
const worker = require('./lib/worker');
const cluster = require('cluster');
const os = require('os');
const cli = require('./lib/cli');

const app = {};

app.init = function(cb){
    //Jika Merupakan proccess inti
    if(cluster.isMaster){
        console.log(`Master ${process.pid} is running..`);
        //Initialize Worker
        worker.init();
        //Start the cli at the last one so we set into the asynchronus
        setTimeout(function(){
            cli.init();
            cb();
        },50);

        const totalCpus = os.cpus().length;
        for(let i = 0; i < totalCpus; i++){
            cluster.fork();
        };

        cluster.on('exit', function(worker, code, signal){
            console.log(`${worker.process.pid} is died`);
            cluster.fork();
        });
    } else {
        console.log(`Worker ${process.pid} is running... `);
        server.init();
    };
};
if(require.main === module){
    app.init(function(){});
};

module.exports = app;