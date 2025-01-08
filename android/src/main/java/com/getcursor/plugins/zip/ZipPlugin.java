package com.getcursor.plugins.zip;

import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.OpenableColumns;
import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import org.json.JSONException;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@CapacitorPlugin(
    name = "Zip",
    permissions = {
        @Permission(
            strings = {
                android.Manifest.permission.READ_EXTERNAL_STORAGE,
                android.Manifest.permission.WRITE_EXTERNAL_STORAGE
            },
            alias = "storage"
        )
    }
)
public class ZipPlugin extends Plugin {
    private static final String TAG = "ZipPlugin";

    private String getFilePathFromUri(String uriString) {
        try {
            Uri uri = Uri.parse(uriString);
            if (uri.getScheme() != null) {
                if (uri.getScheme().equals("file")) {
                    return uri.getPath();
                } else if (uri.getScheme().equals("content")) {
                    try {
                        return getContentPathFromUri(getContext(), uri);
                    } catch (Exception e) {
                        Log.e(TAG, "Error getting real path from URI", e);
                        return null;
                    }
                }
            }
            return uriString;
        } catch (Exception e) {
            Log.e(TAG, "Error parsing URI", e);
            return uriString;
        }
    }

    private String getContentPathFromUri(Context context, Uri uri) throws Exception {
        return uri.toString();
    }

    private void addToZip(File file, String fileName, ZipOutputStream zos, byte[] buffer) throws IOException {
        FileInputStream fis = new FileInputStream(file);
        ZipEntry zipEntry = new ZipEntry(fileName);
        zos.putNextEntry(zipEntry);

        long fileSize = file.length();
        long processedSize = 0;
        int length;

        while ((length = fis.read(buffer)) > 0) {
            zos.write(buffer, 0, length);
            processedSize += length;

            // Notify progress
            JSObject progress = new JSObject();
            progress.put("loaded", processedSize);
            progress.put("total", fileSize);
            notifyListeners("zipProgress", progress);
        }

        zos.closeEntry();
        fis.close();
    }

