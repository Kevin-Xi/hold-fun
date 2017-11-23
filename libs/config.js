let config = {};

try {
    config = require(`../configs/${process.env.NODE_ENV}`);
} catch (e) {
    config = require(`../configs/development`);
}

module.exports = config;
