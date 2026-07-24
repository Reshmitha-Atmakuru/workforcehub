package com.workforcehub.controller;

import com.workforcehub.dto.DashboardStatsDto;
import com.workforcehub.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Executive Dashboard", description = "Realtime Workforce Analytics, Department Aggregations & Project Overviews")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get Dashboard Metrics", description = "Returns system KPIs including workforce count, active project counts, task completion rates, and personalized employee assigned items")
    public ResponseEntity<DashboardStatsDto> getDashboardStats(org.springframework.security.core.Authentication authentication) {
        String username = (authentication != null && authentication.getName() != null) ? authentication.getName() : null;
        return ResponseEntity.ok(dashboardService.getDashboardStats(username));
    }
}
