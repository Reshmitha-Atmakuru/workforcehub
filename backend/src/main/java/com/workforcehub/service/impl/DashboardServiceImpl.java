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

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @Override
    public DashboardStatsDto getDashboardStats() {
        List<Employee> employees = employeeRepository.findAll();
        List<Project> projects = projectRepository.findAll();
        List<Task> tasks = taskRepository.findAll();

        long totalWorkforce = employees.size();
        long totalProjects = projects.size();
        long activeProjects = projects.stream().filter(p -> "In Progress".equalsIgnoreCase(p.getStatus())).count();
        long pendingTasks = tasks.stream().filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        long urgentTasks = tasks.stream().filter(t -> "URGENT".equalsIgnoreCase(t.getPriority()) && !"COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        long completedTasks = tasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
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

        // Active Projects
        List<ProjectDto> activeProjectsOverview = projects.stream()
                .map(p -> {
                    List<Task> pTasks = tasks.stream().filter(t -> t.getProject() != null && Objects.equals(t.getProject().getId(), p.getId())).toList();
                    int totalPrjTasks = pTasks.size();
                    int completedPrjTasks = (int) pTasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()) || "DONE".equalsIgnoreCase(t.getStatus())).count();
                    int pendingPrjTasks = totalPrjTasks - completedPrjTasks;
                    int calcProgress = totalPrjTasks == 0 ? (p.getProgress() != null ? p.getProgress() : 0)
                            : (int) Math.round(((double) completedPrjTasks / totalPrjTasks) * 100);

                    return ProjectDto.builder()
                            .id(p.getId())
                            .code(p.getCode())
                            .name(p.getName())
                            .description(p.getDescription())
                            .department(p.getDepartment())
                            .priority(p.getPriority())
                            .status(p.getStatus())
                            .progress(calcProgress)
                            .totalTasks(totalPrjTasks)
                            .completedTasks(completedPrjTasks)
                            .pendingTasks(pendingPrjTasks)
                            .budget(p.getBudget())
                            .deadline(p.getDeadline())
                            .build();
                })
                .collect(Collectors.toList());

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
                .build();
    }
}
