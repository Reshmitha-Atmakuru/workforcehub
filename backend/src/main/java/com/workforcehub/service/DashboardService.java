package com.workforcehub.service;

import com.workforcehub.dto.DashboardStatsDto;

public interface DashboardService {
    DashboardStatsDto getDashboardStats();
    DashboardStatsDto getDashboardStats(String username);
}
