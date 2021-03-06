const crud = require('./crud');
const helpers = require('./helpers');
const config = require('../lib/config');
const dns = require('dns');

//Assign Object untuk handler
const handlers = {};

/* 
    *
        Below this all the HTML Handler
    * 
*/
handlers.index = function(data, cb){
    //If the method is other than GET 
    if(data.method !== 'get'){
        return cb(405, null, 'HTML');
    };
    //Prepare data for interpolation
    const templateData = {
        'head.title': 'Uptime MOnitoring - Made Simple',
        'head.description': 'We Offer Free, simple uptime monitoring for HTTP sites of all kind. When your site goes down, we \'ll send you a text to let you know',
        'body.class': 'index'
    }
    //Using helpers to get bunch of HTML file
    helpers.getTemplate('index', templateData, function(err, strIndex){
        if(err || !strIndex){
            return cb(500, null, 'HTML');
        };
        helpers.addUniversalTemplates(strIndex, templateData, function(err, joinedStr){
            if(err || !joinedStr){
                return cb(500, null, 'HTML');
            };

            return cb(200, joinedStr, 'HTML');
        });
    });
};

handlers.accountCreate = function(data, cb){
    //If the method is other than GET 
    if(data.method !== 'get'){
        return cb(405, null, 'HTML');
    };
    //Prepare data for interpolation
    const templateData = {
        'head.title': 'Create And Account',
        'head.description': 'Signup is  easy and only takes a few seconds',
        'body.class': 'accountCreate'
    }
    //Using helpers to get bunch of HTML file
    helpers.getTemplate('accountCreate', templateData, function(err, strIndex){
        if(err || !strIndex){
            return cb(500, null, 'HTML');
        };
        helpers.addUniversalTemplates(strIndex, templateData, function(err, joinedStr){
            if(err || !joinedStr){
                return cb(500, null, 'HTML');
            };

            return cb(200, joinedStr, 'HTML');
        });
    });
};
//Create new session after the user has been login
handlers.sessionCreate = function(data, cb){
    //If the method is other than GET 
    if(data.method !== 'get'){
        return cb(405, null, 'HTML');
    };
    //Prepare data for interpolation
    const templateData = {
        'head.title': 'Login to your account',
        'head.description': 'Phone Number and Password to Login',
        'body.class': 'sessionCreate'
    }
    //Using helpers to get bunch of HTML file
    helpers.getTemplate('sessionCreate', templateData, function(err, strIndex){
        if(err || !strIndex){
            return cb(500, null, 'HTML');
        };
        //Get the sessionCreate template
        helpers.addUniversalTemplates(strIndex, templateData, function(err, joinedStr){
            if(err || !joinedStr){
                return cb(500, null, 'HTML');
            };

            return cb(200, joinedStr, 'HTML');
        });
    });
};

//Create new session after the user has been login
handlers.sessionDelete = function(data, cb){
    //If the method is other than GET 
    if(data.method !== 'get'){
        return cb(405, null, 'HTML');
    };
    //Prepare data for interpolation
    const templateData = {
        'head.title': 'Logout Your Account',
        'head.description': 'Your Account Has been Loggetout',
        'body.class': 'sessionDelete'
    }
    //Using helpers to get bunch of HTML file
    helpers.getTemplate('sessionDeleted', templateData, function(err, strIndex){
        if(err || !strIndex){
            return cb(500, null, 'HTML');
        };
        //Get the sessionCreate template
        helpers.addUniversalTemplates(strIndex, templateData, function(err, joinedStr){
            if(err || !joinedStr){
                return cb(500, null, 'HTML');
            };

            return cb(200, joinedStr, 'HTML');
        });
    });
};

//Edit your Account
handlers.accountEdit = function(data, cb){
    //If the method is other than GET 
    if(data.method !== 'get'){
        return cb(405, null, 'HTML');
    };
    //Prepare data for interpolation
    const templateData = {
        'head.title': 'Edit Your Account',
        'body.class': 'Account Edit'

    };
    //Using helpers to get bunch of HTML file
    helpers.getTemplate('accountEdit', templateData, function(err, strIndex){
        if(err || !strIndex){
            return cb(500, null, 'HTML');
        };
        //Get the sessionCreate template
        helpers.addUniversalTemplates(strIndex, templateData, function(err, joinedStr){
            if(err || !joinedStr){
                return cb(500, null, 'HTML');
            };

            return cb(200, joinedStr, 'HTML');
        });
    });
};

