package com.example.sms.dto;

import java.time.LocalDate;
import java.util.List;

public class AttendanceMarkRequest {
    private LocalDate date;
    private List<StudentAttendance> records;

    public AttendanceMarkRequest() {}

    public AttendanceMarkRequest(LocalDate date, List<StudentAttendance> records) {
        this.date = date;
        this.records = records;
    }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public List<StudentAttendance> getRecords() { return records; }
    public void setRecords(List<StudentAttendance> records) { this.records = records; }

    public static class StudentAttendance {
        private Long studentId;
        private String status; // PRESENT, ABSENT

        public StudentAttendance() {}

        public StudentAttendance(Long studentId, String status) {
            this.studentId = studentId;
            this.status = status;
        }

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
