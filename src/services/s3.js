const AWS = require('aws-sdk');

class S3Service {
    constructor(region, acl) {
        this.acl = acl;
        AWS.config.update({ region });
        this.s3 = new AWS.S3();
    }

    async put(namespace, id, key = 'default', object, meta) {
        const Bucket = namespace;  // Using the namespace as the bucket name
        const Key = `${id}/${key}`;
        const Body = Buffer.from(object);
        const params = {
            Bucket,
            Key,
            Body,
            ACL: this.acl,
            Metadata: {
                timestamp: `${Date.now()}`,
                ttl: meta.ttl ? `${meta.ttl}` : '',
                mimeType: meta.mimeType,
                gzip: meta.gzip ? 'true' : 'false'
            }
        };
        try {
            await this.s3.putObject(params).promise();
        } catch (error) {
            console.error('Error uploading to S3:', error);
        }
    }

    async get(namespace, id, key = 'default') {
        const params = {
            Bucket: namespace,
            Key: `${id}/${key}`
        };
        try {
            const data = await this.s3.getObject(params).promise();

            const meta = {
                timestamp: data.Metadata.timestamp,
                ttl: data.Metadata.ttl,
                mimeType: data.Metadata.mimetype,
                gzip: data.Metadata.gzip === "true" ? true : false
            };
            if (!meta.ttl || (Date.now() < parseInt(meta.timestamp) + parseInt(meta.ttl))) {
                return { object: data.Body, meta };
            }
            await this.delete(namespace, id, key); // Auto-delete if expired
        } catch (error) {
            console.error('Error retrieving from S3:', error);
            return null;
        }
        return null;
    }

    async delete(namespace, id, key = 'default') {
        const params = {
            Bucket: namespace,
            Key: `${id}/${key}`
        };
        try {
            await this.s3.deleteObject(params).promise();
        } catch (error) {
            console.error('Error deleting from S3:', error);
        }
    }

    async scan(namespace, id = null, key = null) {
        const params = {
            Bucket: namespace,
            Prefix: id ? `${id}/` : ''
        };
        try {
            const data = await this.s3.listObjectsV2(params).promise();
            const results = [];
            for (let obj of data.Contents) {
                const getObjectParams = {
                    Bucket: namespace,
                    Key: obj.Key
                };
                try {
                    const objData = await this.s3.getObject(getObjectParams).promise();
                    const meta = {
                        timestamp: objData.Metadata.timestamp,
                        ttl: objData.Metadata.ttl,
                        mimeType: objData.Metadata.mimeType,
                        gzip: objData.Metadata.gzip
                    };
                    results.push({ key: obj.Key, object: objData.Body, meta });
                } catch (error) {
                    console.error('Error retrieving metadata for:', obj.Key, error);
                }
            }
            return results;
        } catch (error) {
            console.error('Error scanning S3:', error);
            return [];
        }
    }
}


module.exports = {S3Service};