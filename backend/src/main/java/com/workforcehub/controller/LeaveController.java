package com.workforcehub.controller;

import com.workforcehub.dto.LeaveRequestDto;
import com.workforcehub.exception.BadRequestException;
import com.workforcehub.exception.ResourceNotFoundException;
import com.workforcehub.model.Employee;
import com.workforcehub.model.LeaveRequest;
import com.workforcehub.repository.EmployeeRepository;
import com.workforcehub.repository.LeaveRequestRepository;
import com.workforcehub.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/leaves", "/leaves"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LeaveController {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final EmailService emailService;

    @GetMapping
    public ResponseEntity<List<LeaveRequestDto>> getAllLeaves(@RequestParam(required = false) String status) {
        List<LeaveRequest> list = (status != null && !status.equals("ALL"))
                ? leaveRequestRepository.findByStatus(status)
                : leaveRequestRepository.findAll();

        List<LeaveRequestDto> dtos = list.stream().map(l -> LeaveRequestDto.builder()
                .id(l.getId())
                .employeeId(l.getEmployee().getId())
                .employeeName(l.getEmployee().getFirstName() + " " + l.getEmployee().getLastName())
                .type(l.getType())
                .startDate(l.getStartDate())
                .endDate(l.getEndDate())
                .reason(l.getReason())
                .status(l.getStatus())
                .adminComments(l.getAdminComments())
                .appliedDate(l.getAppliedDate())
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<LeaveRequestDto> createLeaveRequest(@Valid @RequestBody LeaveRequestDto dto) {
        if (dto.getEmployeeId() == null) {
            throw new BadRequestException("Employee ID must not be null");
        }
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + dto.getEmployeeId()));

        LeaveRequest leave = LeaveRequest.builder()
                .employee(employee)
                .type(dto.getType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .status("PENDING")
                .build();

        LeaveRequest saved = leaveRequestRepository.save(leave);

        return ResponseEntity.status(HttpStatus.CREATED).body(LeaveRequestDto.builder()
                .id(saved.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getFirstName() + " " + employee.getLastName())
                .type(saved.getType())
                .startDate(saved.getStartDate())
                .endDate(saved.getEndDate())
                .reason(saved.getReason())
                .status(saved.getStatus())
                .appliedDate(saved.getAppliedDate())
                .build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<LeaveRequest> updateLeaveStatus(@PathVariable Long id, @RequestParam String status, @RequestParam(required = false) String comments) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        leave.setStatus(status);
        if (comments != null) leave.setAdminComments(comments);

        LeaveRequest updated = leaveRequestRepository.save(leave);

        // Send email notification to employee about leave status change
        if (updated.getEmployee() != null && updated.getEmployee().getEmail() != null) {
            String employeeName = updated.getEmployee().getFirstName() + " " + updated.getEmployee().getLastName();
            emailService.sendLeaveStatusEmail(
                    updated.getEmployee().getEmail(),
                    employeeName,
                    updated.getType(),
                    status,
                    comments
            );
        }

        return ResponseEntity.ok(updated);
    }
}

