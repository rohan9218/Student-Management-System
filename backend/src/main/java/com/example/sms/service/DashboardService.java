package com.example.sms.service;

import com.example.sms.dto.DashboardStatsDto;
import com.example.sms.entity.Attendance;
import com.example.sms.entity.Marks;
import com.example.sms.entity.Student;
import com.example.sms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public DashboardStatsDto getDashboardStats() {
        long totalStudents = studentRepository.count();
        long totalCourses = courseRepository.count();
        long totalAttendance = attendanceRepository.count();

        // Calculate attendance rate
        double attendancePercent = 100.0;
        if (totalAttendance > 0) {
            long presentCount = attendanceRepository.findAll().stream()
                    .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()))
                    .count();
            attendancePercent = (presentCount * 100.0) / totalAttendance;
        }

        // Calculate system-wide average performance
        List<Marks> allMarks = marksRepository.findAll();
        double avgPerformance = 0.0;
        if (!allMarks.isEmpty()) {
            avgPerformance = allMarks.stream()
                    .mapToDouble(Marks::getPercentage)
                    .average()
                    .orElse(0.0);
        }

        // Fetch recent activity logs (limit to 6)
        List<com.example.sms.entity.ActivityLog> recentActivities = activityLogRepository.findAllByOrderByTimestampDesc()
                .stream()
                .limit(6)
                .collect(Collectors.toList());

        // Compute top performing students
        List<DashboardStatsDto.StudentPerformance> topPerformers = calculateTopPerformers(allMarks);

        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalStudents(totalStudents);
        stats.setTotalCourses(totalCourses);
        stats.setTotalAttendanceRecords(totalAttendance);
        stats.setAttendancePercentage(attendancePercent);
        stats.setAveragePerformance(avgPerformance);
        stats.setRecentActivities(recentActivities);
        stats.setTopPerformers(topPerformers);

        return stats;
    }

    private List<DashboardStatsDto.StudentPerformance> calculateTopPerformers(List<Marks> allMarks) {
        if (allMarks.isEmpty()) {
            return Collections.emptyList();
        }

        // Group marks by student
        Map<Student, List<Marks>> studentMarksMap = allMarks.stream()
                .collect(Collectors.groupingBy(Marks::getStudent));

        List<DashboardStatsDto.StudentPerformance> performances = new ArrayList<>();

        for (Map.Entry<Student, List<Marks>> entry : studentMarksMap.entrySet()) {
            Student s = entry.getKey();
            List<Marks> marksList = entry.getValue();

            double avgPercent = marksList.stream()
                    .mapToDouble(Marks::getPercentage)
                    .average()
                    .orElse(0.0);

            String courseCode = (s.getCourse() != null) ? s.getCourse().getCourseCode() : "N/A";
            String fullName = s.getFirstName() + " " + s.getLastName();
            String grade = calculateOverallGrade(avgPercent);

            performersAdd(performances, s.getId(), fullName, courseCode, avgPercent, grade);
        }

        // Sort descending by average percentage and limit to top 5
        return performances.stream()
                .sorted(Comparator.comparingDouble(DashboardStatsDto.StudentPerformance::getAveragePercentage).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    private void performersAdd(List<DashboardStatsDto.StudentPerformance> list, Long id, String name, String course, double avg, String grade) {
        list.add(new DashboardStatsDto.StudentPerformance(id, name, course, avg, grade));
    }

    private String calculateOverallGrade(double percentage) {
        if (percentage >= 90.0) return "A+";
        if (percentage >= 80.0) return "A";
        if (percentage >= 70.0) return "B";
        if (percentage >= 60.0) return "C";
        return "Fail";
    }
}
