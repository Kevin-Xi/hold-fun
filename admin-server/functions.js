function getList(params, callback) {
    return callback(null, { api: 'getAll', params });
}

function add(params, callback) {
    return callback(null, { api: 'post', params });
}

function get(params, callback) {
    return callback(null, { api: 'get', params });
}

module.exports = {
    getList, add, get
};