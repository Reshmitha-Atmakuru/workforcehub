package com.workforcehub.service;

import com.workforcehub.dto.TaskDto;
import java.util.List;

public interface TaskService {
    List<TaskDto> getAllTasks(String search, Long projectId, Long assignedEmployeeId, String status, String priority, String sortBy, String direction);
    List<TaskDto> getMyTasks(String username, String search, String status, String priority, String sortBy, String direction);
    TaskDto getTaskById(Long id);
    TaskDto createTask(TaskDto taskDto, String currentUsername);
    TaskDto updateTask(Long id, TaskDto taskDto, String currentUsername);
    void deleteTask(Long id, String currentUsername);
}
