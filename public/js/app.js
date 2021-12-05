class App {
    constructor(sessionToken) {
        this.sessionToken = sessionToken;
        this.client = new Client(this.sessionToken);
    };

    //Set terhadap session
    setSessionToken(token){
        //Reassign the sessionToken properties
        this.sessionToken = token;
        try {
            const tokenStr = JSON.stringify(token);
            //Save token STR on 
            localStorage.setItem('token', tokenStr);
            //ChSet the class
            this.setLoggedInClass(true);
        } catch(err){
            this.setLoggedInClass(false);
        };
    };

    //Set terhadap DOM Class sehingga memliki class loggedIn
    setLoggedInClass(set){
        //Check the condition
        const body = document.querySelector('body');
        if(set){
            body.classList.add('loggedIn');
        } else {
            body.classList.remove('loggedIn');
        };
    };

    /* Get Session token meruapakan apabila applikasi dibuka maka dia akan mengecheck 
    apakah masih ada session atau tidak */
    static getSessionToken(){
        const tokenString = localStorage.getItem('token');
        if(typeof tokenString === 'string'){
            try {
                const token = JSON.parse(tokenString);
                const app = new App(token);
                app.setSessionToken(token);
                return token;
            } catch(err){
                const app = new App(false);
            };
        } else {
            return false;
        }
    };

    //Loop condition it will stay extend the token if user still using the application
    async renewToken(){
        try { 
        //Check if there's a token
        const currentToken = typeof this.sessionToken === 'object' ? this.sessionToken : false;
        if(currentToken){
            //Create data payload
            const dataPayload = {
                id: currentToken.id,
                extend: true
            };

            const token = await this.client.request({
                path: '/api/tokens',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: dataPayload
            });
            
            this.setSessionToken(token);
            return token;
        };
        } catch(err){
            this.setSessionToken(false);
            return new Error("Failed on : " + err.message);
        };
    };

    tokenRenewalLoop(){
        let self = this;
        setInterval(async function(){
            const renewStats = await self.renewToken();
            if(renewStats instanceof Error || !renewStats){
                console.log("Failed on Renew Token");
            } else {
                console.log("Success on Renewed Token");
            };
        }, 10000)
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
        if(formId === 'accountCreate'){
            // @TODO Do something here now that the account has been created successfully
            window.alert("User is successfully Created..");
            window.location.reload();
        };

        if(formId === 'sessionCreate'){
            //Get the token that coming from the response payload
            const token = responsePayload;
            //Create the Instansce App
            const app = new App(token.id);
            //Set The Session Token
            app.setSessionToken(token);
            //Info
            window.alert("User is successfully Logged In");
            //Redirect
            window.location = '/checks/all';
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
            console.log(clientRes.status);
            if(clientRes.status !== 200 && clientRes.status !== 201){
                const errData = await clientRes.json();
                throw new Error(errData.Error);
            };
            const clientData = await clientRes.json();
            return clientData;
        } catch(err){
            console.log(err.message);
        };
    };
};


const _init = function(){
    const token = App.getSessionToken();
    const app = token ? new App(token) : new App(false);
    console.log(app);
    //Binding Form to Listener
    app.bindForms();
    //Renew Token
    app.tokenRenewalLoop();
};

window.onload = function(){
    _init();
};