function getList(params, callback) {
    return callback(null, {api: 'getAll'});
}

function add(params, callback) {
    return callback(null, {api: 'post'});
}

function get(params, callback) {
    return callback(null, {api: 'get'});
}

module.exports = {
    getList, add, get
};