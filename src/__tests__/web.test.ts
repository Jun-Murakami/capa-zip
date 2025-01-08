import { ZipWeb } from '../web';

describe('ZipWeb', () => {
  let plugin: ZipWeb;

  beforeEach(() => {
    plugin = new ZipWeb();
    // モックコンソールを設定
    console.warn = jest.fn();
  });

  describe('unzip', () => {
    it('should throw error for web platform', async () => {
      const options = {
        sourceFile: 'test.zip',
        destinationPath: 'output'
      };

      await expect(plugin.unzip(options)).rejects.toThrow('Zip.unzip(): Web platform is not supported');
      expect(console.warn).toHaveBeenCalledWith('Zip.unzip(): Web platform is not supported');
    });
  });

  describe('zip', () => {
    it('should throw error for web platform', async () => {
      const options = {
        sourcePath: 'test',
        destinationPath: 'test.zip'
      };

      await expect(plugin.zip(options)).rejects.toThrow('Zip.zip(): Web platform is not supported');
      expect(console.warn).toHaveBeenCalledWith('Zip.zip(): Web platform is not supported');
    });

    it('should throw error for web platform with files option', async () => {
      const options = {
        sourcePath: 'test',
        destinationPath: 'test.zip',
        files: ['file1.txt', 'file2.txt']
      };

      await expect(plugin.zip(options)).rejects.toThrow('Zip.zip(): Web platform is not supported');
      expect(console.warn).toHaveBeenCalledWith('Zip.zip(): Web platform is not supported');
    });
  });
}); 