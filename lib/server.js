//Kita melakukan import terhadap 3 module yang kita inginkan
const http =  require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const util = require('util');
const debug = util.debuglog('server');
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
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/delete': handlers.accontDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted': handlers.sessionDelete,
    'checks/all': handlers.checkList,
    'checks/create': handlers.checkCreate,
    'checks/edit': handlers.checkEdit,
    'ping': handlers.ping,
    'api/user': handlers.user,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks,
    'favicon.ico': handlers.favicon,
    'public': handlers.public,
    'example/error': handlers.exampleErr
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
        let chosenHandler = !server.router[path] ? handlers.notFound : server.router[path];
        //JIka path public maka kita akan meneruskan request ke public
        chosenHandler = path.indexOf('public/') > -1 ? server.router.public : chosenHandler;
        //Data yang akan digunakan untuk callback, memiliki path, queryStringObj, method, headers dan payload
        const data = {
            path: path,
            queryStringObj: queryStringObj,
            method: method,
            headers: headers,
            payload: helpers.JSONParserCatch(buffer)
        };

        //Setelah variable chosenHandler kita mengassign dengan menggunakan cb yang fungsinya dipanggil di cb dibawah.
        try {
            chosenHandler(data, function(statusCode, payload, contentType){
                server.processChoosenHandler(res, method, path, statusCode, payload, contentType);
        });
        } catch(err){
            debug(err.message);
            server.processChoosenHandler(res, method, path, 500, {'error': err.message}, 'JSON');
        };
    });
};

server.processChoosenHandler = function(res, method, path, statusCode, payload, contentType){
    //Determined Which Content Type that our node js is execute, which fallback to JSON if not exists
    contentType = typeof contentType === 'string' ? contentType : 'JSON';
    //Init variable that server on the end of the request
    let payloadStr;
    //If the content type was JSON then we handle the JSON 
    if(contentType === 'JSON'){
        payload = typeof payload === 'object' ? payload : {};
        payloadStr = JSON.stringify(payload);
        res.setHeader('Content-Type', 'application/json');
    };
    //If the content type was HTML it mean we must served the GUI
    if(contentType === 'HTML'){
        payload = typeof payload === 'string' ? payload : '';
        payloadStr = payload;
        res.setHeader('Content-Type', 'text/html');
    };
    //If the content type was css
    if(contentType === 'CSS'){
        payload = typeof payload !== 'undefined' ? payload : '';
        payloadStr = payload;
        res.setHeader('Content-Type', 'text/css');
    };
    //if the content type was js
    if(contentType === 'JS'){
        payload = typeof payload !== 'undefined' ? payload : '';
        payloadStr = payload;
        res.setHeader('Content-Type', 'text/javascript');
    };
    //if the content type was png/jpeg
    if(contentType === 'PNG' || contentType === 'JPEG' || contentType === 'JPG'){
        payload = typeof payload !== 'undefined' ? payload : '';
        payloadStr = payload;
        res.setHeader('Content-Type', 'image/' + contentType.toLowerCase());
    };
    //if the content was icon
    if(contentType === 'favicon'){
        payload = typeof payload !== 'undefined' ? payload : '';
        payloadStr = payload;
        res.setHeader('Content-Type', 'image/x-icon');
    };
    //Check the status Number
    typeof statusCode === 'number' ? statusCode : 200
    //Melakukan set Header
    res.writeHead(statusCode);
    res.end(payloadStr);
    console.log('Returning Response ' + statusCode);
};

//Membuat Sebuah Object Server dengan menggunakan callback(req = Object, res = Object)
server.httpServer = http.createServer((req, res)=>{
    server.unifiedServer(req, res)    
});

//Memulai httpsServer
server.httpsServer = https.createServer(server.httpsServerOptions,(req, res) => {
    server.unifiedServer(req, res)
});

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