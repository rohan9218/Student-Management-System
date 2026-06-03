package com.example.sms.controller;

import com.example.sms.dto.AttendanceMarkRequest;
import com.example.sms.entity.Attendance;
import com.example.sms.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Map<String, String>> markAttendance(
            @RequestBody AttendanceMarkRequest request,
            Principal principal) {
        attendanceService.markAttendance(request, principal.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Attendance saved successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/daily")
    public ResponseEntity<List<Attendance>> getDailyAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate searchDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(attendanceService.getDailyAttendance(searchDate));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Attendance>> getStudentHistory(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceHistory(studentId));
    }

    @GetMapping("/student/{studentId}/percentage")
    public ResponseEntity<Map<String, Double>> getStudentPercentage(@PathVariable Long studentId) {
        double percentage = attendanceService.getAttendancePercentage(studentId);
        Map<String, Double> response = new HashMap<>();
        response.put("percentage", percentage);
        return ResponseEntity.ok(response);
    }
}
