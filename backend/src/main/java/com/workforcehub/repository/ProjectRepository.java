package com.workforcehub.repository;

import com.workforcehub.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByCode(String code);

    @Query("SELECT p FROM Project p WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:department IS NULL OR LOWER(p.department) = LOWER(:department)) AND " +
           "(:status IS NULL OR LOWER(p.status) = LOWER(:status))")
    List<Project> searchProjects(
            @Param("search") String search,
            @Param("department") String department,
            @Param("status") String status);
}
