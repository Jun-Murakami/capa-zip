import Foundation
import Capacitor
import SSZipArchive

/**
 * Zip file manipulation plugin for Capacitor
 */
@objc(ZipPlugin)
public class ZipPlugin: CAPPlugin {
    private let fileManager = FileManager.default
    
    override public func load() {
        print("ZipPlugin: Plugin loaded")
    }
    
    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": value
        ])
    }

    // ディレクトリ内の全ファイルサイズを計算
    private func calculateTotalSize(at path: String) -> UInt64 {
        var totalSize: UInt64 = 0
        guard let enumerator = fileManager.enumerator(atPath: path) else { return 0 }
        
        while let filePath = enumerator.nextObject() as? String {
            let fullPath = (path as NSString).appendingPathComponent(filePath)
            do {
                let attrs = try fileManager.attributesOfItem(atPath: fullPath)
                if attrs[.type] as? FileAttributeType == .typeRegular {
                    totalSize += attrs[.size] as? UInt64 ?? 0
                }
            } catch {
                print("Error calculating size for \(fullPath): \(error)")
            }
        }
        return totalSize
    }
    
    @objc func zip(_ call: CAPPluginCall) {
        guard let sourcePath = call.getString("sourcePath") else {
            call.reject("Must provide source path")
            return
        }
        
        guard let destinationPath = call.getString("destinationPath") else {
            call.reject("Must provide destination path")
            return
        }
        
        guard let normalizedSourcePath = normalizePath(sourcePath),
              let normalizedDestPath = normalizePath(destinationPath) else {
            call.reject("Invalid file path")
            return
        }
        
        // 圧縮前に全体のサイズを計算
        let totalSize = calculateTotalSize(at: normalizedSourcePath)
        var processedSize: UInt64 = 0
        
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let success = SSZipArchive.createZipFile(atPath: normalizedDestPath,
                                                       withContentsOfDirectory: normalizedSourcePath,
                                                       keepParentDirectory: false,
                                                       compressionLevel: -1,
                                                       password: nil,
                                                       aes: false,
                                                       progressHandler: { (entryNumber, total) in
                    // エントリごとにファイルサイズを加算
                    if let currentFile = self.fileManager.enumerator(atPath: normalizedSourcePath)?
                        .allObjects[Int(entryNumber) - 1] as? String {
                        let fullPath = (normalizedSourcePath as NSString)
                            .appendingPathComponent(currentFile)
                        if let attrs = try? self.fileManager.attributesOfItem(atPath: fullPath),
                           attrs[.type] as? FileAttributeType == .typeRegular {
                            processedSize += attrs[.size] as? UInt64 ?? 0
                        }
                    }
                    
                    self.notifyListeners("zipProgress", data: [
                        "loaded": Int(processedSize),
                        "total": Int(totalSize)
                    ])
                })
                
                if success {
                    // 最終プログレス更新
                    self.notifyListeners("zipProgress", data: [
                        "loaded": Int(totalSize),
                        "total": Int(totalSize)
                    ])
                    call.resolve()
                } else {
                    call.reject("Failed to create zip file")
                }
            } catch {
                call.reject("Error creating zip file: \(error.localizedDescription)")
            }
        }
    }

    @objc func unzip(_ call: CAPPluginCall) {
        guard let sourceFile = call.getString("sourceFile"),
              let destinationPath = call.getString("destinationPath") else {
            call.reject("Both sourceFile and destinationPath are required")
            return
        }
        
        guard let normalizedSourcePath = normalizePath(sourceFile),
              let normalizedDestPath = normalizePath(destinationPath) else {
            call.reject("Invalid file path")
            return
        }
        
        guard fileManager.fileExists(atPath: normalizedSourcePath) else {
            call.reject("Source file does not exist")
            return
        }
        
        // ZIPファイルの合計サイズを取得
        guard let zipInfo = try? fileManager.attributesOfItem(atPath: normalizedSourcePath),
              let totalSize = zipInfo[.size] as? UInt64 else {
            call.reject("Unable to get zip file size")
            return
        }
        
        var processedSize: UInt64 = 0
        
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let success = SSZipArchive.unzipFile(atPath: normalizedSourcePath,
                                                   toDestination: normalizedDestPath,
                                                   overwrite: true,
                                                   password: nil,
                                                   progressHandler: { (entry, fileInfo, entryNumber, total) in
                    // エントリごとのサイズを加算
                    processedSize += UInt64(fileInfo.uncompressed_size)
                    
                    self.notifyListeners("zipProgress", data: [
                        "loaded": Int(processedSize),
                        "total": Int(totalSize)
                    ])
                })
                
                if success {
                    // 最終プログレス更新
                    self.notifyListeners("zipProgress", data: [
                        "loaded": Int(totalSize),
                        "total": Int(totalSize)
                    ])
                    self.setDefaultPermissions(path: normalizedDestPath)
                    call.resolve()
                } else {
                    call.reject("Failed to unzip file")
                }
            } catch {
                call.reject("Error unzipping file: \(error.localizedDescription)")
            }
        }
    }
    
    // パスの正規化とサンドボックスチェック
    private func normalizePath(_ path: String) -> String? {
        // file:// URLの処理
        if path.hasPrefix("file://") {
            if let url = URL(string: path),
               let filePath = try? url.path.removingPercentEncoding {
                return filePath
            }
            return nil
        }
        
        // documents/ プレフィックスの処理
        if path.hasPrefix("documents/") {
            let documentsPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)[0]
            let relativePath = String(path.dropFirst("documents/".count))
            return (documentsPath as NSString).appendingPathComponent(relativePath)
        }
        
        // 絶対パスの処理
        if path.hasPrefix("/") {
            return path
        }
        
        // 相対パスの処理
        let documentsPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)[0]
        return (documentsPath as NSString).appendingPathComponent(path)
    }
    
    // デフォルトのファイルパーミッション設定
    private func setDefaultPermissions(path: String) {
        guard let enumerator = fileManager.enumerator(atPath: path) else { return }
        
        while let filePath = enumerator.nextObject() as? String {
            let fullPath = (path as NSString).appendingPathComponent(filePath)
            var isDirectory: ObjCBool = false
            
            if fileManager.fileExists(atPath: fullPath, isDirectory: &isDirectory) {
                do {
                    try fileManager.setAttributes([
                        .posixPermissions: isDirectory.boolValue ? 0o755 : 0o644
                    ], ofItemAtPath: fullPath)
                } catch {
                    print("Failed to set permissions for \(fullPath): \(error.localizedDescription)")
                }
            }
        }
    }
} 
