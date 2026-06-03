package com.example.sms.repository;

import com.example.sms.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);
    List<Student> findByCourseId(Long courseId);

    @Query("SELECT s FROM Student s WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(s.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(s.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " CAST(s.id AS string) LIKE CONCAT('%', :search, '%')) " +
           "AND (:courseId IS NULL OR s.course.id = :courseId) " +
           "AND (:semester IS NULL OR s.semester = :semester)")
    List<Student> searchAndFilterStudents(
        @Param("search") String search,
        @Param("courseId") Long courseId,
        @Param("semester") Integer semester
    );
}
