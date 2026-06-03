package com.example.sms.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String text) {
        System.out.println("DEBUG [EmailService]: Attempting to send email to " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Body: " + text);

        if (mailSender == null) {
            System.err.println("WARN [EmailService]: JavaMailSender is not initialized or bean missing. Email skipped.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("sms-noreply@example.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            System.out.println("SUCCESS [EmailService]: Email sent successfully to " + to);
        } catch (Exception ex) {
            System.err.println("ERROR [EmailService]: Failed to send email to " + to + " due to SMTP configuration. Error: " + ex.getMessage());
        }
    }
}