handlers.checkCreate = function(data, cb){
    if(data.method !== 'get'){
        return cb(405, null, 'HTML');
    };
    //Prepare data for interpolation
    const templateData = {
        'head.title': 'Create A New Check',
        'body.class': 'checkCreate'
    };

    //Using helpers to get bunch of HTML file
    helpers.getTemplate('checkCreate', templateData, function(err, strIndex){
        if(err || !strIndex){
            return cb(500, null, 'HTML');
        };
        //Get the sessionCreate template
        helpers.addUniversalTemplates(strIndex, templateData, function(err, joinedStr){
            if(err || !joinedStr){
                return cb(500, null, 'HTML');
            };

            return cb(200, joinedStr, 'HTML');
        });
    });
};

handlers.checkEdit = function(data, cb){
    if(data.method !== 'get'){
        return cb(405, null, 'HTML');
    };
    //Prepare data for interpolation
    const templateData = {
        'head.title': 'Edit A Check',
        'body.class': 'checkEdit'
    };

    //Using helpers to get bunch of HTML file
    helpers.getTemplate('checkEdit', templateData, function(err, strIndex){
        if(err || !strIndex){
            return cb(500, null, 'HTML');
        };
        //Get the sessionCreate template
        helpers.addUniversalTemplates(strIndex, templateData, function(err, joinedStr){
            if(err || !joinedStr){
                return cb(500, null, 'HTML');
            };

            return cb(200, joinedStr, 'HTML');
        });
    });
};

handlers.checkList = function(data, cb){
     //If the method is other than GET 
     if(data.method !== 'get'){
        return cb(405, null, 'HTML');
    };
    //Prepare data for interpolation
    const templateData = {
        'head.title': 'Dashboard',
        'body.class': 'checkList'

    };
    //Using helpers to get bunch of HTML file
    helpers.getTemplate('checkList', templateData, function(err, strIndex){
        if(err || !strIndex){
            return cb(500, null, 'HTML');
        };
        //Get the sessionCreate template
        helpers.addUniversalTemplates(strIndex, templateData, function(err, joinedStr){
            if(err || !joinedStr){
                return cb(500, null, 'HTML');
            };

            return cb(200, joinedStr, 'HTML');
        });
    });
};

/* 
    Serving static asset on app
*/
handlers.public = function(data, cb){
    //Reject any request yang bukan get
    if(data.method !== 'get'){
        return cb(405, null, 'HTML');
    };
    // Get the filename from the path and replace the public path + trim it in.
    const trimmedFileName = data.path.replace('public/', '').trim();
    if(trimmedFileName.length <= 0){
        return cb(400);
    };
    helpers.getStaticAsset(trimmedFileName, function(err, data){
        if(err || !data){
            return cb(500);
        };
        //Set the content type : plain atau png atau js atau css tergantung pada extension file masing masing
        let contentType = trimmedFileName.split('.')[1].toUpperCase();
        return cb(200, data, contentType);
    });
    
};

/*
    Serving static favicon.ico
*/
handlers.favicon = function(data, cb){
    if(data.method !== 'get'){
        return cb(405, null, 'HTML');
    };

    helpers.getStaticAsset('favicon.ico', function(err, data){
        if(err || !data){
            return cb(500);
        };
        return cb(200, data, 'favicon');
    });
};



/*
    * 
        Below this all the JSON API Handler
    *
*/

/* User Handler */
handlers.user = function(data, cb){
    const availableMethods = ['get', 'post', 'delete', 'put'];
    availableMethods.indexOf(data.method) > -1 ? handlers._user[data.method](data, cb) : cb(405);
};
/* Tokens Handler */
handlers.tokens = function(data, cb){
    const availableMethods = ['get', 'post', 'delete', 'put'];
    availableMethods.indexOf(data.method) > -1 ? handlers._tokens[data.method](data, cb) : cb(405);
};
/* Checks Handler */
handlers.checks = function(data, cb){
    const availableMethods = ['get', 'post', 'delete', 'put'];
    availableMethods.indexOf(data.method) > -1 ? handlers._checks[data.method](data,cb) : cb(405);
};

