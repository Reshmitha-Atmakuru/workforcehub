package com.workforcehub.service;

import com.workforcehub.dto.TaskDto;
import java.util.List;

public interface TaskService {
    List<TaskDto> getAllTasks(String search, String status, String priority);
    TaskDto getTaskById(Long id);
    TaskDto createTask(TaskDto taskDto, String currentUsername);
    TaskDto updateTask(Long id, TaskDto taskDto, String currentUsername);
    void deleteTask(Long id, String currentUsername);
}
