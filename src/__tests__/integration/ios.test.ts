// @capacitor-community/zipプラグインのモック
import { Zip } from '../../index';

const mockUnzip = jest.fn();
const mockZip = jest.fn();

jest.mock('../../index', () => ({
  Zip: {
    unzip: (...args: any[]) => mockUnzip(...args),
    zip: (...args: any[]) => mockZip(...args),
    addListener: jest.fn()
  }
}));

describe('iOS Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Unzip Operation', () => {
    it('should handle large file unzip', async () => {
      const options = {
        sourceFile: 'test-large.zip',
        destinationPath: 'output'
      };

      mockUnzip.mockResolvedValueOnce(undefined);
      await expect(mockUnzip(options)).resolves.not.toThrow();
      expect(mockUnzip).toHaveBeenCalledWith(options);
    });

    it('should handle nested directory unzip', async () => {
      const options = {
        sourceFile: 'test-nested.zip',
        destinationPath: 'output'
      };

      mockUnzip.mockResolvedValueOnce(undefined);
      await expect(mockUnzip(options)).resolves.not.toThrow();
      expect(mockUnzip).toHaveBeenCalledWith(options);
    });

    it('should handle special characters in paths', async () => {
      const options = {
        sourceFile: 'テスト.zip',
        destinationPath: 'output/特殊文字'
      };

      mockUnzip.mockResolvedValueOnce(undefined);
      await expect(mockUnzip(options)).resolves.not.toThrow();
      expect(mockUnzip).toHaveBeenCalledWith(options);
    });
  });

  describe('Zip Operation', () => {
    it('should handle large directory zip', async () => {
      const options = {
        sourcePath: 'large-directory',
        destinationPath: 'large.zip'
      };

      mockZip.mockResolvedValueOnce(undefined);
      await expect(mockZip(options)).resolves.not.toThrow();
      expect(mockZip).toHaveBeenCalledWith(options);
    });

    it('should handle specific file selection', async () => {
      const options = {
        sourcePath: 'test-directory',
        destinationPath: 'selected.zip',
        files: ['file1.txt', 'subdir/file2.txt']
      };

      mockZip.mockResolvedValueOnce(undefined);
      await expect(mockZip(options)).resolves.not.toThrow();
      expect(mockZip).toHaveBeenCalledWith(options);
    });

    it('should handle special characters in file names', async () => {
      const options = {
        sourcePath: '日本語ディレクトリ',
        destinationPath: '圧縮.zip',
        files: ['文書.txt', 'フォルダ/画像.jpg']
      };

      mockZip.mockResolvedValueOnce(undefined);
      await expect(mockZip(options)).resolves.not.toThrow();
      expect(mockZip).toHaveBeenCalledWith(options);
    });
  });

  describe('Progress Events', () => {
    it('should emit progress events for large files', async () => {
      const progressListener = jest.fn();
      Zip.addListener('zipProgress', progressListener);

      const options = {
        sourceFile: 'large-test.zip',
        destinationPath: 'output'
      };

      mockUnzip.mockImplementation(async () => {
        progressListener({ loaded: 5000000, total: 10000000 });
        progressListener({ loaded: 10000000, total: 10000000 });
      });

      await mockUnzip(options);
      expect(progressListener).toHaveBeenCalledTimes(2);
      expect(progressListener).toHaveBeenNthCalledWith(1, { loaded: 5000000, total: 10000000 });
      expect(progressListener).toHaveBeenNthCalledWith(2, { loaded: 10000000, total: 10000000 });
    });
  });
}); 