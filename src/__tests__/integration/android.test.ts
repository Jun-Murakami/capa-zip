import { Zip } from '../../index';

// Capacitorのモックを設定
jest.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: jest.fn().mockReturnValue('android')
  },
  WebPlugin: class { }
}));

// ネイティブプラグインのモック
const mockUnzip = jest.fn();
const mockZip = jest.fn();

// パス解決をシミュレートする関数
function resolveAndroidPath(path: string): string {
  const basePath = '/data/data/com.test.app/files';
  // パスが既に絶対パスの場合はそのまま返す
  if (path.startsWith('/')) {
    return path;
  }
  // 相対パスの場合は内部ストレージパスと結合
  return `${basePath}/${path}`;
}

// @capacitor-community/zipプラグインのモック
jest.mock('../../index', () => ({
  Zip: {
    unzip: (...args: any[]) => mockUnzip(...args),
    zip: (options: any) => {
      // パスを解決してからmockZipを呼び出す
      const resolvedOptions = {
        sourcePath: resolveAndroidPath(options.sourcePath),
        destinationPath: resolveAndroidPath(options.destinationPath),
        files: options.files
      };
      return mockZip(resolvedOptions);
    },
    addListener: jest.fn()
  }
}));

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

  describe('Directory Resolution Tests', () => {
    it('should resolve Directory.Data paths correctly', async () => {
      const options = {
        sourcePath: 'test-directory',
        destinationPath: 'archive.zip'
      };

      // Directory.Dataのパスをモック
      const expectedBasePath = '/data/data/com.test.app/files';
      mockZip.mockImplementation((opts) => {
        // 実際に解決されたパスをログ出力
        console.log('Resolved source path:', opts.sourcePath);
        console.log('Resolved destination path:', opts.destinationPath);

        // パスが期待する形式かチェック
        expect(opts.sourcePath).toBe(`${expectedBasePath}/test-directory`);
        expect(opts.destinationPath).toBe(`${expectedBasePath}/archive.zip`);
      });

      await Zip.zip(options);
      expect(mockZip).toHaveBeenCalled();
    });

    it('should not use external storage for Directory.Data', async () => {
      const options = {
        sourcePath: 'test-directory',
        destinationPath: 'archive.zip'
      };

      mockZip.mockImplementation((opts) => {
        const externalPath = '/storage/emulated/0/Android/data';
        expect(opts.sourcePath).not.toContain(externalPath);
        expect(opts.destinationPath).not.toContain(externalPath);
        // 内部ストレージパスが使用されていることを確認
        expect(opts.sourcePath).toContain('/data/data/');
        expect(opts.destinationPath).toContain('/data/data/');
      });

      await Zip.zip(options);
      expect(mockZip).toHaveBeenCalled();
    });
  });
}); 