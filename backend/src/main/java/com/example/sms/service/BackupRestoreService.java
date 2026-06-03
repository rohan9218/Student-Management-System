package com.example.sms.service;

import com.example.sms.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;

@Service
public class BackupRestoreService {

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    // We configure the database name from the datasource url or set default
    private final String dbName = "student_management_db";

    private final String mysqlPath = "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\";

    public byte[] backupDatabase() {
        String mysqldumpTool = mysqlPath + "mysqldump.exe";
        
        // Command layout: mysqldump -u username -ppassword dbname
        // Note: No space between -p and password!
        String passwordParam = (dbPassword != null && !dbPassword.isEmpty()) ? "-p" + dbPassword : "";
        
        ProcessBuilder pb;
        if (passwordParam.isEmpty()) {
            pb = new ProcessBuilder(mysqldumpTool, "-u", dbUser, "--databases", dbName);
        } else {
            pb = new ProcessBuilder(mysqldumpTool, "-u", dbUser, passwordParam, "--databases", dbName);
        }

        try {
            Process process = pb.start();
            
            try (InputStream is = process.getInputStream();
                 ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                 
                byte[] buffer = new byte[1024];
                int len;
                while ((len = is.read(buffer)) != -1) {
                    baos.write(buffer, 0, len);
                }
                
                int exitCode = process.waitFor();
                if (exitCode != 0) {
                    // Try to read error stream
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                        String errors = reader.lines().reduce("", (acc, line) -> acc + line + "\n");
                        System.err.println("mysqldump failed: " + errors);
                    }
                    throw new BadRequestException("Database backup failed (Exit Code " + exitCode + "). Check server logs.");
                }
                
                return baos.toByteArray();
            }
        } catch (Exception ex) {
            throw new BadRequestException("Could not run backup tool. Make sure MySQL Server is running and bin path is correct. Error: " + ex.getMessage());
        }
    }

    public void restoreDatabase(byte[] sqlContent) {
        String mysqlTool = mysqlPath + "mysql.exe";
        String passwordParam = (dbPassword != null && !dbPassword.isEmpty()) ? "-p" + dbPassword : "";

        ProcessBuilder pb;
        if (passwordParam.isEmpty()) {
            pb = new ProcessBuilder(mysqlTool, "-u", dbUser);
        } else {
            pb = new ProcessBuilder(mysqlTool, "-u", dbUser, passwordParam);
        }

        try {
            Process process = pb.start();

            // Pipe sql content into MySQL process input stream
            try (OutputStream os = process.getOutputStream()) {
                os.write(sqlContent);
                os.flush();
            }

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                    String errors = reader.lines().reduce("", (acc, line) -> acc + line + "\n");
                    System.err.println("mysql restore failed: " + errors);
                }
                throw new BadRequestException("Database restore failed (Exit Code " + exitCode + ").");
            }
        } catch (Exception ex) {
            throw new BadRequestException("Could not run restore tool. Error: " + ex.getMessage());
        }
    }
}
