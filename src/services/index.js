let {InMemoryService} = require("./in-memory");
let {FlatFileService} = require("./flat-file");
let {S3Service} = require("./s3");

module.exports = {
    InMemoryService,
    FlatFileService,
    S3Service,
    newDefaultInMemoryService: () => {
        return new InMemoryService();
    },
    newDefaultFlatFileService: () => {
        return new FlatFileService(process.cwd() + "/objkvs_store");
    },
    newDefaultS3Service: () => {
        return new S3Service("us-east-1", "private");
    }
}