handlers._user = {};
handlers._tokens = {};
handlers._checks = {};

// @TODO only 
handlers._user.get = function(data, cb){
    //Verify token
    const phone = typeof(data.queryStringObj.phone) === 'string' ? data.queryStringObj.phone.trim() : false;
    const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
    //Validasi terhadap token
    if(!token){
        return cb(400, {'Error': 'Missing required fields'});
    };
    //Validasi terhadap telephone
    if(!phone){
        return cb(400, {
            'Error': 'Missing required fields'
        });
    };

    handlers._tokens.verifyToken(token, phone, function(valid){
        if(!valid){
            return cb(403, {'Error': 'Invalid token for user'})
        };
        crud.read('user', phone, function(err, data){
            if(err){
                return cb(404, {
                    'Error': 'File User Not Found'
                });
            };
            delete data.password;
            cb(200,data);
        });
    });    

};

handlers._user.post = function(data, cb){
    const firstName = data.payload.firstName;
    const lastName = data.payload.lastName;
    const phone = data.payload.phone;
    const password = data.payload.password;
    const tosAgreement = data.payload.tosAgreement;
    const token = data.headers.token;
    console.log(data.payload);
    if(!firstName || !lastName || !phone || !password || phone.length > 15|| phone.length < 5|| !tosAgreement ){
        return cb(400, {'Error': 'Missing Required Field'}); 
    };

    firstName.trim();
    lastName.trim();

    handlers._tokens.verifyToken(token, phone, function(valid){
        if(!valid){
            return cb(403, {'Error': 'Invalid Token For user'});
        };
        crud.read('user', phone, function(err, data){
            //Jika tidak error berarti file telah ada.
            if(!err){
                return cb(400, {'Error': 'Telephone Number already exists'})
            };
            //Jika error maka belum ada filenya.
            const hashedPassword = helpers.hash(password);
            if(!hashedPassword){
                return cb(500, {'Error' : 'Failed on Hashing Password'});
            };
    
            const userDataObj = {
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                password: hashedPassword,
                tosAgreement: true,
                checks: []
            };
    
            crud.create('user', userDataObj.phone, userDataObj, function(err){
                if(err){
                    return cb(500, {'Error': 'Failed on creating json file'});
                };
                return cb(200);
            });
        });
    });
};

handlers._user.put = function(data, cb){
    //Finding Phone
    const phone = typeof(data.payload.phone) === 'string' ? data.payload.phone.trim() : false;
    if(!phone){
        return cb(400, {
            'Error': 'Missing required files'
        });
    };
    //Payload for updating data
    const firstName = data.payload.firstName;
    const lastName = data.payload.lastName;
    const password = data.payload.password;

    if(firstName || lastName){
        firstName.trim();
        lastName.trim();   
    };

    const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
    //Validasi terhadap token
    if(!token){
        return cb(400, {'Error': 'Missing required fields'});
    };

    handlers._tokens.verifyToken(token, phone, function(valid){
        if(!valid){
            return cb(403, {'Error': 'Invalid token for user'});
        };
        //First we try to find the data
        crud.read('user', phone, function(err, data){
            if(!err && data){
                if(firstName){
                    data.firstName = firstName;
                };
                if(lastName){
                    data.lastName = lastName;
                };
                if(password){
                    data.password = helpers.hash(password);
                };

                crud.update('user', phone, data, function(err){
                    if(err){
                        console.log(err);
                        cb(500, {'Error' : 'Failed on updating data'})
                    };
                    cb(201, data);
                });

            } else {
                cb(404, {'Error': 'User not found'});
            }''
        });
    });

};
// @TODO => delete all related data on user
handlers._user.delete = function(data, cb){
    const phone = typeof(data.queryStringObj.phone) === 'string' ? data.queryStringObj.phone.trim() : false;
    if(!phone){
        return cb(400, {
            'Error': 'Missing required fields'
        });
    };
    const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
    //Validasi terhadap token
    if(!token){
        return cb(400, {'Error': 'Missing required fields'});
    };
    handlers._tokens.verifyToken(token, phone, function(valid){
        if(!valid){
            return cb(403, {'Error': 'Invalid token for user'});
        };
        crud.read('user', phone, function(err, userData){
            if(err){
                return cb(404, {
                    'Error': 'File User Not Found'
                });
            };
            crud.delete('user', phone, function(err){
                if(err){
                    return cb(500, {'Error': 'Failed on Deleting File'});
                };
                const userChecks = userData.checks.length > 0 && userData.checks instanceof Array ? userData.checks : [];
                let error = false;
                if(userChecks.length > 1){
                    for(let i = 0; i < userChecks.length; i++){
                        crud.delete('checks', userChecks[i], function(err){
                            if(err){
                               error = true;
                            };
                        });
                    };
                };
                if(error){
                    return cb(500, {'Error': 'Failed on deleting all user checks'});
                };
                return cb(203);
            });
        });
    });
};

