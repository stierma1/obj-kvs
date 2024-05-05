#!/usr/bin/env node

const { program } = require('commander');
const { newInMemoryAppenderController, newFlatFileAppenderController, newS3AppenderController, newInMemoryStorageController, newFlatFileStorageController, newS3StorageController} = require('./index');
const fs = require('fs');

program
  .option('--type <type>', 'API type (appender or storage)')
  .option('--service <service>', 'Storage service (InMemory, FlatFile, S3)')
  .requiredOption('--namespace <namespace>', 'Namespace for the storage')
  .requiredOption('--id <id>', 'Identifier for the object')
  .requiredOption('--action <action>', 'Action to perform (getLatest, put, append, get, delete)')
  .option('--file <file>', 'File path for put/append actions')
  .option('--gzip', 'Enable gzip compression')
  .option('--mimetype <mimetype>', 'MIME type for the object')
  .option('--S3ACL <S3ACL>', 'S3 ACL policy')
  .option('--S3region <S3region>', 'S3 region')
  .option('--key <key>', 'optional storage key');

program.parse(process.argv);

const options = program.opts();

// Initialize the appropriate engine based on the service option
let storage;
let appender;
switch (options.service || "InMemory") {
  case 'S3':
      if(options.type === "appender"){
        appender = newS3AppenderController(options.S3region || "us-west-2", options.S3ACL || 'private');
      } else {
        storage = newS3StorageController(options.S3region || "us-west-2", options.S3ACL || 'private');
      }
    break;
  case 'file':
  case 'FlatFile':
    if(options.type === "appender"){
        appender = newFlatFileAppenderController(process.cwd());
    } else {
        storage = newFlatFileStorageController(process.cwd());
    }
    break;
  case 'InMemory':
      //Useful for basic testing
    if(options.type === "appender"){
        appender = newInMemoryAppenderController();
    } else {
        storage = newInMemoryStorageController();
    }
    break;
  default:
    
    console.error('Invalid service type');
    process.exit(1);
}



async function main() {
  try {
    switch (options.type || "storage") {
      case 'appender':
        await handleAppenderActions();
        break;
      case 'storage':
        await handleStorageActions();
        break;
      default:
        console.error('Invalid type');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function handleAppenderActions() {
  switch (options.action) {
    case 'getLatest':
      const latest = await appender.getLatest(options.namespace, options.id);
      if (latest) {
        process.stdout.write(latest.object);
      } else {
        console.log('No latest object found.');
      }
      break;
    case 'append':
      if (!options.file) {
        console.error('File path is required for append action.');
        process.exit(1);
      }
      const data = fs.readFileSync(options.file);
      await appender.append(options.namespace, options.id, options.key || new Date().toISOString(), data, { gzip: options.gzip, mimeType: options.mimetype });
      console.log('Append successful.');
      break;
    default:
      console.error('Invalid action for appender');
      process.exit(1);
  }
}

async function handleStorageActions() {
    switch (options.action) {
        case 'get':
          const latest = await storage.get(options.namespace, options.id, options.key);
          if (latest) {
            process.stdout.write(latest.object);
          } else {
            console.log('No object found.');
          }
          break;
        case 'delete':
          await storage.delete(options.namespace, options.id, options.key);
          console.log('Item Deleted');
          break;
        case 'put':
          if (!options.file) {
            console.error('File path is required for append action.');
            process.exit(1);
          }
          const data = fs.readFileSync(options.file);
          await storage.put(options.namespace, options.id, options.key, data, { gzip: options.gzip, mimeType: options.mimetype });
          console.log('Put successful.');
          break;
        default:
          console.error('Invalid action for storage');
          process.exit(1);
      }
}

main();
