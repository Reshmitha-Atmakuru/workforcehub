package com.workforcehub.repository;

import com.workforcehub.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignedEmployeeId(Long employeeId);

    @Query("SELECT t FROM Task t WHERE " +
           "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.taskNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:projectId IS NULL OR t.project.id = :projectId) AND " +
           "(:assignedEmployeeId IS NULL OR t.assignedEmployee.id = :assignedEmployeeId) AND " +
           "(:status IS NULL OR UPPER(t.status) = UPPER(:status)) AND " +
           "(:priority IS NULL OR UPPER(t.priority) = UPPER(:priority))")
    List<Task> searchTasks(
            @Param("search") String search,
            @Param("projectId") Long projectId,
            @Param("assignedEmployeeId") Long assignedEmployeeId,
            @Param("status") String status,
            @Param("priority") String priority);
}
