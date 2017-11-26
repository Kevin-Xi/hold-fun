const vm = require('vm');

const serv = require('../libs/http-serv');
const conf = require('../libs/config');
const storage = require('../libs/storage')(conf.storage);

const errCodes = require('./error-code');

serv(conf.fun, [
    ['/:id', 'post', run]
]);


const banProxy = new Proxy({}, {
    get: () => new Error('not allowed')
});
function run(params, callback) {
    if (!params.id) return setImmediate(callback, null, { code: errCodes.ParamErr });

    storage.load(params.id, (err, data) => {
        if (err) return callback(err, { code: errCodes.StorageLoadErr });

        const safeContext = vm.createContext({ fs: banProxy });
        try {
            const result = vm.runInNewContext(`(${data.fun})`, safeContext)(...params.args);
            return callback(null, { code: errCodes.Success, data: result });
        } catch (e) {
            return callback(e, { code: errCodes.CallErr });
        }
    })
}