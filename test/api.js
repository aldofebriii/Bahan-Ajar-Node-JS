const assert = require('assert');
const app = require('../index');
const http = require('http');
const config = require('../lib/config');

//Holder for API TEST
const api = {};

//Helpers function to make reuqest
const helpers = {};

helpers.getRequest = function(path, cb){
    const req = http.request({
        protocol: 'http:',
        hostname: 'localhost',
        port: config.httpPort,
        method: 'GET',
        path: path,
        headers: {
            'Content-Type': 'application/json'
        }
    }, function(res){
        cb(res);
    });

    req.end();
};

api['app.init should not throw an error'] = function(done){
    assert.doesNotThrow(function(){
        app.init(function(err){
            done();
        });
    }, TypeError);
};

api['/ping should return response status code 200'] = function(done){
    helpers.getRequest('/ping', function(res){
        assert.equal(res.statusCode, 200);
        done();
    });
};

api['/api/user should return 400 when there\'s no phone'] = function(done){
    helpers.getRequest('/api/user', function(res){
        assert.equal(res.statusCode, 400);
        done();
    });
};

// Make a request to a random path
api['A random path should respond to GET with 404'] = function(done){
    helpers.getRequest('/this/path/shouldnt/exist',function(res){
      assert.equal(res.statusCode,404);
      done();
    });
  };

  
  module.exports = api;