//Importing Module
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');
//Container to be exported
const lib = {};

//Base directory dari file ini
lib.baseDir = path.join(__dirname, '/../data/',);

lib.create = function(dir, file, data, cb){
    //Open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', function(err, fd){
        if(!err && fd){
            //Convert fd into string
            const stringData = JSON.stringify(data);
            //Write FIle
            fs.writeFile(fd, stringData, function(err){
                if(!err){
                    fs.close(fd, function(err){
                        if(!err){
                            cb(false)
                        } else {
                            cb('Error Closing a new File')
                        }
                    })
                } else {
                    cb('Errro Writing a new File')
                }
            })
        } else {
            cb('Could not create new file, it may already exist')
        }                                                                                                         
    });
};

lib.read = function(dir, file, cb){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf-8', function(err, data){
        if(err){
          return cb('Error on writing file');  
        };
        const parsedData = helpers.JSONParserCatch(data);
        cb(err, parsedData);
    })
};

lib.update = function(dir, file, data, cb){
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function(err, fd){
        if(err){
            return cb('Failed on opening file, file may not exist yet.')
        };
        const stringData = JSON.stringify(data);
        fs.writeFile(fd, stringData, function(err){
            if(err && !fd){
                return cb('Failed on writing file');
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

lib.delete = function(dir, file, cb){
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
        if(err){
            return cb('Error on deleting File');
        };
        cb(false);
    });
};

module.exports = lib;