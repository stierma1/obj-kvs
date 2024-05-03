# obj-kvs
This Object Storage Library provides a flexible and extensible way to manage data across different storage backends. It includes support for in-memory storage, flat file storage, and Amazon S3 storage. The API abstracts storage details, allowing for easy switching between backends and handling optional compression based on metadata.

## Features

- **Multiple Storage Engines**: Supports InMemory, FlatFile, and S3 engines.
- **Compression**: Optional gzip compression for stored data based on metadata settings.
- **Flexible Key Management**: Optional key handling with default keys if not provided.
- **Unified API**: A single API interface for all storage operations across different engines.

## Storage Engines

### InMemory Engine
- **Fast access**: Stores data in the RAM of the server, providing fast access and manipulation.
- **Volatile**: Data is lost when the process exits, suitable for caching temporary data.
- **TTL Support**: Optional time-to-live for automatic data expiration.

### FlatFile Engine
- **Persistence**: Stores data in the file system, providing persistence across server restarts.
- **Directory Structure**: Uses a structured directory path of `basePath > namespace > id > objects` for storage.
- **JSON Storage**: Data and metadata are stored as JSON files, base64-encoded for binary data.

### S3 Engine
- **Scalable**: Leverages Amazon S3 for scalable and robust cloud storage.
- **Region and ACL Support**: Configurable AWS region and access control list settings.
- **Metadata Handling**: Stores custom metadata including MIME type, gzip status, and TTL.

## Installation

To use this library, clone the repository and install necessary dependencies:

```bash
git clone <repository-url>
cd object-storage-library
npm install
```

# Appender and ObjectStorage APIs

This repository contains two Node.js APIs: the ObjectStorage API and the Appender API. The ObjectStorage API provides a generic interface for storing objects using various backends (In Memory, Flat File, S3), while the Appender API is designed to manage append-only storage scenarios, ideal for managing versioned data or logs.

## Features

- **ObjectStorage API**: Supports multiple storage backends and operations like get, put, delete, and scan.
- **Appender API**: Built on top of the ObjectStorage API, it handles append operations, maintaining a pointer to the latest version of each object.

## Installation

Clone this repository and install dependencies:

```bash
git clone <repository-url>
cd your-repo-directory
npm install
```

## Usage

### ObjectStorage API

```javascript
const { newInMemoryStorageController, newFlatFileStorageController, newS3StorageController } = require('obj-kvs');

// Initialize the storage API with an InMemory engine
const storage = newInMemoryStorageController();

// Example operations
storage.put('namespace', 'id', 'key', Buffer.from('data'), { gzip: true, mimeType:"text/plain" });
storage.get('namespace', 'id', 'key').then(console.log);
storage.delete('namespace', 'id', 'key');
```

### Appender API

```javascript
const { newInMemoryAppenderController, newFlatFileAppenderController, newSAppenderController } = require('obj-kvs');

const appender = newInMemoryAppenderController();

// Append a new version of an object
appender.append('namespace', 'id', '2023-04-01', Buffer.from('new data'), {mimeType:"text/plain"});

// Get the latest version
appender.getLatest('namespace', 'id').then(console.log);

// Scan for all versions
appender.scan('namespace', 'id').then(console.log);
```

## Contributing

Contributions are welcome! Please fork this repository and submit pull requests with your enhancements or open issues for any bugs or new features you suggest.

## License
This project is licensed under the MIT License - see the LICENSE file for details.