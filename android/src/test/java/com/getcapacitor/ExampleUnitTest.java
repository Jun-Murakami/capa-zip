package com.getcursor.plugins.zip;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class ZipPluginTest {
    @Rule
    public TemporaryFolder testFolder = new TemporaryFolder();
    
    private ZipPlugin zipPlugin;
    
    @Before
    public void setUp() {
        zipPlugin = new ZipPlugin();
    }
    
    @Test
    public void testZipAndUnzip() throws IOException {
        // テストファイルの作成
        File sourceFile = testFolder.newFile("test.txt");
        String testContent = "Hello, Zip Test!";
        try (FileWriter writer = new FileWriter(sourceFile)) {
            writer.write(testContent);
        }
        
        File zipFile = new File(testFolder.getRoot(), "test.zip");
        File extractDir = testFolder.newFolder("extracted");
        
        // 圧縮テスト
        assertTrue("Zip operation should succeed", 
            zipPlugin.zip(sourceFile.getAbsolutePath(), zipFile.getAbsolutePath()));
        assertTrue("Zip file should exist", zipFile.exists());
        
        // 解凍テスト
        assertTrue("Unzip operation should succeed",
            zipPlugin.unzip(zipFile.getAbsolutePath(), extractDir.getAbsolutePath()));
        
        File extractedFile = new File(extractDir, "test.txt");
        assertTrue("Extracted file should exist", extractedFile.exists());
    }
    
    @Test
    public void testZipWithInvalidSource() {
        File nonExistentFile = new File(testFolder.getRoot(), "nonexistent.txt");
        File zipFile = new File(testFolder.getRoot(), "error.zip");
        
        assertFalse("Zip operation should fail with non-existent source",
            zipPlugin.zip(nonExistentFile.getAbsolutePath(), zipFile.getAbsolutePath()));
    }
    
    @Test
    public void testUnzipWithInvalidZipFile() {
        File invalidZip = new File(testFolder.getRoot(), "invalid.zip");
        File extractDir = new File(testFolder.getRoot(), "extract");
        
        assertFalse("Unzip operation should fail with invalid zip file",
            zipPlugin.unzip(invalidZip.getAbsolutePath(), extractDir.getAbsolutePath()));
    }
}