package com.example.sms.controller;

import com.example.sms.service.BackupRestoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
@PreAuthorize("hasRole('ADMIN')")
public class SystemController {

    @Autowired
    private BackupRestoreService backupRestoreService;

    @GetMapping("/backup")
    public ResponseEntity<InputStreamResource> backupDatabase() {
        byte[] sqlData = backupRestoreService.backupDatabase();
        ByteArrayInputStream bis = new ByteArrayInputStream(sqlData);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=student_management_db_backup.sql")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(bis));
    }

    @PostMapping("/restore")
    public ResponseEntity<Map<String, String>> restoreDatabase(@RequestParam("file") MultipartFile file) {
        try {
            byte[] sqlContent = file.getBytes();
            backupRestoreService.restoreDatabase(sqlContent);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Database restored successfully.");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to read upload file: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
