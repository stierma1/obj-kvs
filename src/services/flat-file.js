const fs = require('fs').promises;
const path = require('path');

class FlatFileService {
    constructor(basePath) {
        this.basePath = basePath;
        fs.mkdir(basePath, { recursive: true }).catch(console.error);
    }

    async put(namespace, id, key = 'default', object, meta) {
        const dirPath = path.join(this.basePath, namespace, id);
        await fs.mkdir(dirPath, { recursive: true });
        const filePath = path.join(dirPath, `${key}.json`);
        const data = {
            object: Buffer.from(object).toString('base64'),
            meta,
            timestamp: Date.now()
        };
        await fs.writeFile(filePath, JSON.stringify(data));
    }

    async get(namespace, id, key = 'default') {
        const filePath = path.join(this.basePath, namespace, id, `${key}.json`);
        try {
            const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
            if (!data.meta.ttl || (Date.now() < data.timestamp + data.meta.ttl)) {
                return { object: Buffer.from(data.object, 'base64'), meta: data.meta };
            }
            await this.delete(namespace, id, key); // Auto-delete if expired
        } catch (error) {
            return null;
        }
        return null;
    }

    async delete(namespace, id, key = 'default') {
        const filePath = path.join(this.basePath, namespace, id, `${key}.json`);
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }

    async scan(namespace, id = null, key = null) {
        const results = [];
        const namespacePath = path.join(this.basePath, namespace);
        const ids = id ? [id] : await fs.readdir(namespacePath);
        for (let currentId of ids) {
            const idPath = path.join(namespacePath, currentId);
            const files = key ? [`${key}.json`] : await fs.readdir(idPath);
            for (let file of files) {
                const filePath = path.join(idPath, file);
                try {
                    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
                    if (!data.meta.ttl || (Date.now() < data.timestamp + data.meta.ttl)) {
                        results.push({
                            path: filePath,
                            object: Buffer.from(data.object, 'base64'),
                            meta: data.meta
                        });
                    }
                } catch (error) {
                    console.error('Error reading file:', error);
                }
            }
        }
        return results;
    }
}

module.exports = {FlatFileService};