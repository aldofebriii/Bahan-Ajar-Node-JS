const asynch = require('async_hooks');
const fs = require('fs');

const targetExecutionContext = false;

const whatTimeIsIt = function(cb){
  setInterval(() => {
    fs.writeSync(1, "When the setIntervalRun, the execution context is " + asynch.executionAsyncId() + "\n");
    cb();
  }, 2000);
};

const asyncHook = asynch.createHook({
  init: function(asyncId, number, type, triggerId, resource){
    fs.writeSync(1, "Hook Init" + asyncId + '\n')
  },
  before: function(asyncId){
    fs.writeSync(1, "Hook Before " + asyncId + '\n');
  },
  after: function(asyncId){
    fs.writeSync(1, "Hook After" + asyncId + '\n');
  },
  destroy: function(asyncId){
    fs.writeSync(1, "Hook Destroy" + asyncId + '\n');
  },
  promiseResolve: function(asyncId){
    fs.writeSync(1, "Hook Promise Resolver never get called on our function" + asyncId + '\n');
  }
});

whatTimeIsIt(function(){
  fs.writeSync(1, "The time is " + Date.now() + '\n');
});
asyncHook.enable();
