class App {
    constructor(sessionToken) {
        this.sessionToken = sessionToken;
        this.client = new Client(this.sessionToken);
    }
    async ping(){
        try {
            const client = this.client
            const data  = await client.request({
                path: '/ping',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return data;
        } catch(err){
            console.log(err);
        };
    };
    //Untuk melakukan inputan terhadap form
    bindForms(){
        let self = this;
        document.querySelector('form').addEventListener('submit', async function(e){
            e.preventDefault();
            const formId = this.id;
            const pathUri = new URL(this.action);
            const path = pathUri.pathname;
            const method = this.method;

            //Hide the error message if it exists
            document.querySelector(`#${formId} .formError`).style.display = 'hidden';

            //Loop through each form elements
            const elements = this.elements;
            const payload = {};
            for(let i = 0; i < elements.length; i++){
                if(elements[i].type !== 'submit'){
                    const valueOfElement = elements[i].type === 'checkbox' ? elements[i].checked : elements[i].value;
                    payload[elements[i].name] = valueOfElement;
                };
            };
            //Do the request on API
            const client = self.client;
            const clientRes = await client.request({
                path: path,
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: payload
            });
            //Jika error maka kita akan melakukan handle terhadap error
            if(clientRes instanceof Error){
                return self.formErrProcessor(formId, clientRes.message);
            };
            //Jika tidak kita akan process dengan task
            self.formResponseProcessor(formId, payload, clientRes);
        });
    };

    //Form Proccessor on Error
    formErrProcessor(formId, err){
        // Set the formError field with the error text
        document.querySelector("#"+formId+" .formError").innerHTML = err;

        // Show (unhide) the form error field on the form
        document.querySelector("#"+formId+" .formError").style.display = 'block';
    };

    //Form Proccessor on Success 
    formResponseProcessor(formId,requestPayload,responsePayload){
        var functionToCall = false;
        if(formId == 'accountCreate'){
          // @TODO Do something here now that the account has been created successfully
        };
    };
};

class Client  {
    constructor(sessionToken){
        this.sessionToken = (sessionToken);
    };

    async request({path, method, headers, body}){
        const baseUri = 'http://localhost:1000';
        try {
            //Validation on body
            body = typeof body === 'object' ? body : {};
            let fetchOpt;
            if(['POST', 'PUT', 'PATCH'].indexOf(method.toUpperCase()) > -1 ){
                fetchOpt = {
                    method: method,
                    headers: headers,
                    body: JSON.stringify(body)
                }
            } else {
                fetchOpt = {
                    method: method,
                    headers: headers
                }
            };
            const clientRes = await fetch(`${baseUri}${path}`, fetchOpt);
            if(clientRes.status !== 200 && clientRes.status !== 201){
                const errData = await clientRes.json();
                return new Error(errData.Error);
            };
            const clientData = await clientRes.json();
            return clientData;
        } catch(err){
            console.log(err);
        };
    };
};


const _init = function(){
    const app = new App(false);
    app.bindForms();    
};

window.onload = function(){
    _init();
};