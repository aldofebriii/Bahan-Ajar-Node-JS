//Container untuk seluruh enviromments

const environments = {};

environments.testing = {
    httpPort: 4000,
    httpsPort: 4001,
    envName: 'staging',
    hashingSecret: 'This is a secret',
    maxChecks: 5,
    twilio: {
        accountSid : 'AC42dab11491b11d87ca8b98aabbc19684',
        authToken : '168a39158d809a9ec006793f8b412a90',
        fromPhone : '+18124146017'
    },
    templateGlobals: {
        appName: 'UpTime Checker',
        companyName: 'NotAShitCompany, Inc',
        yearCreated: '2021',
        baseUrl: 'http://localhost:4000/'
    }
};

environments.staging = {
    httpPort: 1000,
    httpsPort: 1001,
    envName: 'staging',
    hashingSecret: 'This is a secret',
    maxChecks: 5,
    twilio: {
        accountSid : 'AC42dab11491b11d87ca8b98aabbc19684',
        authToken : '168a39158d809a9ec006793f8b412a90',
        fromPhone : '+18124146017'
    },
    templateGlobals: {
        appName: 'UpTime Checker',
        companyName: 'NotAShitCompany, Inc',
        yearCreated: '2021',
        baseUrl: 'http://localhost:1000/'
    }
};

environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: 'production',
    hashingSecret: 'This is also a secret',
    maxChecks: 5,
    twilio: {
        fromPhone: '',
        accountSid: '',
        authToken: ''
    },
    templateGlobals: {
        appName: 'UpTime Checker',
        companyName: 'NotAShitCompany, Inc',
        yearCreated: '2021',
        baseUrl: 'https://localhost:5001/'
    }
};

const currentEnvironment = typeof process.env.NODE_ENV == 'string' ? process.env.NODE_ENV.toLocaleLowerCase(): '';
const environtmentToExport = currentEnvironment ? environments[currentEnvironment] : environments.staging;

module.exports = environtmentToExport;