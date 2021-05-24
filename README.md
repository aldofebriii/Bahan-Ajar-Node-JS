<h1>Node JS Master Class Tutorial</h1>
<h2>1. Module One</h2>
<h3>a. Sending JSON Request</h3>
Untuk membuat server kita akan menggunakan pure node module tanpa menggunakan sedikitpun library.

```js
//Kita melakukan import terhadap 3 module yang kita inginkan
const http =  require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
//Membuat Sebuah Object Server dengan menggunakan callback(req = Object, res = Object)
const server = http.createServer((req, res)=> {
```
Bisa seperti ini : 
```js
    //Kita memberikan bentuk dasar dari url api kita. e.g: http://localhost:8080/
    const urlBase = 'http://' + req.headers.host + '/';
    //Kita membuat sebuah instansi dari class Url akan mereturn object
    const url = new URL(req.url, urlBase);
    //Menghilangkan forward2 slash
    const trimmedUrl = url.replace(/^\/+|\/+$/g,'')
```
atau seperti ini : 
```js
    //Mirip seperti URL Class membentuk sebuah object baru
    const parsedUrl = url.parse(req.url, true)
    //Menghilangkan forward2 slash
    const path = parsedUrl.pathname.replace(/^\/+|\/+$/g,'');
```
Selanjutnya kita melakukan olahan terhadap kita tadi
```js

    /* Kita meassign object query dari req.url jika
    menggunakan methode baru harap menggunakan parsedUrl.search */
    const queryStringObj = parsedUrl.query;

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
            'payload': buffer
        };

        //Setelah variable chosenHandler kita mengassign dengan menggunakan cb yang fungsinya dipanggil di cb dibawah.
        chosenHandler(data, function(statusCode = Number, payload){
            typeof statusCode === 'number' ? statusCode : 200
            typeof payload === 'object' ? payload : {};

            const payloadStr = JSON.stringify(payload);
            //Melakukan set Header
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode);
            res.end(payloadStr)

            console.log('Returning Response ' + statusCode)
        });
    });
});

//Assign Object untuk handler
const handlers = {};

handlers.sample = function(data, cb){
    cb(200, {'name': 'Sampel handlers'});
};

handlers.notFound = function(data, cb){
    cb(404);
};

//Asign Object untuk Router
const router = {
    'sample': handlers.sample
}

//Spin the server
server.listen(1000, () => {
    console.log('Server is Connected on Port 1000')
});
```
Kita akan melakukan import module url untuk dapat memparse url agar dapat mengakses path dan query

Contoh link: http://localhost:3000/foo/bar?buzz=yes
```javascript
path = '/foo/bar'
query = {
    buzz: 'yes'
}
```

Berikut tampilan dari object url menggunakan class URL
```js
URL {
  href: 'http://127.0.0.1:3000/favicon.ico',
  origin: 'http://127.0.0.1:3000',
  protocol: 'http:',
  username: '',
  password: '',
  host: '127.0.0.1:3000',
  hostname: '127.0.0.1',
  port: '3000',
  pathname: '/favicon.ico',
  search: '',
  searchParams: URLSearchParams {},
  hash: ''
}

```
<h3>b. Adding Configuration File</h3>
Kita dapat menambahkan variable configurasi pada node js.
Contoh saat menjalankan applikasi:

```terminal
    NODE_ENV=staging node app.js
```
Maka disini kita akan melakukan assign variable process.env.NODE_ENV adalah 'staging'
Kita akan melakukan setting pada port dan environment name.

```js
//Container untuk seluruh enviromments
const environments = {};

environments.staging = {
    'port': 1000,
    'envName': 'staging'
};

environments.production = {
    'port': 5000,
    'envName': 'production'
};

//if statement melakukan check terhadap variabe environment
const currentEnvironment = typeof process.env.NODE_ENV == 'string' ? process.env.NODE_ENV.toLocaleLowerCase(): '';
const environtmentToExport = currentEnvironment ? environments[currentEnvironment] : environments.staging;

module.exports = environtmentToExport;
```
Kita juga melakukan perubahan data port

```js
//Spin the server
server.listen(config.port, () => {
    console.log('Server is Connected on Port '+ config.port + ' with environment ' + config.envName)
});
```

<h3>c. Creating HTTPS</h3>
Kita dapat membuat sebuah https server pada node.js menggunakan openssl.
Pertama kita akan membuat folder https lalu menjalankan command openssl

