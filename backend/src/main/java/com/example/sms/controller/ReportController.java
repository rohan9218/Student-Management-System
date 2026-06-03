package com.example.sms.controller;

import com.example.sms.entity.Attendance;
import com.example.sms.entity.Marks;
import com.example.sms.entity.Student;
import com.example.sms.repository.AttendanceRepository;
import com.example.sms.repository.MarksRepository;
import com.example.sms.service.ReportService;
import com.example.sms.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private ReportService reportService;

    // =========================================================================
    // STUDENT ROSTER EXPORTS
    // =========================================================================

    @GetMapping("/students/pdf")
    public ResponseEntity<InputStreamResource> downloadStudentsPdf(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer semester) {
        List<Student> students = studentService.searchAndFilterStudents(search, courseId, semester);
        ByteArrayInputStream bis = reportService.generateStudentPdf(students);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=students_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/students/excel")
    public ResponseEntity<InputStreamResource> downloadStudentsExcel(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer semester) {
        List<Student> students = studentService.searchAndFilterStudents(search, courseId, semester);
        ByteArrayInputStream bis = reportService.generateStudentExcel(students);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=students_report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/students/csv")
    public ResponseEntity<InputStreamResource> downloadStudentsCsv(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer semester) {
        List<Student> students = studentService.searchAndFilterStudents(search, courseId, semester);
        ByteArrayInputStream bis = reportService.generateStudentCsv(students);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=students_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(bis));
    }

    // =========================================================================
    // MARKS EXPORTS
    // =========================================================================

    @GetMapping("/marks/pdf")
    public ResponseEntity<InputStreamResource> downloadMarksPdf(@RequestParam(required = false) Long studentId) {
        List<Marks> marks = (studentId != null) ? marksRepository.findByStudentId(studentId) : marksRepository.findAll();
        ByteArrayInputStream bis = reportService.generateMarksPdf(marks);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=marks_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/marks/excel")
    public ResponseEntity<InputStreamResource> downloadMarksExcel(@RequestParam(required = false) Long studentId) {
        List<Marks> marks = (studentId != null) ? marksRepository.findByStudentId(studentId) : marksRepository.findAll();
        ByteArrayInputStream bis = reportService.generateMarksExcel(marks);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=marks_report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/marks/csv")
    public ResponseEntity<InputStreamResource> downloadMarksCsv(@RequestParam(required = false) Long studentId) {
        List<Marks> marks = (studentId != null) ? marksRepository.findByStudentId(studentId) : marksRepository.findAll();
        ByteArrayInputStream bis = reportService.generateMarksCsv(marks);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=marks_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(bis));
    }

    // =========================================================================
    // ATTENDANCE EXPORTS
    // =========================================================================

    @GetMapping("/attendance/pdf")
    public ResponseEntity<InputStreamResource> downloadAttendancePdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate searchDate = (date != null) ? date : LocalDate.now();
        List<Attendance> attendances = attendanceRepository.findByAttendanceDate(searchDate);
        ByteArrayInputStream bis = reportService.generateAttendancePdf(attendances);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/attendance/excel")
    public ResponseEntity<InputStreamResource> downloadAttendanceExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate searchDate = (date != null) ? date : LocalDate.now();
        List<Attendance> attendances = attendanceRepository.findByAttendanceDate(searchDate);
        ByteArrayInputStream bis = reportService.generateAttendanceExcel(attendances);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/attendance/csv")
    public ResponseEntity<InputStreamResource> downloadAttendanceCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate searchDate = (date != null) ? date : LocalDate.now();
        List<Attendance> attendances = attendanceRepository.findByAttendanceDate(searchDate);
        ByteArrayInputStream bis = reportService.generateAttendanceCsv(attendances);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(bis));
    }
}
