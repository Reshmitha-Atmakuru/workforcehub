package com.workforcehub.service;

import com.workforcehub.dto.ProjectDto;
import com.workforcehub.exception.ResourceNotFoundException;
import com.workforcehub.model.Project;
import com.workforcehub.model.Task;
import com.workforcehub.repository.AuditLogRepository;
import com.workforcehub.repository.ProjectRepository;
import com.workforcehub.repository.TaskRepository;
import com.workforcehub.service.impl.ProjectServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProjectServiceImplTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private ProjectServiceImpl projectService;

    private Project project;
    private ProjectDto projectDto;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(1L)
                .code("PRJ-2026-01")
                .name("Smart Workforce Portal")
                .description("Enterprise management portal")
                .department("Engineering")
                .priority("HIGH")
                .status("In Progress")
                .progress(0)
                .budget(new BigDecimal("500000.00"))
                .startDate(LocalDate.now())
                .deadline(LocalDate.now().plusMonths(3))
                .build();

        projectDto = ProjectDto.builder()
                .name("Smart Workforce Portal")
                .description("Enterprise management portal")
                .department("Engineering")
                .priority("HIGH")
                .budget(new BigDecimal("500000.00"))
                .startDate(LocalDate.now())
                .deadline(LocalDate.now().plusMonths(3))
                .build();
    }

    @Test
    void getProjectById_CalculatesDynamicProgressFromTasks() {
        Task task1 = Task.builder().id(101L).status("COMPLETED").build();
        Task task2 = Task.builder().id(102L).status("TODO").build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(taskRepository.findByProjectId(1L)).thenReturn(List.of(task1, task2));

        ProjectDto dto = projectService.getProjectById(1L);

        assertNotNull(dto);
        assertEquals(2, dto.getTotalTasks());
        assertEquals(1, dto.getCompletedTasks());
        assertEquals(1, dto.getPendingTasks());
        assertEquals(50, dto.getProgress()); // 1 completed out of 2 tasks = 50%
    }

    @Test
    void getProjectById_100PercentCompleted_AutoSetsCompletedStatus() {
        Task task1 = Task.builder().id(101L).status("COMPLETED").build();
        Task task2 = Task.builder().id(102L).status("COMPLETED").build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(taskRepository.findByProjectId(1L)).thenReturn(List.of(task1, task2));

        ProjectDto dto = projectService.getProjectById(1L);

        assertNotNull(dto);
        assertEquals(100, dto.getProgress());
        assertEquals("Completed", dto.getStatus());
        verify(projectRepository, times(1)).save(project);
    }

    @Test
    void createProject_Success() {
        when(projectRepository.count()).thenReturn(0L);
        when(projectRepository.save(any(Project.class))).thenReturn(project);

        ProjectDto created = projectService.createProject(projectDto, "admin");

        assertNotNull(created);
        assertEquals("Smart Workforce Portal", created.getName());
        verify(projectRepository, times(1)).save(any(Project.class));
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    void getProjectById_NotFound_ThrowsException() {
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> projectService.getProjectById(99L));
    }
}
