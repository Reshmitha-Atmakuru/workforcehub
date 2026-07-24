package com.workforcehub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Long id;
    private String taskNumber;
    private String title;
    private String description;
    private Long projectId;
    private String projectName;
    private Long assignedEmployeeId;
    private String assignedEmployeeName;
    private String priority;
    private String status;
    private Integer progress;
    private LocalDate dueDate;
    private String remarks;
}
