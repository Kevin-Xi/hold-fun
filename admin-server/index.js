const serv = require('../libs/http-serv');
const conf = require('../libs/config');
const storage = require('../libs/storage')(conf.storage);

const functions = require('./functions');

serv(conf.admin, [
    ['/functions', 'get', functions.getList],
    ['/functions', 'post', functions.add],
    ['/functions/:id', 'get', functions.get]
]);
