package com.workforcehub.controller;

import com.workforcehub.dto.EmailDto;
import com.workforcehub.model.Employee;
import com.workforcehub.repository.EmployeeRepository;
import com.workforcehub.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping({"/api/email", "/email"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmailController {

    private final EmailService emailService;
    private final EmployeeRepository employeeRepository;

    /**
     * Send a custom email to a specific recipient
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendEmail(@RequestBody EmailDto dto) {
        log.info("📧 Sending custom email to: {} | Subject: {}", dto.getTo(), dto.getSubject());
        emailService.sendGenericNotification(dto.getTo(), dto.getSubject(), dto.getBody());

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Email sent successfully to " + dto.getTo());
        return ResponseEntity.ok(response);
    }

    /**
     * Broadcast email to all active employees
     */
    @PostMapping("/broadcast")
    public ResponseEntity<Map<String, Object>> broadcastEmail(@RequestBody EmailDto dto) {
        List<Employee> employees = employeeRepository.findAll();
        int sentCount = 0;

        for (Employee emp : employees) {
            if (emp.getEmail() != null && !emp.getEmail().isEmpty()) {
                emailService.sendGenericNotification(emp.getEmail(), dto.getSubject(), dto.getBody());
                sentCount++;
            }
        }

        log.info("📧 Broadcast email sent to {} employees | Subject: {}", sentCount, dto.getSubject());

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Broadcast email sent to " + sentCount + " employees");
        response.put("recipientCount", sentCount);
        return ResponseEntity.ok(response);
    }

    /**
     * Test email configuration by sending a test email
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testEmail(@RequestParam String to) {
        log.info("📧 Sending test email to: {}", to);
        emailService.sendGenericNotification(
                to,
                "Test Email — WorkforceHub",
                "This is a test email from WorkforceHub Enterprise.\n\n"
                + "If you received this, your email notification system is configured correctly! 🎉\n\n"
                + "All automated notifications (task assignments, leave approvals, status updates) will be sent from this address."
        );

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Test email dispatched to " + to);
        return ResponseEntity.ok(response);
    }
}
