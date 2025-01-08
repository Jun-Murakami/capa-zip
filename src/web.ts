import { WebPlugin } from '@capacitor/core';

import type { ZipPlugin } from './definitions';

export class ZipWeb extends WebPlugin implements ZipPlugin {
  async unzip(_options: { sourceFile: string; destinationPath: string }): Promise<void> {
    void _options;
    console.warn('Zip.unzip(): Web platform is not supported');
    throw new Error('Zip.unzip(): Web platform is not supported');
  }

  async zip(_options: { sourcePath: string; destinationPath: string; files?: string[] }): Promise<void> {
    void _options;
    console.warn('Zip.zip(): Web platform is not supported');
    throw new Error('Zip.zip(): Web platform is not supported');
  }
}
