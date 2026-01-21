package com.example.calendario.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.calendario.dto.calendar.CalendarCreateRequestDTO;
import com.example.calendario.dto.calendar.CalendarInviteAcceptRequestDTO;
import com.example.calendario.dto.calendar.CalendarInviteAcceptResponseDTO;
import com.example.calendario.dto.calendar.CalendarInviteResponseDTO;
import com.example.calendario.dto.calendar.CalendarResponseDTO;
import com.example.calendario.dto.calendar.CalendarUpdateRequestDTO;
import com.example.calendario.dto.calendar.CalendarUpdateResponseDTO;
import com.example.calendario.service.CalendarService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/v1")
public class CalendarController {

    private final CalendarService calendarService;

    // Constructor
    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    // POST Create Calendar
    @PostMapping("/calendar")
    public ResponseEntity<CalendarResponseDTO> createCalendar(@Valid @RequestBody CalendarCreateRequestDTO requestDTO) {
        // Get authenticated username from JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        CalendarResponseDTO response = calendarService.createCalendar(requestDTO, authenticatedUsername);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // PATCH Update Calendar
    @PatchMapping("/calendar/{calendar_id}")
    public ResponseEntity<CalendarUpdateResponseDTO> updateCalendar(
            @PathVariable("calendar_id") String calendarId,
            @Valid @RequestBody CalendarUpdateRequestDTO requestDTO) {
        // Get authenticated username from JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        CalendarUpdateResponseDTO response = calendarService.updateCalendar(calendarId, requestDTO, authenticatedUsername);
        return ResponseEntity.ok(response);
    }

    // DELETE Delete Calendar
    @DeleteMapping("/calendar/{calendar_id}")
    public ResponseEntity<Void> deleteCalendar(@PathVariable("calendar_id") String calendarId) {
        // Get authenticated username from JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        calendarService.deleteCalendar(calendarId, authenticatedUsername);
        return ResponseEntity.noContent().build();
    }

    // GET Generate Invite Link
    @GetMapping("/calendars/{calendar_id}/invite")
    public ResponseEntity<CalendarInviteResponseDTO> generateInviteLink(@PathVariable("calendar_id") String calendarId) {
        // Get authenticated username from JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        CalendarInviteResponseDTO response = calendarService.generateInviteLink(calendarId, authenticatedUsername);
        return ResponseEntity.ok(response);
    }

    // POST Accept Calendar Invite
    @PostMapping("/calendars/invite/accept")
    public ResponseEntity<CalendarInviteAcceptResponseDTO> acceptInvite(
            @Valid @RequestBody CalendarInviteAcceptRequestDTO requestDTO) {
        // Get authenticated username from JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        CalendarInviteAcceptResponseDTO response = calendarService.acceptInvite(requestDTO.getInviteToken(), authenticatedUsername);
        return ResponseEntity.ok(response);
    }

}
