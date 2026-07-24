package com.workforcehub.service;

import com.workforcehub.dto.ProjectDto;
import java.util.List;

public interface ProjectService {
    List<ProjectDto> getAllProjects(String search, String department, String status, String priority, String sortBy, String direction);
    List<ProjectDto> getMyProjects(String username);
    ProjectDto getProjectById(Long id);
    ProjectDto createProject(ProjectDto projectDto, String currentUsername);
    ProjectDto updateProject(Long id, ProjectDto projectDto, String currentUsername);
    void deleteProject(Long id, String currentUsername);
}
