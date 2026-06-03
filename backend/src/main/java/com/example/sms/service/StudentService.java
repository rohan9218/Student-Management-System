package com.example.sms.service;

import com.example.sms.dto.StudentDto;
import com.example.sms.entity.Course;
import com.example.sms.entity.Student;
import com.example.sms.exception.BadRequestException;
import com.example.sms.exception.ResourceNotFoundException;
import com.example.sms.repository.CourseRepository;
import com.example.sms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ActivityLogService logService;

    @Autowired
    private EmailService emailService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public List<Student> searchAndFilterStudents(String search, Long courseId, Integer semester) {
        return studentRepository.searchAndFilterStudents(search, courseId, semester);
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    public Student createStudent(StudentDto studentDto, String username) {
        if (studentRepository.findByEmail(studentDto.getEmail()).isPresent()) {
            throw new BadRequestException("Student with email " + studentDto.getEmail() + " already exists.");
        }

        Student student = new Student();
        mapDtoToEntity(studentDto, student);

        if (studentDto.getCourseId() != null) {
            Course course = courseRepository.findById(studentDto.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + studentDto.getCourseId()));
            student.setCourse(course);
        }

        Student saved = studentRepository.save(student);
        logService.log("Registered new student: " + saved.getFirstName() + " " + saved.getLastName() + " (ID: " + saved.getId() + ")", username);
        
        // Trigger Email Notification for registration confirmation
        String emailBody = String.format("Hello %s,\n\nWelcome to our institution! You have been successfully registered for the %s course, Semester %d.\nYour Student ID is: %d.\n\nBest regards,\nAdministration", 
                saved.getFirstName(), (saved.getCourse() != null ? saved.getCourse().getCourseName() : "N/A"), saved.getSemester(), saved.getId());
        emailService.sendEmail(saved.getEmail(), "Registration Confirmation", emailBody);

        return saved;
    }

    public Student updateStudent(Long id, StudentDto studentDto, String username) {
        Student student = getStudentById(id);

        // Check unique email if changing
        if (!student.getEmail().equalsIgnoreCase(studentDto.getEmail()) && 
                studentRepository.findByEmail(studentDto.getEmail()).isPresent()) {
            throw new BadRequestException("Student with email " + studentDto.getEmail() + " already exists.");
        }

        mapDtoToEntity(studentDto, student);

        if (studentDto.getCourseId() != null) {
            Course course = courseRepository.findById(studentDto.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + studentDto.getCourseId()));
            student.setCourse(course);
        } else {
            student.setCourse(null);
        }

        Student updated = studentRepository.save(student);
        logService.log("Updated student details: " + updated.getFirstName() + " " + updated.getLastName() + " (ID: " + updated.getId() + ")", username);
        return updated;
    }

    public void deleteStudent(Long id, String username) {
        Student student = getStudentById(id);
        
        // Delete photo file if it exists locally
        if (student.getPhotoUrl() != null && student.getPhotoUrl().startsWith("/uploads/")) {
            try {
                String filename = student.getPhotoUrl().replace("/uploads/", "");
                Path photoPath = Paths.get(uploadDir).resolve(filename);
                Files.deleteIfExists(photoPath);
            } catch (IOException e) {
                System.err.println("Failed to delete local photo file: " + e.getMessage());
            }
        }

        studentRepository.delete(student);
        logService.log("Deleted student record: " + student.getFirstName() + " " + student.getLastName() + " (ID: " + student.getId() + ")", username);
    }

    public String saveProfilePhoto(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String extension = "";
            String originalFilename = file.getOriginalFilename();
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new BadRequestException("Could not store file. Error: " + e.getMessage());
        }
    }

    private void mapDtoToEntity(StudentDto dto, Student entity) {
        entity.setFirstName(dto.getFirstName());
        entity.setLastName(dto.getLastName());
        entity.setEmail(dto.getEmail());
        entity.setPhone(dto.getPhone());
        entity.setGender(dto.getGender());
        entity.setDob(dto.getDob());
        entity.setAddress(dto.getAddress());
        entity.setSemester(dto.getSemester());
        entity.setAdmissionDate(dto.getAdmissionDate());
        if (dto.getPhotoUrl() != null) {
            entity.setPhotoUrl(dto.getPhotoUrl());
        }
    }
}
