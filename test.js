let {StorageController, newInMemoryStorageController, newFlatFileStorageController, newS3StorageController} = require("./src/controller");

let objectKVS = newInMemoryStorageController();
let fileOjectKVS = newFlatFileStorageController(process.cwd() + "/objkvs_store");
let s3OjectKVS = newS3StorageController("us-west-2", "private");


(async function(){
    let s = await objectKVS.put("prod", "hello", "world", Buffer.from("abc123", "utf8"), {gzip:true})
    let res = await objectKVS.get("prod", "hello", "world");
    console.log(Buffer.from(res.object).toString("utf8"));

    let k = await fileOjectKVS.put("prod", "hello", "world", Buffer.from("abc1234", "utf8"), {gzip:true, mimeType:"plain/text"})
    let resp = await fileOjectKVS.get("prod", "hello", "world");
    console.log(resp)
    console.log(Buffer.from(resp.object).toString("utf8"));

    let j = await s3OjectKVS.put("test.tinspoon.net", "hello", "world", Buffer.from("abc1234", "utf8"), {gzip:true, mimeType:"plain/text"})
    let resp2 = await s3OjectKVS.get("test.tinspoon.net", "hello", "world");
    console.log(resp2)
    console.log(Buffer.from(resp2.object).toString("utf8"));
})()
