//Kita melakukan import terhadap 3 module yang kita inginkan
const http =  require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const StringDecoder = require('string_decoder').StringDecoder;

const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');

const server = {};

server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '..', 'https', 'key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '..', 'https', 'cert.pem'))
};

//Asign Object untuk Router
server.router = {
    'ping': handlers.ping,
    'user': handlers.user,
    'tokens': handlers.tokens,
    'checks': handlers.checks
}

//Menyatukan fungsi server
server.unifiedServer = function(req, res){
    /*Kita menggunakan metode depresiasi untuk melakukan parsing terhadap url yang masuk
    ke API Server kita
    */
    //Mirip seperti URL Class membentuk sebuah object baru
    const baseUrl = 'http://'+req.headers.host+'/';
    const parsedUrl = new URL(req.url, baseUrl);

    //Menghilangkan forward2 slash
    const path = parsedUrl.pathname.replace(/^\/+|\/+$/g,''); // Menghilangkan slash2 pada path;

    //Kita meassign object query dari req.url
    const queryStringObj = Object.fromEntries(parsedUrl.searchParams.entries());
    
    //Assign Variable terhadap method dari request
    const method = req.method.toLowerCase();

    //Assign Variable request Header ke headers
    const headers = req.headers;

    //Membuat String decoder baru untuk data chunk
    const decoder = new StringDecoder('utf-8');
    //Buffer untuk tempat sementara meletakan string data
    let buffer = '';

    //Request on data => selanjutnya fungsi ini memanggil callback
    req.on('data', (data) => {
        buffer += decoder.write(data)
    });

    //Ketika data telah selesai selanjutnya kita melakukan check terhadap handler
    req.on('end', () => {
        //Memberhentiklan decoder untuk write data
        buffer += decoder.end()
        //Melakukan if statement apakah ketika memiliki handler untuk path tersebut?
        const chosenHandler = !server.router[path] ? handlers.notFound : server.router[path]
        //Data yang akan digunakan untuk callback, memiliki path, queryStringObj, method, headers dan payload
        const data = {
            path: path,
            queryStringObj: queryStringObj,
            method: method,
            headers: headers,
            payload: helpers.JSONParserCatch(buffer)
        };

        //Setelah variable chosenHandler kita mengassign dengan menggunakan cb yang fungsinya dipanggil di cb dibawah.
        chosenHandler(data, function(statusCode, payload){
            typeof statusCode === 'number' ? statusCode : 200
            typeof payload === 'object' ? payload : {};
            const payloadStr = JSON.stringify(payload);
            //Melakukan set Header
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode);
            res.end(payloadStr);
            console.log('Returning Response ' + statusCode);
        });
    });
}

//Membuat Sebuah Object Server dengan menggunakan callback(req = Object, res = Object)
server.httpServer = http.createServer((req, res)=>{
    server.unifiedServer(req, res)    
});

//Memulai httpsServer
server.httpsServer = https.createServer(server.httpsServerOptions,(req, res) => {
    server.unifiedServer(req, res)
});

// @TODO GET RID OF THIS
// helpers.sendTwilionSms('4151234567', "Hello World", function(err){
//     if(!err){
//         console.log("sending message success");
//     } else {
//         console.log(err);
//     };
// });

server.init = function(){
    //Spin the http server
    server.httpServer.listen(config.httpPort, () => {
        console.log('Server is Connected on Port '+ config.httpPort + ' with environment ' + config.envName)
    });

    //Spin the https server
    server.httpsServer.listen(config.httpsPort, () => {
        console.log('Server is Connected on Port '+ config.httpsPort + ' with environment ' + config.envName)
    });
};

module.exports = server;