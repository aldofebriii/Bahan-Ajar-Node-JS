//Kita melakukan import terhadap 3 module yang kita inginkan
const http =  require('http');
const https = require('https');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;

const config = require('./lib/config');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};

//Asign Object untuk Router
const router = {
    'ping': handlers.ping,
    'user': handlers.user,
    'tokens': handlers.tokens,
    'checks': handlers.checks
}

//Menyatukan fungsi server
const unifiedServer = function(req, res){
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
        const chosenHandler = !router[path] ? handlers.notFound : router[path]
        //Data yang akan digunakan untuk callback, memiliki path, queryStringObj, method, headers dan payload
        const data = {
            'path': path,
            'queryStringObj': queryStringObj,
            'method': method,
            'headers': headers,
            'payload': helpers.JSONParserCatch(buffer)
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
const httpServer = http.createServer((req, res)=>{
    unifiedServer(req, res)    
});

//Memulai httpsServer
const httpsServer = https.createServer(httpsServerOptions,(req, res) => {
    unifiedServer(req, res)
})

//Spin the http server
httpServer.listen(config.httpPort, () => {
    console.log('Server is Connected on Port '+ config.httpPort + ' with environment ' + config.envName)
});

//Spin the https server
httpsServer.listen(config.httpsPort, () => {
    console.log('Server is Connected on Port '+ config.httpsPort + ' with environment ' + config.envName)
});