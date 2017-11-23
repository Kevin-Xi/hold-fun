/**
 * /*-id to store the name of wildcard in pattern
 * /ep-METHOD to store the value of that endpoint
 */

function trieify(routes) {
    const trie = {};
    routes.forEach(route => {
        const paths = route[0].split('/');
        let parent = trie;
        paths.forEach(path => {
            const pathname = path[0] === ':' ? '*' : path;
            if (!parent[pathname]) parent[pathname] = {};
            if (pathname === '*' && !parent[pathname]['/*-id']) parent[pathname]['/*-id'] = path.length === 1 ? path : path.slice(1);
            parent = parent[pathname];
        });
        parent[`/ep-${route[1].toUpperCase()}`] = route[2];
    });
    return trie;
}

function matchRoute(routeTrie, parsed, method) {
    const params = {};
    let handleFunc;
    const paths = parsed.pathname.split('/');

    let parent = routeTrie;
    let lvl = 0;
    while (lvl < paths.length) {
        const path = paths[lvl];
        lvl++;
        if (parent[path]) {
            parent = parent[path];
        } else if (parent['*']) {
            const id = parent['*']['/*-id'];
            params[id] = path;
            parent = parent['*'];
        } else {
            return { matched: false };
        }
    }
    if (lvl !== paths.length) {
        return { matched: false };
    }
    handleFunc = parent[`/ep-${method}`] || parent[`/ep-*`];
    if (!handleFunc) {
        return { matched: false };
    }

    return {
        matched: true,
        params,
        handleFunc
    }
}

module.exports = {
    trieify,
    matchRoute
};