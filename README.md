# capa-zip

zip and unzip

## Install

```bash
npm install capa-zip
npx cap sync
```

## API

<docgen-index>

* [`addListener('zipProgress', ...)`](#addlistenerzipprogress-)
* [`unzip(...)`](#unzip)
* [`zip(...)`](#zip)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

Zip file manipulation plugin for Capacitor

### Events

The plugin emits progress events during zip/unzip operations:

```typescript
Zip.addListener('zipProgress', (progress: ZipPluginProgress) => {
  const percentage = (progress.loaded / progress.total) * 100;
  console.log(`Progress: ${percentage.toFixed(2)}%`);
});
```

### Examples

#### Unzip a file with progress monitoring
```typescript
// Add progress listener
Zip.addListener('zipProgress', (progress: ZipPluginProgress) => {
  const percentage = (progress.loaded / progress.total) * 100;
  updateProgressUI(percentage);
});

// Perform unzip
try {
  await Zip.unzip({
    sourceFile: 'path/to/archive.zip',
    destinationPath: 'path/to/destination'
  });
  console.log('Unzip completed successfully');
} catch (error) {
  console.error('Unzip failed:', error);
}
```

#### Zip a directory
```typescript
try {
  await Zip.zip({
    sourcePath: 'path/to/directory',
    destinationPath: 'path/to/archive.zip'
  });
  console.log('Zip completed successfully');
} catch (error) {
  console.error('Zip failed:', error);
}
```

#### Zip specific files from a directory
```typescript
try {
  await Zip.zip({
    sourcePath: 'path/to/directory',
    destinationPath: 'path/to/archive.zip',
    files: ['file1.txt', 'subdirectory/file2.jpg']
  });
  console.log('Zip completed successfully');
} catch (error) {
  console.error('Zip failed:', error);
}
```

### addListener('zipProgress', ...)

```typescript
addListener(eventName: 'zipProgress', listenerFunc: (progress: ZipPluginProgress) => void) => Promise<PluginListenerHandle>
```

Adds a listener for zip progress events.

| Param              | Type                                                                                   | Description                                              |
| ------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **`eventName`**    | <code>'zipProgress'</code>                                                             | The name of the event to listen for                      |
| **`listenerFunc`** | <code>(progress: <a href="#zippluginprogress">ZipPluginProgress</a>) =&gt; void</code> | The callback function to be called when the event occurs |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### unzip(...)

```typescript
unzip(options: { sourceFile: string; destinationPath: string; }) => Promise<void>
```

Unzips a file to a specified destination directory.

| Param         | Type                                                          | Description                     |
| ------------- | ------------------------------------------------------------- | ------------------------------- |
| **`options`** | <code>{ sourceFile: string; destinationPath: string; }</code> | Options for the unzip operation |

**Since:** 1.0.0

--------------------


### zip(...)

```typescript
zip(options: { sourcePath: string; destinationPath: string; files?: string[]; }) => Promise<void>
```

Creates a zip file from a directory or list of files.

| Param         | Type                                                                            | Description                   |
| ------------- | ------------------------------------------------------------------------------- | ----------------------------- |
| **`options`** | <code>{ sourcePath: string; destinationPath: string; files?: string[]; }</code> | Options for the zip operation |

**Since:** 1.1.0

--------------------


### Interfaces


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


#### ZipPluginProgress

Progress event data for zip operations

| Prop         | Type                | Description                      |
| ------------ | ------------------- | -------------------------------- |
| **`loaded`** | <code>number</code> | Number of bytes processed        |
| **`total`**  | <code>number</code> | Total number of bytes to process |

</docgen-api>
