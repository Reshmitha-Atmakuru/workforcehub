package com.workforcehub.service.impl;

import com.workforcehub.dto.ProjectDto;
import com.workforcehub.exception.ResourceNotFoundException;
import com.workforcehub.model.AuditLog;
import com.workforcehub.model.Project;
import com.workforcehub.model.Task;
import com.workforcehub.repository.AuditLogRepository;
import com.workforcehub.repository.ProjectRepository;
import com.workforcehub.repository.TaskRepository;
import com.workforcehub.service.EmailService;
import com.workforcehub.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.workforcehub.dto.TaskDto;
import com.workforcehub.repository.EmployeeRepository;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogRepository auditLogRepository;
    private final EmailService emailService;

    @Override
    public List<ProjectDto> getAllProjects(String search, String department, String status) {
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String deptParam = (department != null && !department.trim().isEmpty() && !"ALL".equalsIgnoreCase(department.trim())) ? department.trim() : null;
        String statusParam = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) ? status.trim() : null;

        return projectRepository.searchProjects(searchParam, deptParam, statusParam)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectDto getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return mapToDto(project);
    }

    @Override
    @Transactional
    public ProjectDto createProject(ProjectDto dto, String currentUsername) {
        long count = projectRepository.count() + 1;
        String code = "PRJ-2026-0" + count;

        Project project = Project.builder()
                .code(code)
                .name(dto.getName())
                .description(dto.getDescription())
                .department(dto.getDepartment())
                .priority(dto.getPriority() != null ? dto.getPriority() : "MEDIUM")
                .status(dto.getStatus() != null ? dto.getStatus() : "Not Started")
                .progress(0)
                .budget(dto.getBudget())
                .startDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDate.now())
                .deadline(dto.getDeadline())
                .build();

        Project saved = projectRepository.save(project);

        if (dto.getInitialTasks() != null && !dto.getInitialTasks().isEmpty()) {
            long taskCount = taskRepository.count();
            for (int i = 0; i < dto.getInitialTasks().size(); i++) {
                TaskDto tDto = dto.getInitialTasks().get(i);
                if (tDto.getTitle() != null && !tDto.getTitle().trim().isEmpty()) {
                    String taskNum = "TSK-" + (1001 + taskCount + i);
                    com.workforcehub.model.Employee emp = null;
                    if (tDto.getAssignedEmployeeId() != null) {
                        emp = employeeRepository.findById(tDto.getAssignedEmployeeId()).orElse(null);
                    }
                    Task task = Task.builder()
                            .taskNumber(taskNum)
                            .title(tDto.getTitle().trim())
                            .description(tDto.getDescription() != null ? tDto.getDescription() : "Task deliverable for project: " + saved.getName())
                            .project(saved)
                            .assignedEmployee(emp)
                            .priority(tDto.getPriority() != null ? tDto.getPriority() : "MEDIUM")
                            .status(tDto.getStatus() != null ? tDto.getStatus() : "TODO")
                            .progress(0)
                            .dueDate(saved.getDeadline() != null ? saved.getDeadline() : LocalDate.now().plusMonths(1))
                            .remarks("Initial project deliverable")
                            .build();
                    taskRepository.save(task);
                }
            }
        }

        auditLogRepository.save(AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .action("CREATE")
                .entityType("PROJECT " + code)
                .entityId(String.valueOf(saved.getId()))
                .performedBy(currentUsername)
                .details("Created enterprise project: " + saved.getName())
                .build());

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public ProjectDto updateProject(Long id, ProjectDto dto, String currentUsername) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        if (dto.getName() != null) project.setName(dto.getName());
        if (dto.getDescription() != null) project.setDescription(dto.getDescription());
        if (dto.getDepartment() != null) project.setDepartment(dto.getDepartment());
        if (dto.getPriority() != null) project.setPriority(dto.getPriority());
        // Status can be set manually but progress-derived status takes precedence
        if (dto.getStatus() != null) project.setStatus(dto.getStatus());
        // Progress is NOT set manually — it is always derived from task completion
        if (dto.getBudget() != null) project.setBudget(dto.getBudget());
        if (dto.getDeadline() != null) project.setDeadline(dto.getDeadline());
        if (dto.getStartDate() != null) project.setStartDate(dto.getStartDate());

        String oldStatus = project.getStatus();
        Project updated = projectRepository.save(project);

        auditLogRepository.save(AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .action("UPDATE")
                .entityType("PROJECT " + updated.getCode())
                .entityId(String.valueOf(updated.getId()))
                .performedBy(currentUsername)
                .details("Updated project details for " + updated.getName())
                .build());

        // Send email notification if project status changed
        if (dto.getStatus() != null && !dto.getStatus().equals(oldStatus)) {
            List<Task> tasks = taskRepository.findByProjectId(updated.getId());
            tasks.stream()
                    .filter(t -> t.getAssignedEmployee() != null && t.getAssignedEmployee().getEmail() != null)
                    .map(t -> t.getAssignedEmployee().getEmail())
                    .distinct()
                    .forEach(email -> emailService.sendStatusUpdateEmail(email, updated.getName(), updated.getStatus()));
        }

        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteProject(Long id, String currentUsername) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        projectRepository.delete(project);

        auditLogRepository.save(AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .action("DELETE")
                .entityType("PROJECT " + project.getCode())
                .entityId(String.valueOf(project.getId()))
                .performedBy(currentUsername)
                .details("Deleted project " + project.getName())
                .build());
    }

    private ProjectDto mapToDto(Project p) {
        List<Task> tasks = taskRepository.findByProjectId(p.getId());
        int totalTasks = tasks.size();
        int completedTasks = (int) tasks.stream()
                .filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()) || "DONE".equalsIgnoreCase(t.getStatus()))
                .count();
        int pendingTasks = totalTasks - completedTasks;
        int calculatedProgress = totalTasks == 0 ? (p.getProgress() != null ? p.getProgress() : 0)
                : (int) Math.round(((double) completedTasks / totalTasks) * 100);

        if (p.getProgress() == null || !p.getProgress().equals(calculatedProgress)) {
            p.setProgress(calculatedProgress);
            if (calculatedProgress == 100) {
                p.setStatus("Completed");
            } else if (calculatedProgress > 0 && "Not Started".equalsIgnoreCase(p.getStatus())) {
                p.setStatus("In Progress");
            }
            projectRepository.save(p);
        }

        return ProjectDto.builder()
                .id(p.getId())
                .code(p.getCode())
                .name(p.getName())
                .description(p.getDescription())
                .department(p.getDepartment())
                .priority(p.getPriority())
                .status(p.getStatus())
                .progress(calculatedProgress)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .budget(p.getBudget())
                .startDate(p.getStartDate())
                .deadline(p.getDeadline())
                .build();
    }
}

