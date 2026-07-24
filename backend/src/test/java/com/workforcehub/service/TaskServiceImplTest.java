package com.workforcehub.service;

import com.workforcehub.dto.TaskDto;
import com.workforcehub.exception.ResourceNotFoundException;
import com.workforcehub.model.Project;
import com.workforcehub.model.Task;
import com.workforcehub.repository.AuditLogRepository;
import com.workforcehub.repository.EmployeeRepository;
import com.workforcehub.repository.ProjectRepository;
import com.workforcehub.repository.TaskRepository;
import com.workforcehub.service.impl.TaskServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TaskServiceImplTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private TaskServiceImpl taskService;

    private Project project;
    private Task task;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(1L)
                .code("PRJ-101")
                .name("Test Project")
                .progress(0)
                .status("In Progress")
                .build();

        task = Task.builder()
                .id(10L)
                .taskNumber("TASK #1")
                .title("Implement Authentication")
                .status("TODO")
                .progress(0)
                .project(project)
                .dueDate(LocalDate.now().plusDays(5))
                .build();
    }

    @Test
    void createTask_UpdatesParentProjectProgress() {
        TaskDto dto = TaskDto.builder()
                .title("Implement Authentication")
                .projectId(1L)
                .dueDate(LocalDate.now().plusDays(5))
                .build();

        when(taskRepository.count()).thenReturn(0L);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        when(taskRepository.findByProjectId(1L)).thenReturn(List.of(task));

        TaskDto result = taskService.createTask(dto, "admin");

        assertNotNull(result);
        assertEquals("Implement Authentication", result.getTitle());
        verify(projectRepository, times(1)).save(project);
    }

    @Test
    void updateTask_StatusToCompleted_RecalculatesParentProjectProgress() {
        TaskDto updateDto = TaskDto.builder()
                .status("COMPLETED")
                .build();

        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(taskRepository.findByProjectId(1L)).thenReturn(List.of(task));

        TaskDto updated = taskService.updateTask(10L, updateDto, "admin");

        assertNotNull(updated);
        assertEquals("COMPLETED", updated.getStatus());
        assertEquals(100, updated.getProgress());
        assertEquals(100, project.getProgress()); // Project progress recalculated to 100%
        verify(projectRepository, times(1)).save(project);
    }

    @Test
    void deleteTask_RecalculatesParentProjectProgress() {
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));
        doNothing().when(taskRepository).delete(task);
        when(taskRepository.findByProjectId(1L)).thenReturn(List.of());

        taskService.deleteTask(10L, "admin");

        verify(taskRepository, times(1)).delete(task);
        verify(projectRepository, times(1)).save(project);
    }

    @Test
    void getTaskById_NotFound_ThrowsException() {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.getTaskById(999L));
    }
}
