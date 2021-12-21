const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const Events = require('events');
const os = require('os');
const v8 = require('v8');
const crud = require('./crud');
const logs = require('./logs');
const helpers = require('./helpers');

class _events extends Events {};

const e = new _events();

//Instantiate the CLI Module objeect
let cli = {};

//Cli Helpers
cli.verticalSpace = function(lines){
    lines = typeof lines === 'number' > lines > 0 ? lines : 1;
    for(let i = 0; i < lines; i++){
        console.log('')
    };
};

cli.horizontalLine = function(){
    let line = '';
    for(let i = 0; i < process.stdout.columns; i++){
        line += '-'
    };
    console.log(line);
};

cli.centered = function(str){
    str = typeof str === 'string' ? str.trim().length > 0 ? str.trim() : '' : '';
    const width = process.stdout.columns;
    const leftPadding = Math.floor( (width - str.length) / 2 );

    let line = '';
    //Add blank space from left into middle
    for(let i = 0; i < leftPadding; i++){
        line += ' '
    };
    //Add the text
    line += str;
    console.log(line);
};

cli.responders = {};

//Handle the event based on the event
e.on('man', function(str){
    cli.responders.help();
});

e.on('help', function(str){
    cli.responders.help();
});


e.on('exit', function(str){
    cli.responders.exit();
});

e.on('stats', function(str){
    cli.responders.stats();
});

e.on('list users', function(){
    cli.responders.listUsers();
});

e.on('more user info', function(str){
    cli.responders.moreUserInfo(str); 
});

e.on('list checks', function(str){
    cli.responders.listChecks(str);
});

e.on('more check info', function(str){
    cli.responders.moreCheckInfo(str);
});

e.on('list logs', function(str){
    cli.responders.listLogs();
});

e.on('more log info', function(str){
    cli.responders.moreLogInfo(str);
});

//Responders Exit
cli.responders.exit = function(){
    process.exit(0);
};

//Responders Help
cli.responders.help = function(){
    var commands = {
        'exit' : 'Kill the CLI (and the rest of the application)',
        'man' : 'Show this help page',
        'help' : 'Alias of the "man" command',
        'stats' : 'Get statistics on the underlying operating system and resource utilization',
        'List users' : 'Show a list of all the registered (undeleted) users in the system',
        'More user info --{userId}' : 'Show details of a specified user',
        'List checks --up --down' : 'Show a list of all the active checks in the system, including their state. The "--up" and "--down flags are both optional."',
        'More check info --{checkId}' : 'Show details of a specified check',
        'List logs' : 'Show a list of all the log files available to be read (compressed and uncompressed)',
        'More log info --{logFileName}' : 'Show details of a specified log file',
    };

    //Show a header for the help page that is as wide as the screen
    cli.horizontalLine();
    cli.centered('CLI MANUAL');
    cli.horizontalLine();
    cli.verticalSpace(2);

    //Show each command
    for(var key in commands){
        const value = commands[key];
        let line = '\x1b[33m' + key + '\x1b[0m';
        //Left over spacce on the left of the key
        const padding = 60 - line.length;
        for(let i = 0; i < padding; i++){
            // We add the space until it equally to 60
            line += ' ';
        };
        //Kita menambahkan line dengan
        line += value;
        console.log(line);
        //Add the space
        cli.verticalSpace(1);
        //Add the line
        cli.horizontalLine();
    };
};

cli.responders.stats = function(){
    //Compile an object of stats
    const stats = {
        'Load Average' : os.loadavg().join(''),
        'CPU Count' : os.cpus().join(''),
        'Free Memory': os.freemem(),
        'Current Mallocated Memory' : v8.getHeapStatistics().malloced_memory,
        'Peak Mallocated Memory' : v8.getHeapStatistics().peak_malloced_memory,
        'Allocated Heap Used (%)': Math.round(v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size * 100) + '%',
        'Available Heap Allocated (%)' : Math.round(v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit * 100) + '%',
        'Uptime': os.uptime() + ' seconds'
    };

    //Create the headers for the stat
    cli.horizontalLine(1);
    cli.centered("System Statistics");
    cli.horizontalLine(1);
    cli.verticalSpace(2);

    //The context
    for(key in stats){
        const value = stats[key];
        let line = '\x1b[33m' + key + '\x1b[0m';
        const padding = 60 - line.length;
        //Adding white space after line
        for(let i = 0; i < padding; i++){
            line += ' ';
        };
        line += value;
        console.log(line);
        //Add the space
        cli.verticalSpace(1);
        //Add the line
        cli.horizontalLine();
    };
};

