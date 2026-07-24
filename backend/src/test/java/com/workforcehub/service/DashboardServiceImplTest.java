package com.workforcehub.service;

import com.workforcehub.dto.DashboardStatsDto;
import com.workforcehub.model.Employee;
import com.workforcehub.model.Project;
import com.workforcehub.model.Task;
import com.workforcehub.repository.EmployeeRepository;
import com.workforcehub.repository.ProjectRepository;
import com.workforcehub.repository.TaskRepository;
import com.workforcehub.service.impl.DashboardServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    @Test
    void getDashboardStats_AggregatesMetricsCorrectly() {
        Employee e1 = Employee.builder().id(1L).department("Engineering").build();
        Employee e2 = Employee.builder().id(2L).department("HR").build();

        Project p1 = Project.builder().id(10L).name("Project A").status("In Progress").build();

        Task t1 = Task.builder().id(100L).status("COMPLETED").project(p1).build();
        Task t2 = Task.builder().id(101L).status("TODO").priority("URGENT").project(p1).build();

        when(employeeRepository.findAll()).thenReturn(List.of(e1, e2));
        when(projectRepository.findAll()).thenReturn(List.of(p1));
        when(taskRepository.findAll()).thenReturn(List.of(t1, t2));

        DashboardStatsDto stats = dashboardService.getDashboardStats();

        assertNotNull(stats);
        assertEquals(2, stats.getTotalWorkforce());
        assertEquals(1, stats.getTotalProjects());
        assertEquals(1, stats.getActiveProjects());
        assertEquals(1, stats.getPendingTasks());
        assertEquals(1, stats.getUrgentTasks());
        assertEquals(50, stats.getTaskCompletionRate()); // 1 out of 2 tasks completed = 50%
        assertEquals(1, stats.getActiveProjectsOverview().size());
        assertEquals(50, stats.getActiveProjectsOverview().get(0).getProgress()); // Project progress dynamic = 50%
    }
}