```terminal
openssl req -newkey -rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```

Dari terminal ini kita akan menghasilkan 2 file yaitu key.pem dan cert.pem

Selanjutny kita akan melakukan penyesuaian code terhadap https server.

```javascript

//Menyatukan fungsi server
const unifiedServer = function(req, res){
    /*Kita menggunakan metode depresiasi untuk melakukan parsing terhadap url yang masuk
    ke API Server kita
    */
    //Mirip seperti URL Class membentuk sebuah object baru
    const parsedUrl = url.parse(req.url, true)
    //Menghilangkan forward2 slash
    const path = parsedUrl.pathname.replace(/^\/+|\/+$/g,'');

    //Kita meassign object query dari req.url
    const queryStringObj = parsedUrl.query;

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
            'payload': buffer
        };

        //Setelah variable chosenHandler kita mengassign dengan menggunakan cb yang fungsinya dipanggil di cb dibawah.
        chosenHandler(data, function(statusCode = Number, payload){
            typeof statusCode === 'number' ? statusCode : 200
            typeof payload === 'object' ? payload : {};

            const payloadStr = JSON.stringify(payload);
            //Melakukan set Header
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode);
            res.end(payloadStr)
            console.log('Returning Response ' + statusCode)
        });
    });
}
```

Perbedaan yang terjadi adalah kita memasukan httpServerOptions pada argument createServer.
```js
const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions,(req, res) => {
    unifiedServer(req, res)
})
```
```js
//Spin the https server
httpsServer.listen(config.httpsPort, () => {
    console.log('Server is Connected on Port '+ config.httpsPort + ' with environment ' + config.envName)
});

```
<h3>d. CRUD with FS</h3>
Selanjutnya kita akan membuat file dan library menggunakan module fs

```terminal
mkdir lib
mkdir .data
mkdir .data/test
touch lib/data.js
```

Kita membuat base untuk membuat fungsi dan memasukannya kedalam container

```js
//Importing Module
const fs = require('fs');
const path = require('path');
//Container to be exported
const lib = {};

//Base directory dari file ini
lib.baseDir = path.join(__dirname, '/../.data./',);
```

Kita membuat fungsi create file json
```js
lib.create = function(dir, file, data, cb){
    //Menggunakan flag wx => w berarti create file if not exist sedangkan x tidak membuat file jika file telah exist
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', function(err, fd){
        if(!err && fd){
            //Conver Data into JSON
            const stringData = JSON.stringify(data);
            //Kita menulis file yang kita tulis sebelumnya
            fs.writeFile(fd, stringData, function(err){
                if(!err){
                    fs.close(fd, function(err){
                      if(!err){
                          cb(false)
                      } else {
                          cb('Error when closing a file')
                      }
                    })
                } else {
                    cb('Error When Writing a file')
                }
            })
        } else {
            cb('Couldnt create a new File');
        }
    }
}
```
Kita menggunakan fs.open agar mempersingkat proses sehingga kita lansung membuat file dengan menggunakan flag wx
Kita mendapatkan file descriptor(fd) sehingga kita tidak perlu lagi mengulang2 path untuk melakukan writeFile

Selanjutnya kita akan membuat fungsi untuk melakukan read pada file
```js
lib.read = function(dir, file, cb){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf-8', function(err, data){
        if(err){
          return cb('Error on writing file');  
        };
        cb(err, data)
    })
};
```
Untuk read file terkesan lebih simple dikarenakan kita hanya menggunakan module readFile saja.

```js
lib.update = function(dir, file, data, cb){
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function(err, fd){
        if(err){
            return cb('Failed on opening file, file may not exist yet.')
        };
        const stringData = JSON.stringify(data);
        fs.writeFile(fd, data, function(err){
            if(err && !fd){
                return cb('Failed on writing file')
            };
            fs.close(fd, function(err){
                if(err){
                    return cb('Failed on closing file');
                };
            })
            cb(false);
        });
    });
};
```
Kita menggunakan teknik yang sama ketika menulis file. Perbedaan disini hanyalah kita menggunakan flag r+

```js
lib.delete = function(dir, file, cb){
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
        if(err){
            return cb('Error on deleting File');
        };
        cb(false);
    });
};
```
Kita menggunakan fs.unlink untuk melakukan penghapusan file.

