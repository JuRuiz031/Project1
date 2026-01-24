package com.example.calendario.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.calendario.dto.event.EventResponseDTO;
import com.example.calendario.dto.invite.EventInviteRequestDTO;
import com.example.calendario.dto.invite.EventInviteResponseDTO;
import com.example.calendario.dto.invite.GuestAccessRequestDTO;
import com.example.calendario.service.EventService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/invites")
public class InviteController {

    private final EventService eventService;

    // Constructor
    public InviteController(EventService eventService) {
        this.eventService = eventService;
    }

    // POST Generate guest invite link for an event
    // Requires JWT authentication
    @PostMapping("/events/{event_id}")
    public ResponseEntity<EventInviteResponseDTO> generateEventInvite(
            @PathVariable("event_id") String eventId,
            @Valid @RequestBody EventInviteRequestDTO requestDTO) {
        // Get authenticated username from JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        EventInviteResponseDTO response = eventService.generateEventGuestLink(
                eventId, requestDTO.getGuestName(), authenticatedUsername);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // POST Access event via guest token
    // NO JWT required - public endpoint with guest name verification
    @PostMapping("/events/guest/{token}")
    public ResponseEntity<EventResponseDTO> accessEventAsGuest(
            @PathVariable("token") String token,
            @Valid @RequestBody GuestAccessRequestDTO requestDTO) {
        EventResponseDTO response = eventService.getEventByGuestToken(token, requestDTO.getGuestName());
        return ResponseEntity.ok(response);
    }
}
