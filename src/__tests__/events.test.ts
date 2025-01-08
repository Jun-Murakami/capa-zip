import { WebPlugin } from '@capacitor/core';

import type { ZipPlugin, ZipPluginProgress } from '../definitions';

class MockEventPlugin extends WebPlugin implements ZipPlugin {
  async unzip(_options: { sourceFile: string; destinationPath: string }): Promise<void> {
    void _options;
    // プログレスイベントをシミュレート
    this.notifyListeners('zipProgress', {
      loaded: 50,
      total: 100
    } as ZipPluginProgress);

    this.notifyListeners('zipProgress', {
      loaded: 100,
      total: 100
    } as ZipPluginProgress);

    return Promise.resolve();
  }

  async zip(_options: { sourcePath: string; destinationPath: string; files?: string[] }): Promise<void> {
    void _options;
    // プログレスイベントをシミュレート
    this.notifyListeners('zipProgress', {
      loaded: 30,
      total: 100
    } as ZipPluginProgress);

    this.notifyListeners('zipProgress', {
      loaded: 60,
      total: 100
    } as ZipPluginProgress);

    this.notifyListeners('zipProgress', {
      loaded: 100,
      total: 100
    } as ZipPluginProgress);

    return Promise.resolve();
  }
}

describe('Event Tests', () => {
  let plugin: MockEventPlugin;

  beforeEach(() => {
    plugin = new MockEventPlugin();
  });

  describe('unzip progress events', () => {
    it('should emit progress events during unzip', async () => {
      const progressListener = jest.fn();
      plugin.addListener('zipProgress', progressListener);

      const options = {
        sourceFile: 'test.zip',
        destinationPath: 'output'
      };

      await plugin.unzip(options);

      expect(progressListener).toHaveBeenCalledTimes(2);
      expect(progressListener).toHaveBeenNthCalledWith(1, { loaded: 50, total: 100 });
      expect(progressListener).toHaveBeenNthCalledWith(2, { loaded: 100, total: 100 });
    });
  });

  describe('zip progress events', () => {
    it('should emit progress events during zip', async () => {
      const progressListener = jest.fn();
      plugin.addListener('zipProgress', progressListener);

      const options = {
        sourcePath: 'test',
        destinationPath: 'test.zip'
      };

      await plugin.zip(options);

      expect(progressListener).toHaveBeenCalledTimes(3);
      expect(progressListener).toHaveBeenNthCalledWith(1, { loaded: 30, total: 100 });
      expect(progressListener).toHaveBeenNthCalledWith(2, { loaded: 60, total: 100 });
      expect(progressListener).toHaveBeenNthCalledWith(3, { loaded: 100, total: 100 });
    });
  });
}); 