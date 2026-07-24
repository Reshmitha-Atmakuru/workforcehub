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
@RequestMapping({"/api/dashboard", "/dashboard"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Executive Dashboard", description = "Realtime Workforce Analytics, Department Aggregations & Project Overviews")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get Dashboard Metrics", description = "Returns system KPIs including workforce count, active project counts, task completion rates, and department distribution")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }
}
