package com.example.calendario.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.calendario.dto.event.EventCreateRequestDTO;
import com.example.calendario.dto.event.EventDeleteResponseDTO;
import com.example.calendario.dto.event.EventResponseDTO;
import com.example.calendario.dto.event.EventUpdateRequestDTO;
import com.example.calendario.service.EventService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
public class EventController {

    private final EventService eventService;

    // Constructor
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // POST Create Event
    @PostMapping("/events")
    public ResponseEntity<EventResponseDTO> createEvent(@Valid @RequestBody EventCreateRequestDTO requestDTO) {
        // Get authenticated username from JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        EventResponseDTO response = eventService.createEvent(requestDTO, authenticatedUsername);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // PATCH Update Event
    @PatchMapping("/events/{id}")
    public ResponseEntity<EventResponseDTO> updateEvent(
            @PathVariable("id") String eventId,
            @Valid @RequestBody EventUpdateRequestDTO requestDTO) {
        // Get authenticated username from JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        EventResponseDTO response = eventService.updateEvent(eventId, requestDTO, authenticatedUsername);
        return ResponseEntity.ok(response);
    }

    // DELETE Delete Event
    @DeleteMapping("/events/{id}")
    public ResponseEntity<EventDeleteResponseDTO> deleteEvent(@PathVariable("id") String eventId) {
        // Get authenticated username from JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        EventDeleteResponseDTO response = eventService.deleteEvent(eventId, authenticatedUsername);
        return ResponseEntity.ok(response);
    }

}
