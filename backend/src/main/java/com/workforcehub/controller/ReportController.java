package com.workforcehub.controller;

import com.workforcehub.model.Employee;
import com.workforcehub.model.Project;
import com.workforcehub.model.Task;
import com.workforcehub.repository.EmployeeRepository;
import com.workforcehub.repository.ProjectRepository;
import com.workforcehub.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {


    private final EmployeeRepository employeeRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    @GetMapping("/employee-productivity")
    public ResponseEntity<List<Map<String, Object>>> getEmployeeProductivityReport() {
        List<Employee> employees = employeeRepository.findAll();
        List<Task> tasks = taskRepository.findAll();

        List<Map<String, Object>> report = new ArrayList<>();

        for (Employee emp : employees) {
            List<Task> empTasks = tasks.stream()
                    .filter(t -> t.getAssignedEmployee() != null && Objects.equals(t.getAssignedEmployee().getId(), emp.getId()))
                    .toList();

            long completed = empTasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()) || "DONE".equalsIgnoreCase(t.getStatus())).count();
            long pending = empTasks.size() - completed;
            int rate = empTasks.isEmpty() ? 0 : (int) Math.round(((double) completed / empTasks.size()) * 100);

            Map<String, Object> map = new HashMap<>();
            map.put("employeeCode", emp.getCode());
            map.put("employeeName", emp.getFirstName() + " " + emp.getLastName());
            map.put("department", emp.getDepartment());
            map.put("totalAssigned", empTasks.size());
            map.put("completed", completed);
            map.put("pending", pending);
            map.put("completionRate", rate + "%");

            report.add(map);
        }

        return ResponseEntity.ok(report);
    }

    @GetMapping("/project-health")
    public ResponseEntity<List<Map<String, Object>>> getProjectHealthReport() {
        List<Project> projects = projectRepository.findAll();
        List<Task> tasks = taskRepository.findAll();

        List<Map<String, Object>> report = new ArrayList<>();

        for (Project prj : projects) {
            List<Task> prjTasks = tasks.stream()
                    .filter(t -> t.getProject() != null && Objects.equals(t.getProject().getId(), prj.getId()))
                    .toList();

            long completed = prjTasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()) || "DONE".equalsIgnoreCase(t.getStatus())).count();
            int progress = prjTasks.isEmpty() ? (prj.getProgress() != null ? prj.getProgress() : 0)
                    : (int) Math.round(((double) completed / prjTasks.size()) * 100);

            Map<String, Object> map = new HashMap<>();
            map.put("projectCode", prj.getCode());
            map.put("projectName", prj.getName());
            map.put("department", prj.getDepartment());
            map.put("status", prj.getStatus());
            map.put("budget", prj.getBudget());
            map.put("deadline", prj.getDeadline() != null ? prj.getDeadline().toString() : "2026-12-31");
            map.put("progress", progress);

            report.add(map);
        }

        return ResponseEntity.ok(report);
    }

    @GetMapping("/task-status")
    public ResponseEntity<List<Map<String, Object>>> getTaskStatusReport() {
        List<Task> tasks = taskRepository.findAll();
        List<Map<String, Object>> report = new ArrayList<>();

        for (Task task : tasks) {
            Map<String, Object> map = new HashMap<>();
            map.put("taskId", task.getId());
            map.put("taskTitle", task.getTitle());
            map.put("projectName", task.getProject() != null ? task.getProject().getName() : "Unassigned");
            map.put("assignedTo", task.getAssignedEmployee() != null
                    ? task.getAssignedEmployee().getFirstName() + " " + task.getAssignedEmployee().getLastName()
                    : "Unassigned");
            map.put("priority", task.getPriority());
            map.put("status", task.getStatus());
            map.put("dueDate", task.getDueDate() != null ? task.getDueDate().toString() : "2026-12-31");

            report.add(map);
        }

        return ResponseEntity.ok(report);
    }
}

