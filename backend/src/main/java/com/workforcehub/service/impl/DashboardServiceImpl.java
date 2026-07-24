package com.workforcehub.service.impl;

import com.workforcehub.dto.DashboardStatsDto;
import com.workforcehub.dto.ProjectDto;
import com.workforcehub.model.Employee;
import com.workforcehub.model.Project;
import com.workforcehub.model.Task;
import com.workforcehub.repository.EmployeeRepository;
import com.workforcehub.repository.ProjectRepository;
import com.workforcehub.repository.TaskRepository;
import com.workforcehub.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

import com.workforcehub.dto.TaskDto;
import com.workforcehub.model.AuditLog;
import com.workforcehub.model.User;
import com.workforcehub.repository.AuditLogRepository;
import com.workforcehub.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    public DashboardStatsDto getDashboardStats() {
        return getDashboardStats(null);
    }

    @Override
    public DashboardStatsDto getDashboardStats(String username) {
        List<Employee> employees = employeeRepository.findAll();
        List<Project> projects = projectRepository.findAll();
        List<Task> tasks = taskRepository.findAll();

        long totalWorkforce = employees.size();
        long totalProjects = projects.size();
        long activeProjects = projects.stream().filter(p -> "In Progress".equalsIgnoreCase(p.getStatus())).count();
        long pendingTasks = tasks.stream().filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus()) && !"DONE".equalsIgnoreCase(t.getStatus())).count();
        long urgentTasks = tasks.stream().filter(t -> "URGENT".equalsIgnoreCase(t.getPriority()) && !"COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        long completedTasks = tasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()) || "DONE".equalsIgnoreCase(t.getStatus())).count();
        int taskCompletionRate = tasks.isEmpty() ? 0 : (int) Math.round(((double) completedTasks / tasks.size()) * 100);

        // Department breakdown
        Map<String, Long> deptCounts = employees.stream()
                .filter(e -> e.getDepartment() != null)
                .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));

        List<Map<String, Object>> departmentBreakdown = new ArrayList<>();
        deptCounts.forEach((dept, count) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", "dept-" + dept);
            map.put("department", dept);
            map.put("name", dept);
            map.put("count", count);
            map.put("staffCount", count);
            map.put("percentage", Math.round(((double) count / (totalWorkforce == 0 ? 1 : totalWorkforce)) * 100));
            departmentBreakdown.add(map);
        });

        // Active Projects Overview
        List<ProjectDto> activeProjectsOverview = projects.stream()
                .map(p -> mapProjectToDto(p, tasks))
                .collect(Collectors.toList());

        // Employee personalized fields
        List<TaskDto> myAssignedTasks = new ArrayList<>();
        List<ProjectDto> myAssignedProjects = new ArrayList<>();
        long assignedTasksCount = 0;
        long myCompletedTasksCount = 0;
        long myPendingTasksCount = 0;
        List<TaskDto> upcomingDeadlines = new ArrayList<>();
        List<Map<String, Object>> notifications = new ArrayList<>();
        List<Map<String, Object>> recentActivities = new ArrayList<>();

        if (username != null && !username.trim().isEmpty() && userRepository != null) {
            User user = userRepository.findByUsername(username)
                    .or(() -> userRepository.findByEmail(username))
                    .orElse(null);

            if (user != null) {
                Employee emp = employeeRepository.findByEmail(user.getEmail()).orElse(null);
                if (emp != null) {
                    List<Task> empTasks = taskRepository.findByAssignedEmployeeId(emp.getId());
                    myAssignedTasks = empTasks.stream().map(this::mapTaskToDto).collect(Collectors.toList());
                    assignedTasksCount = empTasks.size();
                    myCompletedTasksCount = empTasks.stream()
                            .filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()) || "DONE".equalsIgnoreCase(t.getStatus()))
                            .count();
                    myPendingTasksCount = assignedTasksCount - myCompletedTasksCount;

                    upcomingDeadlines = empTasks.stream()
                            .filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus()) && !"DONE".equalsIgnoreCase(t.getStatus()))
                            .sorted(Comparator.comparing(Task::getDueDate, Comparator.nullsLast(Comparator.naturalOrder())))
                            .map(this::mapTaskToDto)
                            .collect(Collectors.toList());

                    List<Project> empProjects = empTasks.stream()
                            .map(Task::getProject)
                            .filter(Objects::nonNull)
                            .distinct()
                            .collect(Collectors.toList());

                    if (empProjects.isEmpty() && emp.getDepartment() != null) {
                        empProjects = projectRepository.searchProjects(null, emp.getDepartment(), null);
                    }

                    myAssignedProjects = empProjects.stream().map(p -> mapProjectToDto(p, tasks)).collect(Collectors.toList());

                    for (Task t : empTasks) {
                        Map<String, Object> notif = new HashMap<>();
                        notif.put("id", "notif-task-" + t.getId());
                        notif.put("message", "Task assigned: \"" + t.getTitle() + "\" (" + t.getStatus() + ")");
                        notif.put("timestamp", t.getDueDate() != null ? "Due: " + t.getDueDate() : "Active");
                        notifications.add(notif);
                    }
                }
            }
        }

        // Audit Logs for Recent Activities
        if (auditLogRepository != null) {
            List<AuditLog> auditLogs = auditLogRepository.findAll();
            recentActivities = auditLogs.stream()
                    .sorted(Comparator.comparing(AuditLog::getTimestamp, Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(6)
                    .map(a -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", a.getId());
                        map.put("action", a.getAction());
                        map.put("entityType", a.getEntityType());
                        map.put("performedBy", a.getPerformedBy());
                        map.put("details", a.getDetails());
                        map.put("timestamp", a.getTimestamp() != null ? a.getTimestamp().toString() : "");
                        return map;
                    })
                    .collect(Collectors.toList());
        }

        return DashboardStatsDto.builder()
                .totalWorkforce(totalWorkforce)
                .totalEmployees(totalWorkforce)
                .activeProjects(activeProjects)
                .totalProjects(totalProjects)
                .pendingTasks(pendingTasks)
                .urgentTasks(urgentTasks)
                .taskCompletionRate(taskCompletionRate)
                .completedTasksCount(completedTasks)
                .totalTasksCount(tasks.size())
                .activeProjectsOverview(activeProjectsOverview)
                .activeProjectsList(activeProjectsOverview)
                .departmentBreakdown(departmentBreakdown)
                .myAssignedTasks(myAssignedTasks)
                .myAssignedProjects(myAssignedProjects)
                .assignedTasksCount(assignedTasksCount)
                .pendingTasksCount(myPendingTasksCount)
                .upcomingDeadlines(upcomingDeadlines)
                .notifications(notifications)
                .recentActivities(recentActivities)
                .build();
    }

    private ProjectDto mapProjectToDto(Project p, List<Task> allTasks) {
        List<Task> pTasks = allTasks.stream()
                .filter(t -> t.getProject() != null && Objects.equals(t.getProject().getId(), p.getId()))
                .collect(Collectors.toList());
        int totalTasks = pTasks.size();
        int completedTasks = (int) pTasks.stream()
                .filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()) || "DONE".equalsIgnoreCase(t.getStatus()))
                .count();
        int pendingTasks = totalTasks - completedTasks;
        int calcProgress = totalTasks == 0 ? (p.getProgress() != null ? p.getProgress() : 0)
                : (int) Math.round(((double) completedTasks / totalTasks) * 100);

        return ProjectDto.builder()
                .id(p.getId())
                .code(p.getCode())
                .name(p.getName())
                .description(p.getDescription())
                .department(p.getDepartment())
                .priority(p.getPriority())
                .status(p.getStatus())
                .progress(calcProgress)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .budget(p.getBudget())
                .startDate(p.getStartDate())
                .deadline(p.getDeadline())
                .build();
    }

    private TaskDto mapTaskToDto(Task t) {
        return TaskDto.builder()
                .id(t.getId())
                .taskNumber(t.getTaskNumber())
                .title(t.getTitle())
                .description(t.getDescription())
                .projectId(t.getProject() != null ? t.getProject().getId() : null)
                .projectName(t.getProject() != null ? t.getProject().getName() : null)
                .assignedEmployeeId(t.getAssignedEmployee() != null ? t.getAssignedEmployee().getId() : null)
                .assignedEmployeeName(t.getAssignedEmployee() != null ? t.getAssignedEmployee().getFirstName() + " " + t.getAssignedEmployee().getLastName() : null)
                .priority(t.getPriority())
                .status(t.getStatus())
                .progress(t.getProgress())
                .dueDate(t.getDueDate())
                .remarks(t.getRemarks())
                .build();
    }
}
