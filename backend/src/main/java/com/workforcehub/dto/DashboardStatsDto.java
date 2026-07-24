package com.workforcehub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalWorkforce;
    private long totalEmployees;
    private long activeProjects;
    private long totalProjects;
    private long pendingTasks;
    private long urgentTasks;
    private int taskCompletionRate;
    private long completedTasksCount;
    private long totalTasksCount;
    private List<ProjectDto> activeProjectsOverview;
    private List<ProjectDto> activeProjectsList;
    private List<Map<String, Object>> departmentBreakdown;

    // Employee-specific personalized fields
    private List<TaskDto> myAssignedTasks;
    private List<ProjectDto> myAssignedProjects;
    private long assignedTasksCount;
    private long pendingTasksCount;
    private List<TaskDto> upcomingDeadlines;
    private List<Map<String, Object>> notifications;
    private List<Map<String, Object>> recentActivities;
}