handlers._tokens.post = function(data, cb){
    const phone = typeof(data.payload.phone) == 'string' ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.phone) == 'string' ? data.payload.password.trim() : false;
    if(phone && password){
        crud.read('user', phone, function(err, data){
            if(err){
                return cb(404, {
                    "Error": "Couldn't find the user data "
                });
            };
            const hashedPassword = helpers.hash(password);

            if(data.password === hashedPassword){
                const tokenId = helpers.createRandomString(20);
                const expires = Date.now() + 1000*60*60;
                const tokenObj = {
                    id: tokenId,
                    phone: phone,
                    expires: expires
                };
                crud.create('tokens', tokenId, tokenObj, function(err){
                    if(err){
                        console.log(err);
                        return cb(500,{"Error": "Failed on writing file"});
                    };
                    cb(201, tokenObj);
                });
            } else{
                return cb(403, {"Error": "Password did not match the specified user"})
            }
        })
    } else {
        cb(400, {
            "Error": "Missing required file"
        });
    };
};

//Lebih ke untuk menambahkan durasi
handlers._tokens.get = function(data, cb){
    const id = typeof(data.queryStringObj.id) === 'string' && data.queryStringObj.id.trim().length === 20 ? data.queryStringObj.id : false;
    if(id){ 
        //Lookup the tokens
        crud.read('tokens', id, function(err, data){
            if(!err && data){
                cb(200, data);
            } else {
                cb(404, {'Error': 'Token not found'})
            }
        });
    } else {
        cb(400, {'Error': 'Missing required Fields'})
    }
};

handlers._tokens.put = function(data, cb){
    //id token
    const id = typeof(data.payload.id) === 'string' ? data.payload.id : false;
    //boolean extend
    const extend = typeof(data.payload.extend) === 'boolean' ? data.payload.extend : false;
    if(id && extend){
        //read the dir
        crud.read('tokens', id, function(err, data){
            if(!err && data){
                //Check the expired
                if(data.expires > Date.now()){
                    data.expires = Date.now() + 1000*60*60;

                    crud.update('tokens', id, data, function(err){
                        if(!err){
                            return cb(201, data);
                        };
                        return cb(500, {'Error': 'Failed on writing update data'})
                    });
                } else {
                    cb(400, {'Error': 'The token already expired'})
                }
            } else {
                console.log(err, data);
                cb(404, {'Error': 'Token Not Found'})
            }
        });
    } else {
        cb(400, {'Error': 'Missing required fields'})
    }
};

handlers._tokens.delete = function(data,cb){
    //id token
    const id = typeof(data.queryStringObj.id) === 'string' ? data.queryStringObj.id : false;
    if(id){
        crud.read('tokens', id, function(err, data){
            if(!err && data){
                crud.delete('tokens', data.id, function(err){
                    if(!err){
                        return cb(203);
                    };
                    return cb(500, {'Error': 'Failed on deleting'});
                })
            } else {
                cb(404, {'Error' : 'Token not found'})
            }
        });
    } else {
        cb(400, {'Error': 'Missing required fields'})
    }
};



