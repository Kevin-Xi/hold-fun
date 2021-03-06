const assert = require('assert');
const crypto = require('crypto');

const saveToFile = Symbol();
const loadFromFile = Symbol();
const Separator = 2;

class Storage {
    constructor(conf) {
        assert(conf.type);
        assert(conf.uri);
    
        this.config = conf;
        switch (conf.type) {
            case 'file':
                const fs = require('fs');
                try {
                    fs.mkdirSync(conf.uri);
                } catch (e) {
                    if (e.code !== 'EEXIST') throw e;
                }
                this.driver = fs;
                this.save = this[saveToFile];
                this.load = this[loadFromFile];
                break;
            case 'memory':
            case 'redis':
            case 'mongodb':
                throw 'not impl';
            default:
                throw 'storage mismatch';
        }
    }

    [saveToFile](data, callback) {
        const str = JSON.stringify(data);
        const digest = crypto.createHash('sha1').update(str).digest('hex');
        const dirPath = `${this.config.uri}/${digest.slice(0, Separator)}`;
        const filePath = `${dirPath}/${digest.slice(Separator)}`;
    
        this.driver.mkdir(dirPath, err => {
            if (err && err.code !== 'EEXIST') return callback(err);
    
            // check or just overwrite?
            this.driver.open(filePath, 'wx', (err, fd) => {
                if (err && err.code === 'EEXIST') return callback(null, digest);
                if (err) return callback(err);
    
                this.driver.write(fd, str, err => {
                    if (err) return callback(err);
                    return callback(null, digest);
                });
            });
        });
    }

    [loadFromFile](id, callback) {
        this.driver.readFile(`${this.config.uri}/${id.slice(0, Separator)}/${id.slice(Separator)}`, 'utf8', (err, result) => {
            if (err) return callback(err);
            return callback(null, JSON.parse(result));
        });
    }
}

let storage;
module.exports = conf => {
    if (!storage) storage = new Storage(conf);
    return storage;
};