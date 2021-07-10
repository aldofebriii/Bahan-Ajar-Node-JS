const crud = require('./crud');
const helpers = require('./helpers');

//Assign Object untuk handler
const handlers = {};

handlers.user = function(data, cb){
    const availableMethods = ['get', 'post', 'delete', 'put'];
    availableMethods.indexOf(data.method) > -1 ? handlers._user[data.method](data, cb) : cb(405);
};

handlers._user = {};

// @TODO only 
handlers._user.get = function(data, cb){
    //Validasi terhadap number
    const phone = typeof(data.queryStringObj.phone) === 'string' ? data.queryStringObj.phone.trim() : false;
    if(!phone){
        return cb(400, {
            'Error': 'Missing required fields'
        });
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

};

handlers._user.post = function(data, cb){
    const firstName = data.payload.firstName;
    const lastName = data.payload.lastName;
    const phone = data.payload.phone;
    const password = data.payload.password;
    const tosAgreement = data.payload.tosAgreement;

    if(!firstName || !lastName || !phone || !password || phone.length > 15|| phone.length < 5|| !tosAgreement ){
        return cb(400, {'Error': 'Missing Required Field'}); 
    };

    firstName.trim();
    lastName.trim();

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
};

handlers._user.delete = function(data, cb){
    const phone = typeof(data.queryStringObj.phone) === 'string' ? data.queryStringObj.phone.trim() : false;
    if(!phone){
        return cb(400, {
            'Error': 'Missing required fields'
        });
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
};


handlers.ping = function(data, cb){
    cb(200) 
};

handlers.notFound = function(data, cb){
    cb(404);
};

module.exports = handlers;
