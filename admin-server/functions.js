const storage = require('../libs/storage')();

const errCodes = require('./error-code');

function getList(params, callback) {
    return callback(null, { code: 0, api: 'getAll', params });
}

function add(params, callback) {
    if (params.fun === void 0) return setImmediate(callback, null, { code: errCodes.ParamErr });

    storage.save({ fun: params.fun, doc: params.doc }, (err, id) => {
        if (err) return callback(err, { code: errCodes.StorageSaveErr });
        return callback(null, { code: errCodes.Success, data: id });
    });
}

function get(params, callback) {
    return callback(null, { code: 0, api: 'get', params });
}

module.exports = {
    getList, add, get
};