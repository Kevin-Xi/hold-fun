/**
 * /*-id to store the name of wildcard in pattern
 * /ep-METHOD to store the value of that endpoint
 */

function trieify(routes) {
    const iTrie = {}, iHMap = {}, iPathsMap = {};
    routes.forEach((route, i) => {
        iHMap[i] = route[2];
        const paths = route[0].split('/');
        iPathsMap[i] = paths;

        let parent = iTrie;
        paths.forEach(path => {
            const pathKey = path[0] === ':' ? '*' : path;
            if (!parent[pathKey]) parent[pathKey] = {};
            parent = parent[pathKey];
        });
        const epName = `/ep-${route[1].toUpperCase()}`;
        if (!parent[epName]) parent[epName] = i;
    });
    return { iTrie, iHMap, iPathsMap };
}

function matchRoute(trie, parsed, method) {
    const paths = parsed.pathname.split('/');

    let parent = trie.iTrie;
    let lvl = 0;
    while (lvl < paths.length) {
        const path = paths[lvl];
        lvl++;
        if (parent[path]) {
            parent = parent[path];
        } else if (parent['*']) {
            parent = parent['*'];
        } else {
            return { matched: false };
        }
    }
    if (lvl !== paths.length) {
        return { matched: false };
    }
    let epKey = `/ep-${method}`;
    let iEp = parent[epKey] !== void 0 ? parent[epKey] : parent[`/ep-*`];
    if (iEp === void 0) {
        return { matched: false };
    }

    let params = {};
    trie.iPathsMap[iEp].forEach((path, i) => {
        if (path === '*' || path[0] === ':') {
            const key = path.length === 1 ? path : path.slice(1);
            params[key] = paths[i];
        }
    });

    return {
        matched: true,
        params,
        handleFunc: trie.iHMap[iEp]
    }
}

module.exports = {
    trieify,
    matchRoute
};