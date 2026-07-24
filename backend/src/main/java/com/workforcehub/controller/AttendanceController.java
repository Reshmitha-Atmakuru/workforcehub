package com.workforcehub.controller;

import com.workforcehub.dto.AttendanceDto;
import com.workforcehub.exception.ResourceNotFoundException;
import com.workforcehub.model.Attendance;
import com.workforcehub.model.Employee;
import com.workforcehub.repository.AttendanceRepository;
import com.workforcehub.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/attendance", "/attendance"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceController {


    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping
    public ResponseEntity<List<AttendanceDto>> getAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate queryDate = date != null ? date : LocalDate.now();

        List<AttendanceDto> dtos = attendanceRepository.findByDate(queryDate).stream()
                .map(a -> AttendanceDto.builder()
                        .id(a.getId())
                        .employeeId(a.getEmployee().getId())
                        .employeeName(a.getEmployee().getFirstName() + " " + a.getEmployee().getLastName())
                        .date(a.getDate())
                        .checkIn(a.getCheckIn())
                        .checkOut(a.getCheckOut())
                        .status(a.getStatus())
                        .workHours(a.getWorkHours())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/check-in")
    public ResponseEntity<Attendance> checkIn(@RequestParam Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElse(Attendance.builder()
                        .employee(employee)
                        .date(today)
                        .checkIn(LocalTime.now())
                        .status("PRESENT")
                        .workHours(8.0)
                        .build());

        return ResponseEntity.ok(attendanceRepository.save(attendance));
    }
}
