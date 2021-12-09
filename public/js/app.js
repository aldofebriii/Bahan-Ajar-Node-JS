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
                return token;
            } catch(err){
                return false;
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
        }, 1000*60*45)
    };

    //Untuk melakukan inputan terhadap form
    bindForms(){
        let self = this;
        const token = typeof this.sessionToken === 'object' ? this.sessionToken : false;
        if(document.querySelector('form')){
            const forms = document.querySelectorAll('form');
            forms.forEach(function(form) {
                form.addEventListener('submit', async function(e){
                    const formId = this.id;
                    try {
                        e.preventDefault();
                        const pathUri = new URL(this.action);
                        const path = pathUri.search ? pathUri.pathname + pathUri.search : pathUri.pathname
                        const headers = token ? {"Content-Type": "application/json", token: token.id} : {"Content-Type" : "application/json"};
                        let method = this.method;
                        //Hide the error message if it exists
                        document.querySelector(`#${formId} .formError`).style.display = 'hidden';
            
                        //Loop through each form elements
                        const elements = this.elements;
                        const payload = {};
                        for(let i = 0; i < elements.length; i++){
                            const classOfElement = typeof elements[i].classList.value === 'string' ? elements[i].classList.value : '';
                            const valueOfElement = elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1 ? elements[i].checked : classOfElement.indexOf('intval') == -1 ? elements[i].value : parseInt(elements[i].value);
                            const elementIsChecked = elements[i].checked;
                            if(elements[i].type !== 'submit'){
                                if(elements[i].name === '_method'){
                                    method = valueOfElement
                                };
                                if(classOfElement.indexOf('multiselect') > -1){
                                    if(elementIsChecked){
                                        console.log(elements[i]);
                                        payload[elements[i].name] = typeof payload[elements[i].name] === 'object' && payload[elements[i].name] instanceof Array ? payload[elements[i].name] : [];
                                        payload[elements[i].name].push(valueOfElement); 
                                    };
                                } else {
                                    payload[elements[i].name] = valueOfElement;
                                }
                            };
                        };

                        
                        //Do the request on API
                        const client = self.client;
                        const clientRes = await client.request({
                            path: path,
                            method: method,
                            headers: headers,
                            body: payload
                        });
                        //Jika error maka kita akan melakukan handle terhadap error
                        if(clientRes instanceof Error){
                            return self.formErrProcessor(formId, clientRes.message);
                        };
                        //Jika tidak kita akan process dengan task
                        self.formResponseProcessor(formId, payload, clientRes);
                    } catch(err){
                        self.formErrProcessor(formId, err.message);
                    };
                });
            });
        };
    };
    //Bind the Dom For the Logout button
    bindLogoutButton(){
        let self = this;
        if(document.getElementById('logoutButton')){
            document.getElementById('logoutButton').addEventListener('click', async function(e){
                e.preventDefault();
                await self.logUserOut(true);
            });
        };
    };
    //function that bind into button to help user logout
    async logUserOut(redirectUser){
        try {
            //Get the token from the class properties
            const tokenId = typeof this.sessionToken.id === 'string' ? this.sessionToken.id : false;
            //Jika ada token maka kita akan melakukan request
            if(tokenId){
                //Do the request API to delete the token
                await this.client.request({
                    path: `/api/tokens?id=${tokenId}`,
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                //Set the localStorage  session token into false
                this.setSessionToken(false);
                //check wheter is directer or not
                if(redirectUser){
                    window.location = 'session/deleted';
                };
            };

        } catch(err){
            console.log(err);
        };
    };

    //Bind Account Page
    async bindLoadPage(){
        if(window.location.pathname === '/account/edit'){
            await this.loadEditAccountPage();   
        };
        if(window.location.pathname === '/checks/all'){
            await this.loadListChecksPage();
        };
        if(window.location.pathname === '/checks/edit'){
            await this.loadEditCheckPage();
        };
    };

    //Edt Account page
    async loadEditAccountPage(){
        try {
            const token = typeof this.sessionToken === 'object' ? this.sessionToken.id : false;
            const phone = typeof this.sessionToken === 'object' ? this.sessionToken.phone : false;
            if(phone && token){
                const user = await this.client.request({
                    path: `/api/user?phone=${phone}`,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "token": token
                    }
                });
                // Put the data into the forms as values where needed
                document.querySelector("#accountEdit1 .firstNameInput").value = user.firstName;
                document.querySelector("#accountEdit1 .lastNameInput").value = user.lastName;
                document.querySelector("#accountEdit1 .displayPhoneInput").value = user.phone;
                document.querySelector('#accountEdit3').action = 'api/user?phone=' + user.phone;
                // Put the hidden phone field into both forms
                const hiddenPhoneInputs = document.querySelectorAll("input.hiddenPhoneNumberInput");
                for(var i = 0; i < hiddenPhoneInputs.length; i++){
                    hiddenPhoneInputs[i].value = user.phone;
                };
            } else {
                throw new Error("Invalid Phone Number or Server may be down");
            };
        } catch(err){
            window.alert("Something went wrong ", err.message);
            await this.logUserOut(true);
        };
    };

    async loadEditCheckPage(){
        try {
            const id = typeof this.sessionToken === 'object' ? this.sessionToken.id : false;
            if(!id){
                throw new Error("Missing required fields on Id");
            };
            const currentUri = new URL(window.location);
            //get the checks data
            const check = await this.client.request({
                path: '/api/checks' + currentUri.search,
                headers: {
                    "Content-Type": 'application/json'
                },
                method: "GET"
            });

            const hiddenIdInputs = document.querySelectorAll("input.hiddenIdInput");
            for(let i = 0; i < hiddenIdInputs.length; i++){
                hiddenIdInputs[i].value = check.id;
            }

            // Put the data into the top form as values where needed
            document.querySelector("#checksEdit1 .displayIdInput").value = check.id;
            document.querySelector('#checksEdit2').action = '/api/checks?uid=' + check.id
            document.querySelector("#checksEdit1 .displayStateInput").value = check.state;
            document.querySelector("#checksEdit1 .protocolInput").value = check.protocol;
            document.querySelector("#checksEdit1 .urlInput").value = check.url;
            document.querySelector("#checksEdit1 .methodInput").value = check.method;
            document.querySelector("#checksEdit1 .timeoutInput").value = check.timeoutSeconds;
            const successCodeCheckboxes = document.querySelectorAll("#checksEdit1 input.successCodesInput");
            for(let i = 0; i < successCodeCheckboxes.length; i++){
                if(check.successCodes.indexOf(parseInt(successCodeCheckboxes[i].value)) > -1){
                    successCodeCheckboxes[i].checked = true;
                };
            }
        } catch(err){
            console.log(err);
            window.alert("Something went wrong" + err.message);
        };
    };

    async loadListChecksPage(){
        try {
            const phone = typeof this.sessionToken === 'object' ? this.sessionToken.phone : false;
            if(!phone){
                throw new Error("Missing required fields");
            };

            //Get The User Check first
            const user = await this.client.request({
                path: '/api/user?phone=' + phone,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    token: this.sessionToken.id
                }
            });
            
            const checks = user.checks;
            if(checks.length > 0 ){
                for(let i = 0; i < checks.length; i++){
                    const check = await this.client.request({
                        path: '/api/checks?id=' + checks[i],
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            token: this.sessionToken.id
                        }
                    });
                    // Make the check data into a table row
                    const table = document.getElementById("checksListTable");
                    const tr = table.insertRow(-1);
                    tr.classList.add('checkRow');
                    const td0 = tr.insertCell(0);
                    const td1 = tr.insertCell(1);
                    const td2 = tr.insertCell(2);
                    const td3 = tr.insertCell(3);
                    const td4 = tr.insertCell(4);
                    td0.innerHTML = check.method.toUpperCase();
                    td1.innerHTML = check.protocol+'://';
                    td2.innerHTML = check.url;
                    const state = typeof(check.state) == 'string' ? check.state : 'unknown';
                    td3.innerHTML = state;
                    td4.innerHTML = '<a href="/checks/edit?id='+check.id+'">View / Edit / Delete</a>';
                };
            };

            //Dom Manipulate based on the count of check
            if(checks.length < 5){
                // Show the createCheck CTA
                document.getElementById("createCheckCTA").style.display = 'block';
            } else {
                // Show 'you have no checks' message
                document.getElementById("noChecksMessage").style.display = 'table-row';

                // Show the createCheck CTA
                document.getElementById("createCheckCTA").style.display = 'block';
            };
        } catch(err){
            window.alert("Something went wrong" + err.message);
        };
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

        if(formId === 'checksCreate'){
            window.alert("Check is successfully Created..");
            window.location = '/checks/all'
        };

        if(formId === 'accountEdit3'){
            this.setSessionToken(false);
            window.alert("User is Deleted");
            window.location = '/user/deleted';
        };

        if(formId == 'checksEdit1'){
            window.location.reload();
        }

        if(formId == 'checksEdit2'){
            window.location = '/checks/all';
        }
    };
};

class Client  {
    constructor(sessionToken){
        this.sessionToken = (sessionToken);
    };
    //Api Request For Browsers
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
            console.log(path, method, headers,  clientRes.status);
            if(clientRes.status !== 200 && clientRes.status !== 201 && clientRes.status !== 203){
                const errData = await clientRes.json();
                throw new Error(errData.Error);
            };
            const clientData = await clientRes.json();
            return clientData;
        } catch(err){
            throw Error(err.message);
        };
    };
};

const _init = async function(){
    //Get the token that coming from the local storage
    const token = App.getSessionToken();
    //Init the app
    const app = new App(token);
    //Set the loggedINClass
    if(typeof app.sessionToken === 'object'){
        app.setLoggedInClass(true);
    } else {
        app.setLoggedInClass(false);
    };
    //Binding Form to Listener
    app.bindForms();
    //Also Bind the logout button
    app.bindLogoutButton();
    //Renew Token
    app.tokenRenewalLoop();
    //Edit Page
    await app.bindLoadPage();
};

window.onload = async function(){
    await _init();
};