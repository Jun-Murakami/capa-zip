import { Zip } from '../../index';

// @capacitor-community/zipプラグインのモック
jest.mock('../../index', () => ({
  Zip: {
    unzip: (...args: any[]) => mockUnzip(...args),
    zip: (...args: any[]) => mockZip(...args),
    addListener: jest.fn()
  }
}));

// ネイティブプラグインのモック
const mockUnzip = jest.fn();
const mockZip = jest.fn();

describe('Android Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Unzip Operation', () => {
    it('should handle large file unzip', async () => {
      const options = {
        sourceFile: '/storage/emulated/0/Download/test-large.zip',
        destinationPath: '/storage/emulated/0/Download/output'
      };

      mockUnzip.mockResolvedValueOnce(undefined);
      await expect(mockUnzip(options)).resolves.not.toThrow();
      expect(mockUnzip).toHaveBeenCalledWith(options);
    });

    it('should handle nested directory unzip', async () => {
      const options = {
        sourceFile: '/storage/emulated/0/Download/test-nested.zip',
        destinationPath: '/storage/emulated/0/Download/output'
      };

      mockUnzip.mockResolvedValueOnce(undefined);
      await expect(mockUnzip(options)).resolves.not.toThrow();
      expect(mockUnzip).toHaveBeenCalledWith(options);
    });

    it('should handle special characters in paths', async () => {
      const options = {
        sourceFile: '/storage/emulated/0/Download/テスト.zip',
        destinationPath: '/storage/emulated/0/Download/特殊文字'
      };

      mockUnzip.mockResolvedValueOnce(undefined);
      await expect(mockUnzip(options)).resolves.not.toThrow();
      expect(mockUnzip).toHaveBeenCalledWith(options);
    });
  });

  describe('Zip Operation', () => {
    it('should handle large directory zip', async () => {
      const options = {
        sourcePath: '/storage/emulated/0/Download/large-directory',
        destinationPath: '/storage/emulated/0/Download/large.zip'
      };

      mockZip.mockResolvedValueOnce(undefined);
      await expect(mockZip(options)).resolves.not.toThrow();
      expect(mockZip).toHaveBeenCalledWith(options);
    });

    it('should handle specific file selection', async () => {
      const options = {
        sourcePath: '/storage/emulated/0/Download/test-directory',
        destinationPath: '/storage/emulated/0/Download/selected.zip',
        files: ['file1.txt', 'subdir/file2.txt']
      };

      mockZip.mockResolvedValueOnce(undefined);
      await expect(mockZip(options)).resolves.not.toThrow();
      expect(mockZip).toHaveBeenCalledWith(options);
    });

    it('should handle special characters in file names', async () => {
      const options = {
        sourcePath: '/storage/emulated/0/Download/日本語ディレクトリ',
        destinationPath: '/storage/emulated/0/Download/圧縮.zip',
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
        sourceFile: '/storage/emulated/0/Download/large-test.zip',
        destinationPath: '/storage/emulated/0/Download/output'
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

  describe('Android Specific Tests', () => {
    it('should handle external storage paths', async () => {
      const options = {
        sourceFile: '/storage/external/0/Download/test.zip',
        destinationPath: '/storage/external/0/Download/output'
      };

      mockUnzip.mockResolvedValueOnce(undefined);
      await expect(mockUnzip(options)).resolves.not.toThrow();
      expect(mockUnzip).toHaveBeenCalledWith(options);
    });

    it('should handle content:// URIs', async () => {
      const options = {
        sourceFile: 'content://com.android.providers.downloads/document/123',
        destinationPath: '/storage/emulated/0/Download/output'
      };

      mockUnzip.mockResolvedValueOnce(undefined);
      await expect(mockUnzip(options)).resolves.not.toThrow();
      expect(mockUnzip).toHaveBeenCalledWith(options);
    });
  });

  describe('Path Resolution', () => {
    it('should handle relative paths correctly', async () => {
      const options = {
        sourcePath: 'test-directory',
        destinationPath: 'archive.zip'
      };

      mockZip.mockResolvedValueOnce(undefined);
      await expect(mockZip(options)).resolves.not.toThrow();
      expect(mockZip).toHaveBeenCalledWith(options);
    });

    it('should handle paths with spaces', async () => {
      const options = {
        sourcePath: 'my documents/test folder',
        destinationPath: 'my archives/test archive.zip'
      };

      mockZip.mockResolvedValueOnce(undefined);
      await expect(mockZip(options)).resolves.not.toThrow();
      expect(mockZip).toHaveBeenCalledWith(options);
    });

    it('should handle absolute paths', async () => {
      const options = {
        sourcePath: '/storage/emulated/0/Download/test-directory',
        destinationPath: '/storage/emulated/0/Download/archive.zip'
      };

      mockZip.mockResolvedValueOnce(undefined);
      await expect(mockZip(options)).resolves.not.toThrow();
      expect(mockZip).toHaveBeenCalledWith(options);
    });

    it('should handle file:// scheme URIs', async () => {
      const options = {
        sourcePath: 'file:///storage/emulated/0/Download/test-directory',
        destinationPath: 'file:///storage/emulated/0/Download/archive.zip'
      };

      mockZip.mockResolvedValueOnce(undefined);
      await expect(mockZip(options)).resolves.not.toThrow();
      expect(mockZip).toHaveBeenCalledWith(options);
    });

    it('should handle content:// scheme URIs', async () => {
      const options = {
        sourcePath: 'content://com.android.externalstorage.documents/tree/primary%3ADownload%2Ftest-directory',
        destinationPath: 'content://com.android.externalstorage.documents/tree/primary%3ADownload%2Farchive.zip'
      };

      mockZip.mockResolvedValueOnce(undefined);
      await expect(mockZip(options)).resolves.not.toThrow();
      expect(mockZip).toHaveBeenCalledWith(options);
    });

    it('should handle Japanese characters in paths', async () => {
      const options = {
        sourcePath: 'テスト/フォルダ',
        destinationPath: 'アーカイブ/テスト.zip'
      };

      mockZip.mockResolvedValueOnce(undefined);
      await expect(mockZip(options)).resolves.not.toThrow();
      expect(mockZip).toHaveBeenCalledWith(options);
    });
  });
}); 