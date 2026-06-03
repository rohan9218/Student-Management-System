package com.example.sms.repository;

import com.example.sms.entity.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MarksRepository extends JpaRepository<Marks, Long> {
    List<Marks> findByStudentId(Long studentId);
    Optional<Marks> findByStudentIdAndSubject(Long studentId, String subject);
    void deleteByStudentId(Long studentId);
}
