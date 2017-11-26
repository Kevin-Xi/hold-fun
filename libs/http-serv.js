const http = require('http');
const urlParse = require('url').parse;
const assert = require('assert');

const utils = require('./utils');

function serve(config, routes) {
    assert(typeof config === 'object' && isArrayObject(routes));

    // set up with config
    let { port, logger } = config;
    port = port || 8080;
    logger = logger || console;
    assert(logger.info && logger.error);
    const logWrap = {};
    ['info', 'error'].forEach(l => {
        logWrap[l] = log => {
            const incomingTs = `${log.t0.toLocaleDateString()} ${log.t0.toLocaleTimeString()}`;
            const td = Date.now() - log.t0;
            logger[l](`[${l.toUpperCase()}][${incomingTs}][${td}ms]: ${log.req} -d ${log.data}: ${log.code} - ${log.msg || ''}`);
        }
    });

    // set up with routes
    const routeTrie = utils.trieify(routes);

    function handler(req, res) {
        const log = {
            t0: new Date(),
            req: `${req.method} ${req.url}`
        };

        const parsed = urlParse(req.url, true);
        const matchRes = utils.matchRoute(routeTrie, parsed, req.method);
        if (!matchRes.matched) {
            res.statusCode = 404;
            log.code = 404;
            logWrap.info(log);
            return res.end();
        }

        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });

        req.on('end', () => {
            log.data = data;
            let body = {};
            if (data.length) {
                try {
                    body = JSON.parse(data);
                } catch (e) {
                    res.statusCode = 400;
                    log.code = 400;
                    logWrap.info(log);
                    return res.end();
                }
            }
            matchRes.handleFunc(Object.assign({}, parsed.query, matchRes.params, body), (err, result) => {
                log.code = result.code;
                if (err) {
                    res.statusCode = 500;
                    log.msg = err.stack || err;
                    logWrap.error(log);
                    return res.end();
                }

                res.setHeader('Content-Type', 'application/json');
                logWrap.info(log);
                return res.end(JSON.stringify(result));
            });
        });
    }

    const server = http.createServer(handler);
    server.listen({ port }, () => {
        logger.info(`server listening on ${port}`);
    });
    server.on('error', err => { throw err; });
}

// helpers

function isArrayObject(obj) {
    return typeof obj === 'object' && Number.isSafeInteger(obj.length) && obj.length >= 0;
}

module.exports = serve;
