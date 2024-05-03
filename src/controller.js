
const zlib = require('zlib');
const {newDefaultInMemoryService, FlatFileService, S3Service} = require("./services/index");

class StorageController {
    constructor(engine) {
        this.engine = engine;
    }

    async put(namespace, id, key = 'default', object, meta) {
        let data = object;
        // Handle gzip compression if specified in metadata
        if (meta.gzip) {
            data = await new Promise((resolve, reject) => {
                zlib.gzip(object, (err, buffer) => {
                    if (err) reject(err);
                    else resolve(buffer);
                });
            });
        }
        await this.engine.put(namespace, id, key, data, meta);
    }

    async get(namespace, id, key = 'default') {
        const result = await this.engine.get(namespace, id, key);
        if (result && result.meta.gzip) {
            result.object = await new Promise((resolve, reject) => {
                zlib.gunzip(result.object, (err, buffer) => {
                    if (err) reject(err);
                    else resolve(buffer);
                });
            });
        }
        return result;
    }

    async delete(namespace, id, key = 'default') {
        await this.engine.delete(namespace, id, key);
    }

    async scan(namespace, id = null, key = null) {
        return await this.engine.scan(namespace, id, key);
    }
}

module.exports = {
    StorageController, 
    newInMemoryStorageController: () => {
        return new StorageController(newDefaultInMemoryService());
    },
    newFlatFileStorageController: (basePath) => {
        return new StorageController(new FlatFileService(basePath));
    },
    newS3StorageController: (region = "us-east-1", acl = "private") => {
        return new StorageController(new S3Service(region, acl));
    }
}