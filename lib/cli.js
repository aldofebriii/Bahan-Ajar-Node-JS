const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const Events = require('events');

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
    cli.responders.stats
});

e.on('list users', function(){
    cli.responders.listUsers();
});

e.on('more user info', function(str){
    cli.responders.moreUserInfo(str); 
});

e.on('list checks', function(str){
    cli.responders.listChecks();
});

e.on('more info check', function(str){
    cli.responders.moreCheckInfo(str);
});

e.on('list logs', function(str){
    cli.responders.listLogs();
});

e.on('more info log', function(str){
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
        'Load Average' : '',
        'CPU Count' : '',
        'Free Memory': '',
        'Current Mallocated Memory' : '',
        'Peak Mallocated Memory' : '',
        'Allocated Heap Used (%)': '',
        'Available Heap Allocated' : ''
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
        //Codify  teh
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
        if(str.toLowerCase().indexOf(key)){
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