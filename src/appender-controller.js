let {StorageController} = require("./controller");
const {newDefaultInMemoryService, FlatFileService, S3Service} = require("./services/index");

class AppenderController {
    constructor(engine) {
        this.storage = new StorageController(engine);
    }

    // Retrieve an object by namespace, id, and key
    async get(namespace, id, key = 'default') {
        return this.storage.get(namespace, id, key);
    }

    // Append a new version and update the default key to point to the latest version
    async append(namespace, id, key, object, meta) {
        // Store the new object version
        await this.storage.put(namespace, id, key, object, meta);

        // Update the default object to point to this latest key
        const pointer = { latestKey: key };
        await this.storage.put(namespace, id, 'default', Buffer.from(JSON.stringify(pointer)), { ...meta, gzip: false });
    }

    // Get the latest version of an object
    async getLatest(namespace, id) {
        const defaultObject = await this.storage.get(namespace, id, 'default');
        if (defaultObject && defaultObject.object) {
            const pointer = JSON.parse(defaultObject.object.toString());
            if (pointer.latestKey) {
                return this.storage.get(namespace, id, pointer.latestKey);
            }
        }
        return null; // If no latest key found, return null
    }

    // Delete an object by namespace, id, and key
    async delete(namespace, id, key = 'default') {
        return this.storage.delete(namespace, id, key);
    }

    // Scan for objects by namespace, id, and key
    async scan(namespace, id = null, key = null) {
        return this.storage.scan(namespace, id, key);
    }
}
module.exports = {
    AppenderController,
    newInMemoryAppenderController: () => {
        return new AppenderController(newDefaultInMemoryService());
    },
    newFlatFileAppenderController: (basePath) => {
        return new AppenderController(new FlatFileService(basePath));
    },
    newS3AppenderController: (region = "us-east-1", acl = "private") => {
        return new AppenderController(new S3Service(region, acl));
    }
};