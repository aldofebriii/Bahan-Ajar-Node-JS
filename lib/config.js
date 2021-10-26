//Container untuk seluruh enviromments

const environments = {};

environments.staging = {
    httpPort: 1000,
    httpsPort: 1001,
    envName: 'staging',
    hashingSecret: 'This is a secret',
    maxChecks: 5,
    twilio: {
        accountSid : 'AC42dab11491b11d87ca8b98aabbc19684',
        authToken : '4710b6205574a8dda79fb513a28e07b1',
        fromPhone : '+18124146017'
    }
};

environments.production = {
    httpPor: 5000,
    httpsPort: 5001,
    envName: 'production',
    hashingSecret: 'This is also a secret',
    maxChecks: 5,
    twilio: {
        fromPhone: '',
        accountSid: '',
        authToken: ''
    }
};

const currentEnvironment = typeof process.env.NODE_ENV == 'string' ? process.env.NODE_ENV.toLocaleLowerCase(): '';
const environtmentToExport = currentEnvironment ? environments[currentEnvironment] : environments.staging;

module.exports = environtmentToExport;