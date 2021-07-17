const crud = require('./crud');
const helpers = require('./helpers');
const config = require('../lib/config');

//Assign Object untuk handler
const handlers = {};

handlers.user = function(data, cb){
    const availableMethods = ['get', 'post', 'delete', 'put'];
    availableMethods.indexOf(data.method) > -1 ? handlers._user[data.method](data, cb) : cb(405);
};

handlers.tokens = function(data, cb){
    const availableMethods = ['get', 'post', 'delete', 'put'];
    availableMethods.indexOf(data.method) > -1 ? handlers._tokens[data.method](data, cb) : cb(405);
};

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

    if(!firstName || !lastName || !phone || !password || phone.length > 15|| phone.length < 5|| !tosAgreement ){
        return cb(400, {'Error': 'Missing Required Field'}); 
    };

    firstName.trim();
    lastName.trim();

    handlers._tokens.verifyToken(token, phone, function(valid){
        if(!valid){
            return cb(403, {'Error': 'Invalid Token For user'});
        };
        crud.read('users', phone, function(err, data){
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
                tosAgreement: true
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

    if(!firstName || !lastName || !phone || !password || phone.length > 15|| phone.length < 5){
        return cb(400, {'Error': 'Missing Required Field'}); 
    };

    firstName.trim();
    lastName.trim();

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
        crud.read('user', phone, function(err, data){
            if(err){
                return cb(404, {
                    'Error': 'File User Not Found'
                });
            };
            crud.delete('user', phone, function(err){
                if(err){
                    return cb(500, {'Error': 'Failed on Deleting File'});
                };
                cb(203, {
                    'Message': 'Success on deleting file'
                });
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
                        return res.status(500).json({"Error": "Failed on writing file"})
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
    const method = typeof(data.payload.method) === 'string' ? ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false : false;
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
    const id = typeof(data.payload.id) === 'string' && data.payload.id.length === 20 ? data.payload.id : false;
    if(!id){
        cb(400, {'Error': 'Missing required fields'});
    };
    //Optional Data
    const protocol = typeof(data.payload.protocol) === 'string' ? ['http', 'https'].indexOf(data.payload.protocol.trim()) > -1 ? data.payload.protocol : false : false;
    const url = typeof(data.payload.url) === 'string' ? data.payload.url.trim() : false;
    const method = typeof(data.payload.method) === 'string' ? ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false : false;
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
    const id = typeof(data.queryStringObj.id) === 'string' && data.queryStringObj.id.length === 20 ? data.queryStringObj.id.trim() : false;
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
                            console.log(userData);
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
    cb(200) 
};

handlers.notFound = function(data, cb){
    cb(404);
};



module.exports = handlers;
