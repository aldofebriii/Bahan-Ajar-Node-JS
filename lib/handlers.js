const crud = require('./crud');
const helpers = require('./helpers');

//Assign Object untuk handler
const handlers = {};

handlers.user = function(data, cb){
    const availableMethods = ['get', 'post', 'delete', 'put'];
    availableMethods.indexOf(data.method) > -1 ? handlers._user[data.method](data, cb) : cb(405);
};

handlers._user = {};

handlers._user.get = function(data, cb){
};

handlers._user.post = function(data, cb){
    const firstName = data.payload.firstName;
    const lastName = data.payload.lastName;
    const phone = data.payload.phone;
    const password = data.payload.password;
    const tosAgreement = data.payload.tosAgreement;

    if(!firstName || !lastName || !phone || !password || phone.length > 12|| phone.length < 5|| !tosAgreement ){
        return cb(400, {'Error': 'Missing Required Field'}); 
    };

    firstName.trim();
    lastName.trim()

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

handlers._user.delete = function(data, cb){

};

handlers._user.put = function(data, cb){

};

handlers.ping = function(data, cb){
    cb(200) 
};

handlers.notFound = function(data, cb){
    cb(404);
};

module.exports = handlers;
