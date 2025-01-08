import { Zip } from 'capa-zip';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { SplashScreen } from '@capacitor/splash-screen';

interface ZipProgress {
  loaded: number;
  total: number;
}

window.customElements.define(
  'capacitor-welcome',
  class extends HTMLElement {
    constructor() {
      super();

      const root = this.attachShadow({ mode: 'open' });

      root.innerHTML = `
        <style>
          :host {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: block;
            width: 100%;
            height: 100%;
            padding: 20px;
            box-sizing: border-box;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #73B5F6;
            color: #fff;
            font-size: 0.9em;
            border: 0;
            border-radius: 3px;
            text-decoration: none;
            cursor: pointer;
            margin: 5px;
          }
          .button.reset {
            background-color: #999;
            font-size: 0.8em;
            padding: 8px 15px;
          }
          .progress-container {
            position: relative;
            margin-top: 10px;
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .progress {
            flex-grow: 1;
            height: 20px;
            background-color: #f0f0f0;
            border-radius: 3px;
            overflow: hidden;
          }
          .progress-bar {
            width: 0%;
            height: 100%;
            background-color: #73B5F6;
            transition: width 0.3s ease;
          }
          .status {
            margin-top: 10px;
            color: #666;
            white-space: pre-line;
          }
        </style>
        <div>
          <h1>Zip Plugin Demo</h1>
          <div>
            <button class="button" id="createFilesBtn">1. Create Sample Files</button>
            <button class="button" id="zipBtn">2. Compress Files</button>
            <button class="button" id="unzipBtn">3. Extract Files</button>
          </div>
          <div class="progress-container">
            <div class="progress">
              <div class="progress-bar" id="progressBar"></div>
            </div>
            <button class="button reset" id="resetProgressBtn">Reset</button>
          </div>
          <p class="status" id="status">Ready</p>
        </div>
      `;
    }

    async connectedCallback() {
      await SplashScreen.hide();

      const progressBar = this.shadowRoot?.querySelector('#progressBar') as HTMLElement;
      const statusEl = this.shadowRoot?.querySelector('#status') as HTMLElement;

      // Progress bar reset button handler
      this.shadowRoot?.querySelector('#resetProgressBtn')?.addEventListener('click', () => {
        progressBar.style.width = '0%';
        statusEl.textContent = 'Ready';
      });

      // Progress listener setup
      Zip.addListener('zipProgress', (progress: ZipProgress) => {
        const percentage = (progress.loaded / progress.total) * 100;
        progressBar.style.width = `${percentage}%`;
      });

      // Create sample files
      this.shadowRoot?.querySelector('#createFilesBtn')?.addEventListener('click', async () => {
        try {
          statusEl.textContent = 'Creating sample files...';
          // Reset progress bar
          progressBar.style.width = '0%';

          // Check and remove existing directory
          try {
            const checkResult = await Filesystem.stat({
              path: 'test-files',
              directory: Directory.Data
            });

            if (checkResult.type === 'directory') {
              console.log('Removing existing test-files directory');
              await Filesystem.rmdir({
                path: 'test-files',
                directory: Directory.Data,
                recursive: true
              });
              statusEl.textContent = 'Removed existing test-files directory';
            }
          } catch (e) {
            // Ignore if directory doesn't exist
            console.log('test-files directory does not exist');
          }

          console.log('Creating test-files directory');
          statusEl.textContent = 'Creating test-files directory...';
          // Create test directory
          await Filesystem.mkdir({
            path: 'test-files',
            directory: Directory.Data,
            recursive: true
          });

          // Create test files
          console.log('Creating file1.txt');
          statusEl.textContent = 'Creating file1.txt...';
          await Filesystem.writeFile({
            path: 'test-files/file1.txt',
            data: 'This is a test file.',
            directory: Directory.Data,
            recursive: true,
            encoding: Encoding.UTF8
          });

          console.log('Creating file2.txt');
          statusEl.textContent = 'Creating file2.txt...';
          await Filesystem.writeFile({
            path: 'test-files/file2.txt',
            data: 'Another test file.',
            directory: Directory.Data,
            recursive: true,
            encoding: Encoding.UTF8
          });

          console.log('Sample files creation completed');
          statusEl.textContent = 'Sample files creation completed!\nCreated: test-files/file1.txt, test-files/file2.txt';
        } catch (error) {
          console.error('File operation error details:', error);
          if (error instanceof Error) {
            statusEl.textContent = `Error: ${error.message}`;
          } else {
            statusEl.textContent = `Error: ${JSON.stringify(error)}`;
          }
        }
      });

      // Compression process
      this.shadowRoot?.querySelector('#zipBtn')?.addEventListener('click', async () => {
        try {
          statusEl.textContent = 'Compressing files...';
          // Reset progress bar
          progressBar.style.width = '0%';

          // Check and remove existing ZIP file
          try {
            const checkResult = await Filesystem.stat({
              path: 'archive.zip',
              directory: Directory.Data
            });

            if (checkResult.type === 'file') {
              console.log('Removing existing archive.zip');
              await Filesystem.deleteFile({
                path: 'archive.zip',
                directory: Directory.Data
              });
              statusEl.textContent = 'Removed existing archive.zip';
            }
          } catch (e) {
            // Ignore if file doesn't exist
            console.log('archive.zip does not exist');
          }

          const sourcePath = await this.getFullPath('test-files', Directory.Data);
          const zipPath = await this.getFullPath('archive.zip', Directory.Data);

          console.log('Starting compression');
          console.log('Source path:', sourcePath);
          console.log('Output path:', zipPath);
          statusEl.textContent = 'Compressing test-files directory...\nOutput: archive.zip';

          await Zip.zip({
            sourcePath: sourcePath,
            destinationPath: zipPath
          });

          console.log('Compression completed');
          statusEl.textContent = 'Compression completed!\nCreated: archive.zip';
        } catch (error) {
          console.error('File operation error details:', error);
          if (error instanceof Error) {
            statusEl.textContent = `Error: ${error.message}`;
          } else {
            statusEl.textContent = `Error: ${JSON.stringify(error)}`;
          }
        }
      });

      // Extraction process
      this.shadowRoot?.querySelector('#unzipBtn')?.addEventListener('click', async () => {
        try {
          statusEl.textContent = 'Extracting files...';
          // Reset progress bar
          progressBar.style.width = '0%';

          // Check and remove existing extraction directory
          try {
            const checkResult = await Filesystem.stat({
              path: 'extracted',
              directory: Directory.Data
            });

            if (checkResult.type === 'directory') {
              console.log('Removing existing extracted directory');
              await Filesystem.rmdir({
                path: 'extracted',
                directory: Directory.Data,
                recursive: true
              });
              statusEl.textContent = 'Removed existing extracted directory';
            }
          } catch (e) {
            // Ignore if directory doesn't exist
            console.log('extracted directory does not exist');
          }

          const zipPath = await this.getFullPath('archive.zip', Directory.Data);
          const extractPath = await this.getFullPath('extracted', Directory.Data);

          console.log('Starting extraction');
          console.log('ZIP file:', zipPath);
          console.log('Extract to:', extractPath);
          statusEl.textContent = 'Extracting archive.zip...\nDestination: extracted directory';

          await Zip.unzip({
            sourceFile: zipPath,
            destinationPath: extractPath
          });

          console.log('Extraction completed');
          statusEl.textContent = 'Extraction completed!\nFiles extracted to: extracted directory';
        } catch (error) {
          console.error('File operation error details:', error);
          if (error instanceof Error) {
            statusEl.textContent = `Error: ${error.message}`;
          } else {
            statusEl.textContent = `Error: ${JSON.stringify(error)}`;
          }
        }
      });
    }

    // File system full path getter helper function
    async getFullPath(path: string, directory: Directory = Directory.Data): Promise<string> {
      const result = await Filesystem.getUri({
        path: path,
        directory: directory
      });
      return result.uri;
    }
  }
); 