package com.example.sms.service;

import com.example.sms.entity.Course;
import com.example.sms.exception.ResourceNotFoundException;
import com.example.sms.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ActivityLogService logService;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
    }

    public Course createCourse(Course course, String username) {
        Course saved = courseRepository.save(course);
        logService.log("Created course: " + course.getCourseCode(), username);
        return saved;
    }

    public Course updateCourse(Long id, Course courseDetails, String username) {
        Course course = getCourseById(id);
        course.setCourseName(courseDetails.getCourseName());
        course.setCourseCode(courseDetails.getCourseCode());
        course.setDuration(courseDetails.getDuration());
        course.setDescription(courseDetails.getDescription());

        Course updated = courseRepository.save(course);
        logService.log("Updated course: " + updated.getCourseCode(), username);
        return updated;
    }

    public void deleteCourse(Long id, String username) {
        Course course = getCourseById(id);
        courseRepository.delete(course);
        logService.log("Deleted course: " + course.getCourseCode(), username);
    }
}