handlers._tokens.verifyToken = function(id, phone, cb){
    crud.read('tokens', id, (err, data)=> {
        if(!err && data){
            //Check if data token phone sama dengan phone dari parameter
            if(data.phone === phone && data.expires > Date.now()){
                cb(true);
            } else {
                cb(false);
            }
        } else {
            cb(400, {'Error': 'Missing required fields'})
        }
    });
};

//data yang akan digunakan ada protocol, url, method, successCode, timeout to try again
handlers._checks.post = function(data, cb){
    const protocol = typeof(data.payload.protocol) === 'string' ? ['http', 'https'].indexOf(data.payload.protocol.trim()) > -1 ? data.payload.protocol : false : false;
    const url = typeof(data.payload.url) === 'string' ? data.payload.url.trim() : false;
    const method = typeof(data.payload.httpMethod) === 'string' ? ['get', 'post', 'put', 'delete'].indexOf(data.payload.httpMethod.toLowerCase()) > -1 ? data.payload.httpMethod : false : false;
    const successCodes = data.payload.successCodes.length > 0 ? data.payload.successCodes instanceof Array ? data.payload.successCodes : false : false;
    const timeoutSeconds = typeof(data.payload.timeoutSeconds) === 'number' ? data.payload.timeoutSeconds % 1 === 0 ? data.payload.timeoutSeconds : false : false;

    if(!protocol || !url || !method || !successCodes || !timeoutSeconds ){
        return cb(400, {'Error' : 'Missing required fields'});
    };
    //Get Token
    const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
    

    //Look up user
    crud.read('tokens', token, function(err, tokenData){
        if(!err && tokenData){
            const userPhone = tokenData.phone;
            //Verified the user
            crud.read('user', userPhone, function(err, userData){
                if(!err && userData){
                    //Init checks array if there's no checks array on userData obj
                    const userChecks = userData.checks instanceof Array ? userData.checks: [];
                    //Verify we only allow user to have 5 user maxed
                    if(userChecks.length >= config.maxChecks){
                        return cb(403, {'Error': `Max check has been reached out (${config.maxChecks})`})
                    };

                    //Validate the url
                    let hostUrl;
                    try {
                        const checkUrl = new URL(`${protocol}://${url}`);
                        hostUrl = checkUrl.host;

                    } catch(err){
                        return cb(400, {'Error': 'Invalid URL'});
                    };
                    dns.resolve(hostUrl, function(err, records){
                        if(err || !records){
                            return cb(400, {'Error': 'Invalid URL Failed on checking DNS'});
                        };
                        //Payload with random id
                        const checkPayload = {
                            id: helpers.createRandomString(20),
                            userPhone: userPhone,
                            protocol: protocol, 
                            url: url,
                            method: method,
                            successCodes: successCodes,
                            timeoutSeconds: timeoutSeconds
                        };

                        //Save the Object
                        crud.create('checks', checkPayload.id, checkPayload, function(err){
                            if(err){
                                return cb(500, {'Error': 'Failed on writing checks file'});
                            };
                            userData.checks = userChecks;
                            userData.checks.push(checkPayload.id);

                            //Save the user data too
                            crud.update('user', userPhone, userData, function(err){
                                if(err){
                                    return cb(500, {'Error': 'Failed on writing check file'});
                                };
                                return cb(200, checkPayload);
                            });
                        });
                    });
                }
            });
        } else {
            cb(403);
        };
    });
};

handlers._checks.get = function(data, cb){
    //get the id from query
    const id = typeof(data.queryStringObj.id) === 'string' && data.queryStringObj.id.length === 20 ? data.queryStringObj.id.trim() : false;
    if(!id){
        return cb(400, {'Error': 'Missing Required Fields'});
    };
    //read the checks data
    crud.read('checks', id, function(err, checkData){
        if(!err && checkData){
            const userPhone = checkData.userPhone;
            const token = typeof(data.headers.token) === 'string' ? data.headers.token.trim() : false;
            handlers._tokens.verifyToken(token, userPhone, function(isValid){
                if(!isValid){
                    return cb(403);
                };
                return cb(200, checkData);
            });
        } else {
            return cb(404, {'Error': 'Checks does not exist'});
        };
    });
};

