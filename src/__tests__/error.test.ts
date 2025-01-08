import { WebPlugin } from '@capacitor/core';

import type { ZipPlugin } from '../definitions';

class MockErrorPlugin extends WebPlugin implements ZipPlugin {
  async unzip(options: { sourceFile: string; destinationPath: string }): Promise<void> {
    if (!options.sourceFile) {
      throw new Error('Source file is required');
    }
    if (!options.destinationPath) {
      throw new Error('Destination path is required');
    }
    if (options.sourceFile === 'nonexistent.zip') {
      throw new Error('File not found');
    }
    if (options.sourceFile === 'nopermission.zip') {
      throw new Error('Permission denied');
    }
    return Promise.resolve();
  }

  async zip(options: { sourcePath: string; destinationPath: string; files?: string[] }): Promise<void> {
    if (!options.sourcePath) {
      throw new Error('Source path is required');
    }
    if (!options.destinationPath) {
      throw new Error('Destination path is required');
    }
    if (options.sourcePath === 'nonexistent') {
      throw new Error('Directory not found');
    }
    if (options.sourcePath === 'nopermission') {
      throw new Error('Permission denied');
    }
    if (options.files?.includes('nonexistent.txt')) {
      throw new Error('Some files do not exist');
    }
    return Promise.resolve();
  }
}

describe('Error Handling Tests', () => {
  let plugin: MockErrorPlugin;

  beforeEach(() => {
    plugin = new MockErrorPlugin();
  });

  describe('unzip error cases', () => {
    it('should throw error for missing source file', async () => {
      const options = {
        sourceFile: '',
        destinationPath: 'output'
      };
      await expect(plugin.unzip(options)).rejects.toThrow('Source file is required');
    });

    it('should throw error for missing destination path', async () => {
      const options = {
        sourceFile: 'test.zip',
        destinationPath: ''
      };
      await expect(plugin.unzip(options)).rejects.toThrow('Destination path is required');
    });

    it('should throw error for nonexistent file', async () => {
      const options = {
        sourceFile: 'nonexistent.zip',
        destinationPath: 'output'
      };
      await expect(plugin.unzip(options)).rejects.toThrow('File not found');
    });

    it('should throw error for permission issues', async () => {
      const options = {
        sourceFile: 'nopermission.zip',
        destinationPath: 'output'
      };
      await expect(plugin.unzip(options)).rejects.toThrow('Permission denied');
    });
  });

  describe('zip error cases', () => {
    it('should throw error for missing source path', async () => {
      const options = {
        sourcePath: '',
        destinationPath: 'test.zip'
      };
      await expect(plugin.zip(options)).rejects.toThrow('Source path is required');
    });

    it('should throw error for missing destination path', async () => {
      const options = {
        sourcePath: 'test',
        destinationPath: ''
      };
      await expect(plugin.zip(options)).rejects.toThrow('Destination path is required');
    });

    it('should throw error for nonexistent directory', async () => {
      const options = {
        sourcePath: 'nonexistent',
        destinationPath: 'test.zip'
      };
      await expect(plugin.zip(options)).rejects.toThrow('Directory not found');
    });

    it('should throw error for permission issues', async () => {
      const options = {
        sourcePath: 'nopermission',
        destinationPath: 'test.zip'
      };
      await expect(plugin.zip(options)).rejects.toThrow('Permission denied');
    });

    it('should throw error for nonexistent files in files list', async () => {
      const options = {
        sourcePath: 'test',
        destinationPath: 'test.zip',
        files: ['nonexistent.txt']
      };
      await expect(plugin.zip(options)).rejects.toThrow('Some files do not exist');
    });
  });
}); 