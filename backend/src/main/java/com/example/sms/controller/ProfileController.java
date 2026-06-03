package com.example.sms.controller;

import com.example.sms.dto.ChangePasswordRequest;
import com.example.sms.entity.User;
import com.example.sms.exception.BadRequestException;
import com.example.sms.repository.UserRepository;
import com.example.sms.service.ActivityLogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ActivityLogService logService;

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Principal principal) {
        
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        logService.log("Changed password", user.getUsername());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/details")
    public ResponseEntity<User> updateDetails(
            @RequestParam String email,
            Principal principal) {
            
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        
        // Ensure email isn't taken
        if (!user.getEmail().equalsIgnoreCase(email) && userRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("Email " + email + " is already in use.");
        }

        user.setEmail(email);
        User updated = userRepository.save(user);

        logService.log("Updated profile details (email: " + email + ")", user.getUsername());
        return ResponseEntity.ok(updated);
    }
}
