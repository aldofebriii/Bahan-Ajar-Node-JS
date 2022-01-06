const helpers = require('../lib/helpers');
const assert = require('assert');
const logs = require('../lib/logs');

const unit = {};

unit['helpers.getANumber should return a number'] = function(done){
    const val = helpers.getANumber();
    assert.equal(typeof val, 'number');
    done();
};

unit['helpers.getANumber should return 1'] = function(done){
    const val = helpers.getANumber();
    assert.equal(val, 1);
    done();
};

unit['logs.list should return array and a false error'] = function(done){
    logs.list(true, function(err, fileLists){
        assert.equal(err, false);
        assert.ok(fileLists instanceof Array);
        assert.ok(fileLists.length > 1);
        done();
    });
};

unit['logs.truncate should now throw if the logId did not throw but callback instead'] = function(done){
    assert.doesNotThrow(function(){
        logs.truncate('I do not exits', function(err){
            assert.ok(err);
            done();
        });
    }, TypeError);
};


module.exports = unit;