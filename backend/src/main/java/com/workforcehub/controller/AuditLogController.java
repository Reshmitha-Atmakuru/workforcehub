package com.workforcehub.controller;

import com.workforcehub.model.AuditLog;
import com.workforcehub.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Security Audit Logs", description = "System Audit Records, Access Trails & Mutation History Tracking")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @Operation(summary = "Get System Audit Logs", description = "Fetches immutable audit log records with keyword search filtering for actions like LOGIN, CREATE, UPDATE, DELETE")
    public ResponseEntity<List<AuditLog>> getAuditLogs(@RequestParam(required = false) String search) {
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return ResponseEntity.ok(auditLogRepository.searchAuditLogs(searchParam));
    }
}
