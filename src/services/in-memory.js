class InMemoryService {
    constructor() {
        this.storage = {};
    }

    put(namespace, id, key = 'default', object, meta) {
        const path = this._generatePath(namespace, id, key);
        this.storage[path] = {
            object,
            meta,
            timestamp: Date.now() // Store the time of insertion for TTL handling
        };
        // Set a timeout to handle TTL if provided
        if (meta.ttl) {
            setTimeout(() => {
                this.delete(namespace, id, key);
            }, meta.ttl);
        }
    }

    get(namespace, id, key = 'default') {
        const path = this._generatePath(namespace, id, key);
        const item = this.storage[path];
        // Check if the item exists and if it has expired
        if (item && (!item.meta.ttl || (Date.now() < item.timestamp + item.meta.ttl))) {
            return { object: item.object, meta: item.meta };
        }
        return null; // Return null if not found or expired
    }

    delete(namespace, id, key = 'default') {
        const path = this._generatePath(namespace, id, key);
        delete this.storage[path];
    }

    scan(namespace, id = null, key = null) {
        let results = [];
        Object.keys(this.storage).forEach(path => {
            const [ns, storedId, storedKey] = path.split(':');
            if (ns === namespace && (id === null || id === storedId) && (key === null || key === storedKey)) {
                const item = this.storage[path];
                // Check if the item is still valid (not expired)
                if (!item.meta.ttl || (Date.now() < item.timestamp + item.meta.ttl)) {
                    results.push({
                        path,
                        object: item.object,
                        meta: item.meta
                    });
                }
            }
        });
        return results;
    }

    _generatePath(namespace, id, key) {
        return `${namespace}:${id}:${key}`;
    }
}


module.exports = {InMemoryService};