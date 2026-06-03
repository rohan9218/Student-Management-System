package com.example.sms.service;

import com.example.sms.dto.MarksDto;
import com.example.sms.entity.Marks;
import com.example.sms.entity.Student;
import com.example.sms.exception.BadRequestException;
import com.example.sms.exception.ResourceNotFoundException;
import com.example.sms.repository.MarksRepository;
import com.example.sms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MarksService {

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ActivityLogService logService;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Marks addOrUpdateMarks(MarksDto dto, String username) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        if (dto.getMarksObtained() > dto.getTotalMarks()) {
            throw new BadRequestException("Marks obtained cannot be greater than total marks.");
        }

        double percentage = (dto.getMarksObtained() / dto.getTotalMarks()) * 100.0;
        String grade = calculateGrade(percentage);
        String resultStatus = grade.equalsIgnoreCase("Fail") ? "Fail" : "Pass";

        Optional<Marks> existingOpt = marksRepository.findByStudentIdAndSubject(dto.getStudentId(), dto.getSubject());
        
        Marks marks;
        if (existingOpt.isPresent()) {
            marks = existingOpt.get();
        } else {
            marks = new Marks();
            marks.setStudent(student);
            marks.setSubject(dto.getSubject());
        }

        marks.setMarksObtained(dto.getMarksObtained());
        marks.setTotalMarks(dto.getTotalMarks());
        marks.setPercentage(percentage);
        marks.setGrade(grade);
        marks.setResultStatus(resultStatus);

        Marks saved = marksRepository.save(marks);
        logService.log("Saved marks for " + student.getFirstName() + " " + student.getLastName() + " in subject: " + dto.getSubject(), username);

        // Send Email notification for results
        String emailBody = String.format("Hello %s,\n\nYour results for the subject '%s' have been declared:\n" +
                "Marks Obtained: %.1f / %.1f\n" +
                "Percentage: %.2f%%\n" +
                "Grade: %s\n" +
                "Status: %s\n\nBest regards,\nExamination Department",
                student.getFirstName(), saved.getSubject(), saved.getMarksObtained(), saved.getTotalMarks(), saved.getPercentage(), saved.getGrade(), saved.getResultStatus());
        emailService.sendEmail(student.getEmail(), "Academic Results Declared: " + saved.getSubject(), emailBody);

        return saved;
    }

    public List<Marks> getStudentMarks(Long studentId) {
        return marksRepository.findByStudentId(studentId);
    }

    @Transactional
    public void deleteMarks(Long id, String username) {
        Marks marks = marksRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marks entry not found with id: " + id));
        
        marksRepository.delete(marks);
        logService.log("Deleted marks record: ID " + id + " for student ID " + marks.getStudent().getId(), username);
    }

    private String calculateGrade(double percentage) {
        if (percentage >= 90.0) return "A+";
        if (percentage >= 80.0) return "A";
        if (percentage >= 70.0) return "B";
        if (percentage >= 60.0) return "C";
        return "Fail";
    }
}
