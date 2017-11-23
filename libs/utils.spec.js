const assert = require('assert');
const urlParse = require('url').parse;

const utils = require('./utils');

describe('utils', function () {
    const routes = [
        [ '/', '*', 1 ],
        [ '/lvl1', 'get', 2 ],
        [ '/lvl1', 'post', 3 ],
        [ '/lvl1/:p2', 'get', 4 ],
        [ '/lvl1/:p2/lvl3', 'get', 5 ],
        [ '/lvl1/:p2/*/lvl4', '*', 6 ]
    ];

    let trie = {};
    before(function (done) {
        trie = utils.trieify(routes);
        // console.log(JSON.stringify(trie, null, 4));
        done();
    });

    const tests = [
        ['/', 'GET', true, 1],
        ['/lvl2', 'POST', false],
        ['/lvl1/p2', 'GET', true, 4, {p2: 'p2'}],
        ['/lvl1/p2', 'PATCH', false],
        ['/lvl1/p2/p3/lvl4', 'GET', true, 6, {p2: 'p2', '*': 'p3'}],
        ['/lvl1/p2/p3/lvl4', 'HEAD', true, 6, {p2: 'p2', '*': 'p3'}],
        ['/lvl1/p2/p3/lvl4/p5', 'GET', false]
    ];

    tests.forEach((test, i) => {
        it(`case ${i}: ${JSON.stringify(test)}`, function (done) {
            let matchRes = utils.matchRoute(trie, urlParse(test[0], true), test[1]);
            assert(matchRes.matched === test[2], 'matched');
            if (test[3]) assert(matchRes.handleFunc === test[3], 'handleFunc');
            if(test[4]) assert.deepEqual(matchRes.params, test[4], 'params')
            done();
        });
    });

    // todo: routes conflict
});
