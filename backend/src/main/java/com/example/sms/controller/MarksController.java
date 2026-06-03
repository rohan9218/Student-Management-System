package com.example.sms.controller;

import com.example.sms.dto.MarksDto;
import com.example.sms.entity.Marks;
import com.example.sms.service.MarksService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marks")
public class MarksController {

    @Autowired
    private MarksService marksService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Marks> addOrUpdateMarks(@Valid @RequestBody MarksDto marksDto, Principal principal) {
        return ResponseEntity.ok(marksService.addOrUpdateMarks(marksDto, principal.getName()));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Marks>> getStudentMarks(@PathVariable Long studentId) {
        return ResponseEntity.ok(marksService.getStudentMarks(studentId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Map<String, Boolean>> deleteMarks(@PathVariable Long id, Principal principal) {
        marksService.deleteMarks(id, principal.getName());
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return ResponseEntity.ok(response);
    }
}
