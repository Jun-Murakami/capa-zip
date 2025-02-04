import type { PluginListenerHandle } from '@capacitor/core';

/**
 * Zip file manipulation plugin for Capacitor
 * 
 * ### Events
 * 
 * The plugin emits progress events during zip/unzip operations:
 * 
 * ```typescript
 * Zip.addListener('zipProgress', (progress: ZipPluginProgress) => {
 *   const percentage = (progress.loaded / progress.total) * 100;
 *   console.log(`Progress: ${percentage.toFixed(2)}%`);
 * });
 * ```
 * 
 * ### Examples
 * 
 * #### Unzip a file with progress monitoring
 * ```typescript
 * // Add progress listener
 * Zip.addListener('zipProgress', (progress: ZipPluginProgress) => {
 *   const percentage = (progress.loaded / progress.total) * 100;
 *   updateProgressUI(percentage);
 * });
 * 
 * // Perform unzip
 * try {
 *   await Zip.unzip({
 *     sourceFile: 'path/to/archive.zip',
 *     destinationPath: 'path/to/destination'
 *   });
 *   console.log('Unzip completed successfully');
 * } catch (error) {
 *   console.error('Unzip failed:', error);
 * }
 * ```
 * 
 * #### Zip a directory
 * ```typescript
 * try {
 *   await Zip.zip({
 *     sourcePath: 'path/to/directory',
 *     destinationPath: 'path/to/archive.zip'
 *   });
 *   console.log('Zip completed successfully');
 * } catch (error) {
 *   console.error('Zip failed:', error);
 * }
 * ```
 * 
 * #### Zip specific files from a directory
 * ```typescript
 * try {
 *   await Zip.zip({
 *     sourcePath: 'path/to/directory',
 *     destinationPath: 'path/to/archive.zip',
 *     files: ['file1.txt', 'subdirectory/file2.jpg']
 *   });
 *   console.log('Zip completed successfully');
 * } catch (error) {
 *   console.error('Zip failed:', error);
 * }
 * ```
 */
export interface ZipPlugin {
  /**
   * Adds a listener for zip progress events.
   * @param eventName The name of the event to listen for
   * @param listenerFunc The callback function to be called when the event occurs
   */
  addListener(eventName: 'zipProgress', listenerFunc: (progress: ZipPluginProgress) => void): Promise<PluginListenerHandle>;

  /**
   * Unzips a file to a specified destination directory.
   * 
   * @param options Options for the unzip operation
   * @param options.sourceFile Path to the source zip file
   * @param options.destinationPath Path to the destination directory
   * @returns A promise that resolves when unzip is complete
   * @since 1.0.0
   */
  unzip(options: {
    sourceFile: string;
    destinationPath: string;
  }): Promise<void>;

  /**
   * Creates a zip file from a directory or list of files.
   * 
   * @param options Options for the zip operation
   * @param options.sourcePath Path to the source directory or file
   * @param options.destinationPath Path to the destination zip file
   * @param options.files Optional list of specific files to include (if sourcePath is a directory)
   * @returns A promise that resolves when zip is complete
   * @since 1.1.0
   */
  zip(options: {
    sourcePath: string;
    destinationPath: string;
    files?: string[];
  }): Promise<void>;

  /**
   * Removes all registered event listeners.
   * 
   * @example
   * ```typescript
   * // Add progress listener
   * const listener = await Zip.addListener('zipProgress', (progress) => {
   *   const percentage = (progress.loaded / progress.total) * 100;
   *   console.log(`Progress: ${percentage}%`);
   * });
   * 
   * // Later, when you want to remove all listeners
   * await Zip.removeAllListeners();
   * ```
   * 
   * @returns A promise that resolves when all listeners have been removed
   * @since 7.0.0
   */
  removeAllListeners(): Promise<void>;
}

/**
 * Progress event data for zip operations
 * 
 * @example
 * ```typescript
 * // プログレスイベントの型定義
 * Zip.addListener('zipProgress', (progress: ZipPluginProgress) => {
 *   const loaded = progress.loaded;  // 処理済みバイト数
 *   const total = progress.total;    // 総バイト数
 *   const percentage = (loaded / total) * 100;
 *   
 *   // UIの更新など
 *   updateProgressBar(percentage);
 * });
 *```
 */
export interface ZipPluginProgress {
  /**
   * Number of bytes processed
   */
  loaded: number;
  /**
   * Total number of bytes to process
   */
  total: number;
}

/**
 * Error information for zip operations
 */
export interface ZipPluginError {
  /**
   * Error message
   */
  message: string;
  /**
   * Error code
   */
  code: number;
}
