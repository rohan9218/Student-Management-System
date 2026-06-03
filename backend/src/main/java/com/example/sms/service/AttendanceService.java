package com.example.sms.service;

import com.example.sms.dto.AttendanceMarkRequest;
import com.example.sms.entity.Attendance;
import com.example.sms.entity.Student;
import com.example.sms.repository.AttendanceRepository;
import com.example.sms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ActivityLogService logService;

    @Autowired
    private EmailService emailService;

    @Transactional
    public void markAttendance(AttendanceMarkRequest request, String username) {
        LocalDate date = request.getDate();
        if (date == null) {
            date = LocalDate.now();
        }

        for (AttendanceMarkRequest.StudentAttendance record : request.getRecords()) {
            Optional<Student> studentOpt = studentRepository.findById(record.getStudentId());
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                Optional<Attendance> existing = attendanceRepository.findByStudentIdAndAttendanceDate(student.getId(), date);
                
                Attendance attendance;
                if (existing.isPresent()) {
                    attendance = existing.get();
                    attendance.setStatus(record.getStatus().toUpperCase());
                } else {
                    attendance = new Attendance();
                    attendance.setStudent(student);
                    attendance.setAttendanceDate(date);
                    attendance.setStatus(record.getStatus().toUpperCase());
                }
                attendanceRepository.save(attendance);

                // Send email alert for absences
                if ("ABSENT".equalsIgnoreCase(record.getStatus())) {
                    String emailBody = String.format("Hello %s %s,\n\nYou have been marked ABSENT on %s.\nPlease contact the administration if you believe this is an error.\n\nBest regards,\nAttendance Office",
                            student.getFirstName(), student.getLastName(), date.toString());
                    emailService.sendEmail(student.getEmail(), "Attendance Alert: Absent", emailBody);
                }
            }
        }
        logService.log("Marked attendance for date: " + date, username);
    }

    public List<Attendance> getDailyAttendance(LocalDate date) {
        return attendanceRepository.findByAttendanceDate(date);
    }

    public List<Attendance> getStudentAttendanceHistory(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public double getAttendancePercentage(Long studentId) {
        Long total = attendanceRepository.countByStudentId(studentId);
        if (total == 0) return 100.0; // Default if no class has been held

        Long present = attendanceRepository.countByStudentIdAndStatus(studentId, "PRESENT");
        return (present * 100.0) / total;
    }
}
