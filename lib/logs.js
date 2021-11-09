/*
    Library for storing and rotating logs
*/
const fs = require('fs');
const path = require('path');
//Zlib the library to compress file.
const zlib = require('zlib');

const lib = {};
lib.baseDir = path.join(__dirname, '..', 'logs/');

//Append to string to create a file, if file not exist then we create teh file
lib.append = function(fileName, logData, cb){
    fs.open(this.baseDir + fileName + '.log', 'a', function(err, fd){
        //Checking Error
        if(err || !fd){
            return cb("Error Failed on Open File")
        };
        //Appending file
        fs.appendFile(fd, logData + '\n', function(err){
            if(err){
                return cb("Failed on Appending File");
            };
            //Close the stream
            fs.close(fd,  function(err){
                if(err){
                    return cb("Failed on closing file");
                };
                return cb(false);
            });
        });
    });
};

lib.list = function(allData, cb){
    const trimmedFileNames = [];
    fs.readdir(this.baseDir , function(err, data){
        if(err || data.length === 0){
            return cb(err, data);
        };
        data.forEach(filename => {
            //Add the .logs file
            if(filename.indexOf('.log') > -1){
                trimmedFileNames.push(filename.replace('.log', ''));
            };
            //Add .gz.b64 file if allData is true
            if(filename.indexOf('.gz.b64') > -1 && allData){
                trimmedFileNames.push(filename.replace('.gz.b64', ''));
            };

        });
        cb(false, trimmedFileNames);
    });
};

lib.compress = function(logId, newFileId, cb){
    const srcFile = logId + '.log';
    const destinationFile = newFileId + '.gz.b64';
    //Read the source file 
    fs.readFile(this.baseDir + srcFile, 'utf-8', function(err, data){
        if(err || !data){
            return cb("Failed on Reading File");
        };
        zlib.gzip(data, function(err, chunks){
            if(err || !chunks){
                return cb("Failed on gziping file")
            };
            fs.open(lib.baseDir + destinationFile, 'wx', function(err, fd){
                if(err || !fd){
                    return cb("Failed on opening a fd");
                };
                fs.writeFile(fd, chunks.toString('base64'), function(err){
                    if(err){
                        return cb(err);
                    };
                    fs.close(fd, function(err){
                        if(err){
                            return cb(err);
                        };
                        cb(false);
                    });
                });
            });
        });
    });
};

//Decompre the .gz.b64 file into a string again
lib.decompress = function(fileId, cb){
    const fileName = fileId + '.gz.b64';
    fs.readFile(lib.baseDir + fileName, 'utf-8', function(err, str){
        if(err){
            return cb(err);
        };
        const chunks = Buffer.from(str, 'base64');
        zlib.unzip(chunks, function(err, result){
            if(err || !result){
                return cb(err);
            };
            const newStr = result.toString();
            cb(false, newStr);
        });
    });
};

//Truncate the file
lib.truncate = function(logId, cb){
    console.log(lib.baseDir + logId + '.log');
    fs.truncate(lib.baseDir + logId + '.log', 0, function(err){
        if(err){
            return cb(err);
        };
        return cb(false);
    });
};
module.exports = lib;