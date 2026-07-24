package com.workforcehub.service;

public interface EmailService {
    void sendWelcomeEmail(String toEmail, String fullName, String role);
    void sendTaskAssignmentEmail(String toEmail, String taskTitle, String projectTitle, String dueDate);
    void sendStatusUpdateEmail(String toEmail, String entityName, String newStatus);
    void sendLeaveStatusEmail(String toEmail, String employeeName, String leaveType, String status, String comments);
    void sendProjectAssignmentEmail(String toEmail, String employeeName, String projectName);
    void sendGenericNotification(String toEmail, String subject, String body);
}