handlers._checks.put = function(data, cb){
    //Id form payload
    const id = typeof(data.payload.uid) === 'string' && data.payload.uid.length === 20 ? data.payload.uid : false;
    if(!id){
        return cb(400, {'Error': 'Missing required fields'});
    };
    //Optional Data
    const protocol = typeof(data.payload.protocol) === 'string' ? ['http', 'https'].indexOf(data.payload.protocol.trim()) > -1 ? data.payload.protocol : false : false;
    const url = typeof(data.payload.url) === 'string' ? data.payload.url.trim() : false;
    const method = typeof(data.payload.httpMethod) === 'string' ? ['get', 'post', 'put', 'delete'].indexOf(data.payload.httpMethod.toLowerCase()) > -1 ? data.payload.httpMethod : false : false;
    const successCodes = data.payload.successCodes.length > 0 ? data.payload.successCodes instanceof Array ? data.payload.successCodes : false : false;
    const timeoutSeconds = typeof(data.payload.timeoutSeconds) === 'number' ? data.payload.timeoutSeconds % 1 === 0 ? data.payload.timeoutSeconds : false : false;

    //if one of them is true or there's a data
    if(protocol || url || method || successCodes || timeoutSeconds){
        crud.read('checks', id, function(err, checkData){
            if(!err && checkData){
                const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
                handlers._tokens.verifyToken(token, checkData.userPhone, function(isValid){
                    if(!isValid){
                        return cb(403);
                    };
                    //Validation on token is success and now we're going to update the data
                    if(protocol){
                        checkData.protocol = protocol;
                    };
                    if(url){
                        checkData.url = url;
                    };
                    if(method){
                        checkData.method = method;
                    };
                    if(successCodes){
                        checkData.successCodes = successCodes;
                    };
                    if(timeoutSeconds){
                        checkData.timeoutSeconds = timeoutSeconds;
                    };
                    //Save the data
                    crud.update('checks', checkData.id, checkData, function(err){
                        if(err){
                            return cb(500, {'Error' : 'Failed on updating data'});
                        };
                        return cb(201, checkData);
                    });
                });
            } else {    
                cb(404, {'Error': 'Checks File not Found'});
            }
        });
    } else {
        cb(400, {'Error': 'Missing required fields'})
    }
};

handlers._checks.delete = function(data, cb){
    const id = typeof(data.queryStringObj.uid) === 'string' && data.queryStringObj.uid.length === 20 ? data.queryStringObj.uid.trim() : false;
    if(!id){
        return cb(400, {'Error': 'missing required fields'})
    };
    crud.read('checks', id, function(err, checkData){
        if(!err && checkData){
            const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
            if(!id || !token){
                return cb(400, {'Erorr': 'Missing required fields'});
            };
            handlers._tokens.verifyToken(token, checkData.userPhone, function(isValid){
                if(!isValid){
                    return cb(403);
                };
                crud.read('user', checkData.userPhone, function(err, userData){
                    if(!err && userData){
                        const userChecks = userData.checks instanceof Array ? userData.checks: [];
                        crud.delete('checks', checkData.id, function(err){
                            if(err){
                                return cb(500);
                            };
                            const checkIndex = userChecks.indexOf(checkData.id);
                            userChecks.splice(checkIndex, 1);
                            crud.update('user', userData.phone, userData, function(err){
                                if(err){
                                    return cb(500);
                                };
                                return cb(203);
                            });
                        });

                    } else {
                        cb(404);
                    };
                });
            });
        } else{
            cb(404, {'Error': 'Failed on reading checks file'})
        }
    });

};

handlers.ping = function(data, cb){
    cb(200, {msg: "Success"}) 
};

handlers.notFound = function(data, cb){
    cb(404);
};

handlers.exampleErr = function(data, cb){
    const err = new Error("This is an example error");
    throw err;
};


module.exports = handlers;
