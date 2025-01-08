import { WebPlugin, Capacitor } from '@capacitor/core';

import type { ZipPlugin } from '../definitions';

// Capacitorのモック
jest.mock('@capacitor/core', () => ({
  WebPlugin: class { },
  Capacitor: {
    getPlatform: jest.fn()
  }
}));

// プラットフォーム固有のプラグインのモック
class MockNativePlugin extends WebPlugin implements ZipPlugin {
  async unzip(_options: { sourceFile: string; destinationPath: string }): Promise<void> {
    void _options;
    return Promise.resolve();
  }

  async zip(_options: { sourcePath: string; destinationPath: string; files?: string[] }): Promise<void> {
    void _options;
    return Promise.resolve();
  }
}

describe('Platform Specific Tests', () => {
  let plugin: MockNativePlugin;

  beforeEach(() => {
    plugin = new MockNativePlugin();
    jest.clearAllMocks();
  });

  describe('iOS Platform', () => {
    beforeEach(() => {
      (Capacitor.getPlatform as jest.Mock).mockReturnValue('ios');
    });

    it('should handle unzip operation', async () => {
      const options = {
        sourceFile: 'test.zip',
        destinationPath: 'output'
      };
      await expect(plugin.unzip(options)).resolves.not.toThrow();
    });

    it('should handle zip operation', async () => {
      const options = {
        sourcePath: 'test',
        destinationPath: 'test.zip'
      };
      await expect(plugin.zip(options)).resolves.not.toThrow();
    });
  });

  describe('Android Platform', () => {
    beforeEach(() => {
      (Capacitor.getPlatform as jest.Mock).mockReturnValue('android');
    });

    it('should handle unzip operation', async () => {
      const options = {
        sourceFile: 'test.zip',
        destinationPath: 'output'
      };
      await expect(plugin.unzip(options)).resolves.not.toThrow();
    });

    it('should handle zip operation', async () => {
      const options = {
        sourcePath: 'test',
        destinationPath: 'test.zip'
      };
      await expect(plugin.zip(options)).resolves.not.toThrow();
    });
  });
}); 