    private long calculateTotalSize(File directory) {
        long size = 0;
        File[] files = directory.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isFile()) {
                    size += file.length();
                } else if (file.isDirectory()) {
                    size += calculateTotalSize(file);
                }
            }
        }
        return size;
    }

    @PluginMethod(returnType = PluginMethod.RETURN_PROMISE)
    public void zip(PluginCall call) {
        String sourcePath = getFilePathFromUri(call.getString("sourcePath"));
        String destinationPath = getFilePathFromUri(call.getString("destinationPath"));
        JSArray filesArray = call.getArray("files");

        if (sourcePath == null || destinationPath == null) {
            call.reject("Source path and destination path are required");
            return;
        }

        try {
            File sourceFile = new File(sourcePath);
            if (!sourceFile.exists()) {
                Log.e(TAG, "Source path does not exist: " + sourcePath);
                call.reject("Source path does not exist");
                return;
            }

            // Calculate total size
            long totalSize = sourceFile.isDirectory() ? calculateTotalSize(sourceFile) : sourceFile.length();
            long processedSize = 0;

            FileOutputStream fos = new FileOutputStream(destinationPath);
            ZipOutputStream zos = new ZipOutputStream(new BufferedOutputStream(fos));
            byte[] buffer = new byte[8192]; // Increased buffer size

            if (sourceFile.isDirectory()) {
                List<String> fileList = new ArrayList<>();
                if (filesArray != null) {
                    try {
                        // 特定のファイルのみを圧縮
                        for (int i = 0; i < filesArray.length(); i++) {
                            fileList.add(filesArray.getString(i));
                        }
                        for (String filePath : fileList) {
                            File file = new File(sourceFile, filePath);
                            if (file.exists()) {
                                addToZip(file, filePath, zos, buffer);
                                processedSize += file.length();
                            }
                        }
                    } catch (JSONException e) {
                        Log.e(TAG, "Error parsing files array", e);
                        call.reject("Error parsing files array: " + e.getMessage());
                        return;
                    }
                } else {
                    // ディレクトリ全体を圧縮
                    addDirectoryToZip(sourceFile, "", zos, buffer);
                }
            } else {
                // 単一ファイルの圧縮
                addToZip(sourceFile, sourceFile.getName(), zos, buffer);
            }

            zos.close();
            
            // Final progress update
            JSObject finalProgress = new JSObject();
            finalProgress.put("loaded", totalSize);
            finalProgress.put("total", totalSize);
            notifyListeners("zipProgress", finalProgress);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);

        } catch (IOException e) {
            Log.e(TAG, "Error creating zip file", e);
            call.reject("Error creating zip file: " + e.getMessage());
        }
    }

    @PluginMethod(returnType = PluginMethod.RETURN_PROMISE)
    public void unzip(PluginCall call) {
        String sourceFile = getFilePathFromUri(call.getString("sourceFile"));
        String destinationPath = getFilePathFromUri(call.getString("destinationPath"));

        if (sourceFile == null || destinationPath == null) {
            call.reject("Source file and destination path are required");
            return;
        }

        try {
            InputStream inputStream;
            if (sourceFile.startsWith("content://")) {
                Uri uri = Uri.parse(sourceFile);
                inputStream = getContext().getContentResolver().openInputStream(uri);
            } else {
                File zipFile = new File(sourceFile);
                if (!zipFile.exists()) {
                    call.reject("Source file does not exist");
                    return;
                }
                inputStream = new FileInputStream(zipFile);
            }

            File destDir = new File(destinationPath);
            if (!destDir.exists() && !destDir.mkdirs()) {
                call.reject("Could not create destination directory");
                return;
            }

            byte[] buffer = new byte[32768];
            ZipInputStream zis = new ZipInputStream(new BufferedInputStream(inputStream, 32768));

            // まず解凍後の合計�イズを計算
            long totalUncompressedSize = 0;
            List<ZipEntryInfo> entries = new ArrayList<>();
            ZipEntry ze;
            while ((ze = zis.getNextEntry()) != null) {
                if (!ze.isDirectory()) {
                    entries.add(new ZipEntryInfo(ze.getName(), ze.getSize()));
                    totalUncompressedSize += ze.getSize();
                }
                zis.closeEntry();
            }
            zis.close();
            inputStream.close();

            // 再度ストリームを開く
            if (sourceFile.startsWith("content://")) {
                Uri uri = Uri.parse(sourceFile);
                inputStream = getContext().getContentResolver().openInputStream(uri);
            } else {
                inputStream = new FileInputStream(sourceFile);
            }
            zis = new ZipInputStream(new BufferedInputStream(inputStream, 32768));

            // 進捗状況の追跡
            long processedSize = 0;

            while ((ze = zis.getNextEntry()) != null) {
                String fileName = ze.getName();
                if (ze.isDirectory()) {
                    new File(destDir, fileName).mkdirs();
                    continue;
                }

                File newFile = new File(destDir, fileName);
                new File(newFile.getParent()).mkdirs();
                
                FileOutputStream fos = new FileOutputStream(newFile);
                BufferedOutputStream bos = new BufferedOutputStream(fos, 32768);

                int count;
                while ((count = zis.read(buffer)) != -1) {
                    bos.write(buffer, 0, count);
                    processedSize += count;
                    
                    // 進捗状況の通知
                    JSObject progress = new JSObject();
                    progress.put("loaded", processedSize);
                    progress.put("total", totalUncompressedSize);
                    notifyListeners("zipProgress", progress);
                }

                bos.close();
                zis.closeEntry();
            }

            zis.close();
            inputStream.close();

            // 最終進捗の通知
            JSObject finalProgress = new JSObject();
            finalProgress.put("loaded", totalUncompressedSize);
            finalProgress.put("total", totalUncompressedSize);
            notifyListeners("zipProgress", finalProgress);

            call.resolve();

        } catch (IOException e) {
            Log.e(TAG, "Error unzipping file", e);
            call.reject("Error unzipping file: " + e.getMessage());
        }
    }

    private void addDirectoryToZip(File directory, String parentPath, ZipOutputStream zos, byte[] buffer) throws IOException {
        File[] files = directory.listFiles();
        if (files != null) {
            for (File file : files) {
                String path = parentPath.isEmpty() ? file.getName() : parentPath + "/" + file.getName();
                if (file.isDirectory()) {
                    addDirectoryToZip(file, path, zos, buffer);
                } else {
                    addToZip(file, path, zos, buffer);
                }
            }
        }
    }

    // ZIPエントリー情報を保持するた�のヘルパークラス
    private static class ZipEntryInfo {
        String name;
        long size;

        ZipEntryInfo(String name, long size) {
            this.name = name;
            this.size = size;
        }
    }
} 