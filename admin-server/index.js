const serv = require('../libs/http-serv');
const config = require('../libs/config').admin;

const functions = require('./functions');

serv(config, [
    ['/functions', 'get', functions.getList],
    ['/functions', 'post', functions.add],
    ['/functions/:id', 'get', functions.get]
]);
