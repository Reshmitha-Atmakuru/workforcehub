package com.workforcehub.service.impl;

import com.workforcehub.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    private static final String FROM_EMAIL = "atmakurureshmitha44@gmail.com";
    private static final String COMPANY_NAME = "WorkforceHub Enterprise";

    @Async
    @Override
    public void sendWelcomeEmail(String toEmail, String fullName, String role) {
        String subject = "🎉 Welcome to " + COMPANY_NAME + "!";
        String htmlBody = buildHtmlEmail(
                "Welcome Aboard, " + fullName + "!",
                "🎉",
                "<p>We're thrilled to have you join <strong>" + COMPANY_NAME + "</strong>!</p>"
                + "<p>Your account has been successfully created with the following details:</p>"
                + "<table style='width:100%;border-collapse:collapse;margin:16px 0;'>"
                + "<tr><td style='padding:10px 16px;background:#f8f9fa;border:1px solid #e9ecef;font-weight:600;width:140px;'>Full Name</td>"
                + "<td style='padding:10px 16px;border:1px solid #e9ecef;'>" + fullName + "</td></tr>"
                + "<tr><td style='padding:10px 16px;background:#f8f9fa;border:1px solid #e9ecef;font-weight:600;'>Role</td>"
                + "<td style='padding:10px 16px;border:1px solid #e9ecef;'>" + formatRole(role) + "</td></tr>"
                + "<tr><td style='padding:10px 16px;background:#f8f9fa;border:1px solid #e9ecef;font-weight:600;'>Email</td>"
                + "<td style='padding:10px 16px;border:1px solid #e9ecef;'>" + toEmail + "</td></tr>"
                + "</table>"
                + "<p>You can now log in to access your dashboard, manage tasks, and collaborate with your team.</p>",
                "#6366f1"
        );
        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    @Async
    @Override
    public void sendTaskAssignmentEmail(String toEmail, String taskTitle, String projectTitle, String dueDate) {
        String subject = "📋 New Task Assigned: " + taskTitle;
        String htmlBody = buildHtmlEmail(
                "New Task Assigned to You",
                "📋",
                "<p>You have been assigned a new task. Here are the details:</p>"
                + "<table style='width:100%;border-collapse:collapse;margin:16px 0;'>"
                + "<tr><td style='padding:10px 16px;background:#f8f9fa;border:1px solid #e9ecef;font-weight:600;width:140px;'>Task</td>"
                + "<td style='padding:10px 16px;border:1px solid #e9ecef;'>" + taskTitle + "</td></tr>"
                + "<tr><td style='padding:10px 16px;background:#f8f9fa;border:1px solid #e9ecef;font-weight:600;'>Project</td>"
                + "<td style='padding:10px 16px;border:1px solid #e9ecef;'>" + projectTitle + "</td></tr>"
                + "<tr><td style='padding:10px 16px;background:#f8f9fa;border:1px solid #e9ecef;font-weight:600;'>Due Date</td>"
                + "<td style='padding:10px 16px;border:1px solid #e9ecef;'>" + dueDate + "</td></tr>"
                + "</table>"
                + "<p>Please review the task details and start working on it at your earliest convenience.</p>",
                "#f59e0b"
        );
        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    @Async
    @Override
    public void sendStatusUpdateEmail(String toEmail, String entityName, String newStatus) {
        String subject = "🔄 Status Update: " + entityName;
        String statusColor = getStatusColor(newStatus);
        String htmlBody = buildHtmlEmail(
                "Status Update Notification",
                "🔄",
                "<p>The status of <strong>" + entityName + "</strong> has been updated:</p>"
                + "<div style='text-align:center;margin:24px 0;'>"
                + "<span style='display:inline-block;padding:10px 28px;background:" + statusColor + ";color:#fff;border-radius:24px;font-size:16px;font-weight:700;letter-spacing:0.5px;'>"
                + newStatus.toUpperCase()
                + "</span>"
                + "</div>"
                + "<p>Please check the platform for more details and take necessary action if required.</p>",
                "#10b981"
        );
        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    @Async
    @Override
    public void sendLeaveStatusEmail(String toEmail, String employeeName, String leaveType, String status, String comments) {
        String emoji = "APPROVED".equalsIgnoreCase(status) ? "✅" : "❌";
        String subject = emoji + " Leave Request " + status;
        String statusColor = "APPROVED".equalsIgnoreCase(status) ? "#10b981" : "#ef4444";
        String htmlBody = buildHtmlEmail(
                "Leave Request " + status,
                emoji,
                "<p>Dear <strong>" + employeeName + "</strong>,</p>"
                + "<p>Your leave request has been processed. Here are the details:</p>"
                + "<table style='width:100%;border-collapse:collapse;margin:16px 0;'>"
                + "<tr><td style='padding:10px 16px;background:#f8f9fa;border:1px solid #e9ecef;font-weight:600;width:140px;'>Leave Type</td>"
                + "<td style='padding:10px 16px;border:1px solid #e9ecef;'>" + leaveType + "</td></tr>"
                + "<tr><td style='padding:10px 16px;background:#f8f9fa;border:1px solid #e9ecef;font-weight:600;'>Status</td>"
                + "<td style='padding:10px 16px;border:1px solid #e9ecef;'>"
                + "<span style='display:inline-block;padding:4px 16px;background:" + statusColor + ";color:#fff;border-radius:12px;font-weight:600;'>"
                + status.toUpperCase() + "</span></td></tr>"
                + (comments != null && !comments.isEmpty()
                    ? "<tr><td style='padding:10px 16px;background:#f8f9fa;border:1px solid #e9ecef;font-weight:600;'>Admin Comments</td>"
                    + "<td style='padding:10px 16px;border:1px solid #e9ecef;font-style:italic;'>" + comments + "</td></tr>"
                    : "")
                + "</table>",
                statusColor
        );
        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    @Async
    @Override
    public void sendProjectAssignmentEmail(String toEmail, String employeeName, String projectName) {
        String subject = "📊 Project Assignment: " + projectName;
        String htmlBody = buildHtmlEmail(
                "You've Been Assigned to a Project",
                "📊",
                "<p>Dear <strong>" + employeeName + "</strong>,</p>"
                + "<p>You have been assigned to the project:</p>"
                + "<div style='text-align:center;margin:24px 0;'>"
                + "<div style='display:inline-block;padding:16px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:12px;font-size:18px;font-weight:700;'>"
                + projectName
                + "</div>"
                + "</div>"
                + "<p>Please check the project details on your dashboard and coordinate with your team.</p>",
                "#8b5cf6"
        );
        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    @Async
    @Override
    public void sendGenericNotification(String toEmail, String subject, String body) {
        String htmlBody = buildHtmlEmail(
                subject,
                "📬",
                "<div style='line-height:1.8;font-size:15px;'>" + body.replace("\n", "<br>") + "</div>",
                "#6366f1"
        );
        sendHtmlEmail(toEmail, "📬 " + subject, htmlBody);
    }

    // ─── Internal Helpers ───────────────────────────────────────────

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM_EMAIL);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("✅ Email sent successfully to: {} | Subject: {}", to, subject);
        } catch (MessagingException e) {
            log.error("❌ Failed to send email to: {} | Subject: {} | Error: {}", to, subject, e.getMessage(), e);
        }
    }

    private String buildHtmlEmail(String title, String emoji, String content, String accentColor) {
        return "<!DOCTYPE html>"
                + "<html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1.0'></head>"
                + "<body style='margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;'>"
                + "<div style='max-width:600px;margin:0 auto;padding:32px 16px;'>"
                // Header
                + "<div style='background:linear-gradient(135deg," + accentColor + "," + adjustColor(accentColor) + ");border-radius:16px 16px 0 0;padding:32px;text-align:center;'>"
                + "<div style='font-size:48px;margin-bottom:12px;'>" + emoji + "</div>"
                + "<h1 style='margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;'>" + title + "</h1>"
                + "</div>"
                // Body
                + "<div style='background:#fff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>"
                + "<div style='color:#374151;font-size:15px;line-height:1.7;'>" + content + "</div>"
                + "<hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0;'>"
                + "<p style='color:#9ca3af;font-size:12px;text-align:center;margin:0;'>This is an automated notification from <strong>" + COMPANY_NAME + "</strong>.<br>Please do not reply to this email.</p>"
                + "</div>"
                // Footer
                + "<div style='text-align:center;padding:16px;color:#9ca3af;font-size:11px;'>"
                + "© 2026 " + COMPANY_NAME + " • Smart Employee Management System"
                + "</div>"
                + "</div>"
                + "</body></html>";
    }

    private String adjustColor(String hex) {
        // Shift hue slightly for gradient effect
        try {
            int r = Integer.parseInt(hex.substring(1, 3), 16);
            int g = Integer.parseInt(hex.substring(3, 5), 16);
            int b = Integer.parseInt(hex.substring(5, 7), 16);
            r = Math.min(255, r + 40);
            g = Math.min(255, g + 20);
            b = Math.min(255, b + 60);
            return String.format("#%02x%02x%02x", r, g, b);
        } catch (Exception e) {
            return hex;
        }
    }

    private String getStatusColor(String status) {
        if (status == null) return "#6b7280";
        return switch (status.toUpperCase()) {
            case "COMPLETED", "DONE", "APPROVED" -> "#10b981";
            case "IN_PROGRESS", "IN PROGRESS" -> "#f59e0b";
            case "TODO", "PENDING" -> "#6366f1";
            case "REJECTED", "CANCELLED" -> "#ef4444";
            case "ON_HOLD" -> "#8b5cf6";
            default -> "#6b7280";
        };
    }

    private String formatRole(String role) {
        if (role == null) return "Employee";
        return switch (role) {
            case "ROLE_ADMIN" -> "Administrator";
            case "ROLE_MANAGER" -> "Manager";
            case "ROLE_EMPLOYEE" -> "Employee";
            default -> role.replace("ROLE_", "");
        };
    }
}
