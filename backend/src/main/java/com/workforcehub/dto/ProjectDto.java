package com.workforcehub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String department;
    private String priority;
    private String status;
    private Integer progress;
    private Integer totalTasks;
    private Integer completedTasks;
    private Integer pendingTasks;
    private BigDecimal budget;
    private LocalDate startDate;
    private LocalDate deadline;
    private java.util.List<Long> assignedEmployeeIds;
    private java.util.List<TaskDto> initialTasks;
}

