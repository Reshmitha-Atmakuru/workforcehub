package com.workforcehub.service.impl;

import com.workforcehub.dto.TaskDto;
import com.workforcehub.exception.ResourceNotFoundException;
import com.workforcehub.model.*;
import com.workforcehub.repository.*;
import com.workforcehub.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.workforcehub.service.EmailService;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final EmailService emailService;

    @Override
    public List<TaskDto> getAllTasks(String search, Long projectId, Long assignedEmployeeId, String status, String priority) {
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Long projIdParam = (projectId != null && projectId > 0) ? projectId : null;
        Long empIdParam = (assignedEmployeeId != null && assignedEmployeeId > 0) ? assignedEmployeeId : null;
        String statusParam = (status != null && !status.equalsIgnoreCase("ALL")) ? status : null;
        String priorityParam = (priority != null && !priority.equalsIgnoreCase("ALL")) ? priority : null;

        return taskRepository.searchTasks(searchParam, projIdParam, empIdParam, statusParam, priorityParam)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskDto> getMyTasks(String username) {
        if (username == null || username.trim().isEmpty()) {
            return getAllTasks(null, null, null, null, null);
        }
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElse(null);

        if (user == null) {
            return getAllTasks(null, null, null, null, null);
        }

        Employee emp = employeeRepository.findByEmail(user.getEmail())
                .orElse(null);

        if (emp == null) {
            return getAllTasks(null, null, null, null, null);
        }

        return taskRepository.findByAssignedEmployeeId(emp.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskDto getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return mapToDto(task);
    }

    @Override
    @Transactional
    public TaskDto createTask(TaskDto dto, String currentUsername) {
        long count = taskRepository.count() + 1;
        String taskNumber = "TASK #" + count;

        Project project = null;
        if (dto.getProjectId() != null) {
            project = projectRepository.findById(dto.getProjectId()).orElse(null);
        }

        Employee assignedEmp = null;
        if (dto.getAssignedEmployeeId() != null) {
            assignedEmp = employeeRepository.findById(dto.getAssignedEmployeeId()).orElse(null);
        }

        Task task = Task.builder()
                .taskNumber(taskNumber)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .project(project)
                .assignedEmployee(assignedEmp)
                .priority(dto.getPriority() != null ? dto.getPriority() : "MEDIUM")
                .status("TODO")
                .progress(0)
                .dueDate(dto.getDueDate() != null ? dto.getDueDate() : LocalDate.now().plusDays(7))
                .remarks(dto.getRemarks() != null ? dto.getRemarks() : "Newly assigned task.")
                .build();

        Task saved = taskRepository.save(task);

        if (saved.getProject() != null) {
            updateProjectProgress(saved.getProject());
        }

        auditLogRepository.save(AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .action("CREATE")
                .entityType("TASK " + taskNumber)
                .entityId(String.valueOf(saved.getId()))
                .performedBy(currentUsername)
                .details("Assigned task \"" + saved.getTitle() + "\"")
                .build());

        if (saved.getAssignedEmployee() != null && saved.getAssignedEmployee().getEmail() != null) {
            emailService.sendTaskAssignmentEmail(
                    saved.getAssignedEmployee().getEmail(),
                    saved.getTitle(),
                    saved.getProject() != null ? saved.getProject().getName() : "General Project",
                    saved.getDueDate() != null ? saved.getDueDate().toString() : "TBD"
            );
        }

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public TaskDto updateTask(Long id, TaskDto dto, String currentUsername) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        // Track old project for progress recalculation when project changes
        Project oldProject = task.getProject();

        if (dto.getTitle() != null) task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getPriority() != null) task.setPriority(dto.getPriority());
        if (dto.getStatus() != null) {
            task.setStatus(dto.getStatus());
            if ("COMPLETED".equalsIgnoreCase(dto.getStatus()) || "DONE".equalsIgnoreCase(dto.getStatus())) {
                task.setProgress(100);
            } else if ("IN_PROGRESS".equalsIgnoreCase(dto.getStatus())) {
                task.setProgress(task.getProgress() != null && task.getProgress() > 0 ? task.getProgress() : 50);
            } else if ("TODO".equalsIgnoreCase(dto.getStatus())) {
                task.setProgress(0);
            }
        }
        if (dto.getProgress() != null) task.setProgress(dto.getProgress());
        if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());
        if (dto.getRemarks() != null) task.setRemarks(dto.getRemarks());

        // Handle project reassignment
        if (dto.getProjectId() != null) {
            Project newProject = projectRepository.findById(dto.getProjectId()).orElse(null);
            task.setProject(newProject);
        }

        // Handle employee reassignment
        if (dto.getAssignedEmployeeId() != null) {
            Employee newEmployee = employeeRepository.findById(dto.getAssignedEmployeeId()).orElse(null);
            task.setAssignedEmployee(newEmployee);
        }

        Task updated = taskRepository.save(task);

        // Recalculate progress for current project
        if (updated.getProject() != null) {
            updateProjectProgress(updated.getProject());
        }
        // Recalculate progress for old project if task was moved
        if (oldProject != null && (updated.getProject() == null || !oldProject.getId().equals(updated.getProject().getId()))) {
            updateProjectProgress(oldProject);
        }

        auditLogRepository.save(AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .action("UPDATE")
                .entityType("TASK " + updated.getTaskNumber())
                .entityId(String.valueOf(updated.getId()))
                .performedBy(currentUsername)
                .details("Updated task " + updated.getTitle() + " status to " + updated.getStatus())
                .build());

        // Send email notification on status change
        if (dto.getStatus() != null && updated.getAssignedEmployee() != null && updated.getAssignedEmployee().getEmail() != null) {
            emailService.sendStatusUpdateEmail(
                    updated.getAssignedEmployee().getEmail(),
                    updated.getTitle(),
                    updated.getStatus()
            );
        }

        return mapToDto(updated);
    }

    private void updateProjectProgress(Project project) {
        if (project == null || project.getId() == null) return;
        List<Task> projectTasks = taskRepository.findByProjectId(project.getId());
        long completedCount = projectTasks.stream()
                .filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()) || "DONE".equalsIgnoreCase(t.getStatus()))
                .count();
        int newProgress = projectTasks.isEmpty() ? 0 : (int) Math.round(((double) completedCount / projectTasks.size()) * 100);
        project.setProgress(newProgress);
        if (newProgress == 100) {
            project.setStatus("Completed");
        } else if (newProgress > 0 && !"Completed".equalsIgnoreCase(project.getStatus())) {
            project.setStatus("In Progress");
        }
        projectRepository.save(project);
    }

    @Override
    @Transactional
    public void deleteTask(Long id, String currentUsername) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        Project parentProject = task.getProject();

        taskRepository.delete(task);

        // Recalculate parent project progress after task removal
        if (parentProject != null) {
            updateProjectProgress(parentProject);
        }

        auditLogRepository.save(AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .action("DELETE")
                .entityType("TASK " + task.getTaskNumber())
                .entityId(String.valueOf(task.getId()))
                .performedBy(currentUsername)
                .details("Deleted task " + task.getTitle())
                .build());
    }

    private TaskDto mapToDto(Task t) {
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
