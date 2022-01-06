const unitTest = require('./unit');
const apiTest = require('./api');
/* 
    Test Runner
*/

//Enable node_env
process.env.NODE_ENV = 'testing';
//Application logic
const _app = {};
//Container for the test

_app.tests = {};

_app.tests.unit = unitTest;
_app.tests.api = apiTest;

_app.countTests = function(){
    let counter = 0;
    for(let key in _app.tests){
        if(_app.tests.hasOwnProperty(key)){
            const subTests = _app.tests[key];
            for(testName in subTests){
                if(subTests.hasOwnProperty(testName)){
                    counter++;  
                };
            };
        };
    };
    return counter;
};

_app.produceTestReport = function(limit, successes, error){
    console.log("");
    console.log("------------BEGIN TEST REPORT------------");
    console.log("");
    console.log("Total Test : ", limit);
    console.log("Pass :", successes);
    console.log("Fail : " , error.length);
    console.log("");

    //Jika ada error maka kita akan menampilan detail jiak tidak maka diberitahunkan kita lolos seluruh test
    if(error.length > 0){
        console.log("------------BEGIN ERROR DETAIL------------");
        console.log("");

        for(err of error){
            console.log('\x1b[31m%s\x1b[0m', err.name);
            console.log(err.error);
            console.log("");
        };
        console.log("");
        console.log("------------END ERROR DETAIL------------");
    };
    console.log("------------END TEST REPORT------------");
};

_app.runTest = function(){
    const error = [];
    let successes = 0;
    const limit = _app.countTests();
    let counter = 0;
    for(let key in _app.tests){ 
        const subTests = _app.tests[key];
        for(testName in subTests){
            (function(){
                const outputTestName = testName;
                const testValue = subTests[testName];
                //Call the function in try and catch
                try {
                    testValue(function(){
                        //Test successed
                        console.log('\x1b[32m%s\x1b[0m', outputTestName);
                        counter++;
                        console.log(outputTestName, counter);
                        successes++;

                        if(counter === limit){
                            _app.produceTestReport(limit, successes, error);
                        };
                    });

                } catch(err){
                    error.push({
                        name: outputTestName,
                        error: err      
                    });
                    counter++;
                    console.log('\x1b[31m%s\x1b[0m', outputTestName);
                    if(counter === limit){
                        _app.produceTestReport(limit, successes, error);
                    };
                };
            })();
        };
    };
};

//Run the test
_app.runTest();