cli.responders.listUsers = function(){
    crud.list('user', function(err, userIds){
        if(!err && userIds.length > 0){
            cli.verticalSpace();
            //Jika tidak error dan terdapat list dari userIds maka
            //Loop terhadap userIds
            userIds.forEach(function(userId){
                //Membuka detail dari file menggunakan userId
                crud.read('user', userId, function(err, userData){
                    if(!err && userData){
                        let line = ` Name : ${userData.firstName} ${userData.lastName} Phone  : ${userData.phone} Checks : `;
                        const totalChecks = userData.checks ? userData.checks.length : 0;
                        line += totalChecks;
                        console.log(line);
                        cli.verticalSpace();
                    };
                });
            });
        };
    });
};

cli.responders.moreUserInfo = function(str){
    const splittedArr = str.split('--');
    if(splittedArr.length < 2){
        console.log("Invalid Parameter Try Again..");
        return cli.verticalSpace();
    };
    const userId = str.split('--')[1].trim();
    if(userId){
        crud.read('user', userId, function(err, userData){
            if(!err && userData){
                delete  userData.password;
                cli.verticalSpace();
                console.dir(userData,  {
                    colors: true 
                });
                cli.verticalSpace();
            };
        });
    };
};

cli.responders.listChecks = function(str){
    //Memisahkan jika terdapat optional
    const splittedArr = str.split('--');
    let choosenState;
    if(splittedArr.length > 1){
        choosenState = splittedArr[1].trim();
    };

    //Melakukan pencaria terhadap list
    crud.list('checks',  function(err, checksList){
        if(!err && checksList.length > 0){
            for(let i = 0; i < checksList.length; i++){
                const checkId = checksList[i];
                crud.read('checks', checkId, function(err, checkData){
                    if(!err && checkData){
                        //Defaulting the check state if there no check
                        const state = typeof checkData.state === 'string'? checkData.state : 'down';
                        if(state === choosenState || !choosenState){
                            const line = `ID: ${checkData.id} ${checkData.method.toUpperCase()} ${checkData.protocol}://${checkData.url} State: ${checkData.state}`;
                            console.log(line);
                            cli.verticalSpace();
                        };
                    };
                })
            };
        };
    });
};

cli.responders.moreCheckInfo = function(str){
    const splittedArr = str.split('--');
    if(splittedArr.length < 2){
        console.log("Invalid Parameter Try Again..");
        return cli.verticalSpace();
    };
    const checkId = str.split('--')[1].trim();
    if(checkId){
        crud.read('checks', checkId, function(err, checkData){
            if(!err && checkData){
                cli.verticalSpace();
                console.dir(checkData,  {
                    colors: true 
                });
                cli.verticalSpace();
            };
        });
    };  
};

cli.responders.listLogs = function(){
    logs.list(true, function(err, logFileNames){
        if(!err && logFileNames.length > 0){
            for(let i = 0; i < logFileNames.length; i++){
                const logFileName = logFileNames[i];
                  if(logFileName.indexOf('-') > - 1){
                    console.log(logFileName);
                    cli.verticalSpace();    
                  };
            };
        };
    });
};

cli.responders.moreLogInfo = function(str){
    const splittedArr = str.split('--');
    if(splittedArr.length < 2){
        console.log("Invalid Parameter Try Again..");
        return cli.verticalSpace();
    };
    const logFileName = str.split('--')[1].trim();
    if(logFileName){
        cli.verticalSpace();
        logs.decompress(logFileName, function(err, newStr){
            if(!err && newStr){
                const arr = newStr.split('\n');
                arr.forEach(function(jsonStr){
                    const logObject = helpers.JSONParserCatch(jsonStr);
                    if(logObject && JSON.stringify(logObject) !== '{}'){
                        console.dir(logObject, {
                            colors: true
                        });
                        cli.verticalSpace();
                    };
                });
            };
        });
    };  
};

//Init script
cli.init = function(){
    //Send the start message into console wiht blue color
    console.log('\x1b[34m%s\x1b[0m', 'The ClI is running');

    const _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ''
    });

    //Create an initial prompt 
    _interface.prompt();

    _interface.on('line', function(str){
        //Send the input processor
        cli.processInput(str);
        //Reinitialize the prompt
        _interface.prompt();
    });

    _interface.on('close', function(){
        process.exit(0);
    });

};

cli.processInput = function(str){
    //Validate the string
    str = typeof str === 'string' ? str.length > 0 ? str.trim() : false : false;
    //If there's a string
    if(str){
    };
    //Unique input based on our event emitter
    const keyInputs = [
        'man',
        'help',
        'exit',
        'stats',
        'list users',
        'more user info',
        'list checks',
        'more check info',
        'list logs',
        'more log info'
    ];

    let matchFound = false;
    let counter = 0;

    keyInputs.some(function(key){
        if(str.toLowerCase().indexOf(key) > - 1){
            matchFound = true;
            //Emit an event based on the key inputs
            e.emit(key, str);
            return true;
        };
    });
    //If no match is found then tell the user to try again
    if(!matchFound){
        console.log("Sorry, try again");
    };
};

module.exports = cli;