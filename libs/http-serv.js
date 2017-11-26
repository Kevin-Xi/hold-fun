const http = require('http');
const urlParse = require('url').parse;

const utils = require('./utils');

function serve(config, routes) {
    const routeTrie = utils.trieify(routes);

    function handler(req, res) {
        const parsed = urlParse(req.url, true);
        const matchRes = utils.matchRoute(routeTrie, parsed, req.method);
        if (!matchRes.matched) {
            res.statusCode = 404;
            return res.end();
        }

        'todo: trace'
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });

        req.on('end', () => {
            let body = {};
            if (data.length) {
                try {
                    body = JSON.parse(data);
                } catch (e) {
                    res.statusCode = 400;
                    return res.end();
                }
            }
            matchRes.handleFunc(Object.assign({}, parsed.query, matchRes.params, body), (err, result) => {
                if (err) {
                    res.statusCode = 500;
                    return res.end();
                }

                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify(result));
            });
        });
    }

    const server = http.createServer(handler);
    server.listen(config, () => {
        console.log(`server listening on ${config.port || 'default port'}`);
    });
    server.on('error', err => { throw err; });
}

module.exports = serve;
