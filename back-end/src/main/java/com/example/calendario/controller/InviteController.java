package com.example.calendario.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.calendario.dto.CalendarItemResponseDTO;
import com.example.calendario.dto.invite.InviteRequestDTO;
import com.example.calendario.dto.invite.InviteResponseDTO;
import com.example.calendario.service.InviteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
public class InviteController {

	private final InviteService inviteService;

	public InviteController(InviteService inviteService) {
		this.inviteService = inviteService;
	}

	// create invite link for a single event or poll
	@PostMapping("/invite")
	public ResponseEntity<InviteResponseDTO> createInvite(
			@Valid @RequestBody InviteRequestDTO requestDTO) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String authenticatedUsername = authentication.getName();

		InviteResponseDTO response = inviteService.generateInviteLink(
				requestDTO,
				authenticatedUsername
		);

		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

    // resolve invite link to get event or poll details
    @GetMapping("/invitelink")
    public ResponseEntity<CalendarItemResponseDTO> resolveInviteLink(
        @RequestParam(name = "token", required = true) String token) {

        CalendarItemResponseDTO responseDTO = inviteService.getCalendarItemByToken(token);

        return ResponseEntity.ok(responseDTO);
    }

}

