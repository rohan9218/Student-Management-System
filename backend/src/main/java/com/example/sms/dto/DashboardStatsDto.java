package com.example.sms.dto;

import com.example.sms.entity.ActivityLog;
import java.util.List;

public class DashboardStatsDto {
    private long totalStudents;
    private long totalCourses;
    private long totalAttendanceRecords;
    private double attendancePercentage;
    private double averagePerformance;
    private List<ActivityLog> recentActivities;
    private List<StudentPerformance> topPerformers;

    public DashboardStatsDto() {}

    public DashboardStatsDto(long totalStudents, long totalCourses, long totalAttendanceRecords, double attendancePercentage, double averagePerformance, List<ActivityLog> recentActivities, List<StudentPerformance> topPerformers) {
        this.totalStudents = totalStudents;
        this.totalCourses = totalCourses;
        this.totalAttendanceRecords = totalAttendanceRecords;
        this.attendancePercentage = attendancePercentage;
        this.averagePerformance = averagePerformance;
        this.recentActivities = recentActivities;
        this.topPerformers = topPerformers;
    }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalCourses() { return totalCourses; }
    public void setTotalCourses(long totalCourses) { this.totalCourses = totalCourses; }

    public long getTotalAttendanceRecords() { return totalAttendanceRecords; }
    public void setTotalAttendanceRecords(long totalAttendanceRecords) { this.totalAttendanceRecords = totalAttendanceRecords; }

    public double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }

    public double getAveragePerformance() { return averagePerformance; }
    public void setAveragePerformance(double averagePerformance) { this.averagePerformance = averagePerformance; }

    public List<ActivityLog> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<ActivityLog> recentActivities) { this.recentActivities = recentActivities; }

    public List<StudentPerformance> getTopPerformers() { return topPerformers; }
    public void setTopPerformers(List<StudentPerformance> topPerformers) { this.topPerformers = topPerformers; }

    public static class StudentPerformance {
        private Long studentId;
        private String studentName;
        private String courseCode;
        private double averagePercentage;
        private String grade;

        public StudentPerformance() {}

        public StudentPerformance(Long studentId, String studentName, String courseCode, double averagePercentage, String grade) {
            this.studentId = studentId;
            this.studentName = studentName;
            this.courseCode = courseCode;
            this.averagePercentage = averagePercentage;
            this.grade = grade;
        }

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public String getCourseCode() { return courseCode; }
        public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

        public double getAveragePercentage() { return averagePercentage; }
        public void setAveragePercentage(double averagePercentage) { this.averagePercentage = averagePercentage; }

        public String getGrade() { return grade; }
        public void setGrade(String grade) { this.grade = grade; }
    }
}
