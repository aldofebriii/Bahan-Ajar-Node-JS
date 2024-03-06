    const tls = require('tls');
    const fs = require('fs');
    const path = require('path');

    const clientOpt = {
        ca: fs.readFileSync(path.join(__dirname, '/../https/cert.pem')),
        port: 8245
    };

    const client = tls.connect(clientOpt, function(){
        const outMsg = 'pong';
        client.write(outMsg, function(err){
            if(err){
                console.log("Failed on sending message to Server");
            };
        });

        client.on('data', function(chunks){
            const inMsg = chunks.toString();
            console.log(`Client send ${outMsg} and server replied ${inMsg}`);
        });
    });;