package com.example.calendario.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.example.calendario.dto.CalendarItemResponseDTO;
import com.example.calendario.dto.event.EventResponseDTO;
import com.example.calendario.dto.invite.InviteRequestDTO;
import com.example.calendario.dto.invite.InviteResponseDTO;
import com.example.calendario.dto.poll.PollOptionDTO;
import com.example.calendario.dto.poll.PollResponseDTO;
import com.example.calendario.exception.ForbiddenException;
import com.example.calendario.exception.InvalidRequestException;
import com.example.calendario.exception.ResourceNotFoundException;
import com.example.calendario.model.Event;
import com.example.calendario.model.Poll;
import com.example.calendario.model.User;
import com.example.calendario.repository.EventRepository;
import com.example.calendario.repository.PollRepository;

@Service
public class InviteService {
    private final EventRepository eventRepository;
    private final PollRepository pollRepository;

    private final UserService userService;
    private final EventService eventService;
    private final PollService pollService;

    public InviteService(EventRepository eventRepository, PollRepository pollRepository, UserService userService, EventService eventService, PollService pollService) {
        this.eventRepository = eventRepository;
        this.pollRepository = pollRepository;
        this.userService = userService;
        this.eventService = eventService;
        this.pollService = pollService;
    }

    // generate invite link for event or poll
    public InviteResponseDTO generateInviteLink(InviteRequestDTO dto,
            String authenticatedUsername) {
        // Validate authenticated user exists
		User authenticatedUser = userService.findByUsername(authenticatedUsername)
				.orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        if (dto.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Expiration date must be in the future");
        }
        
        if (dto.getEventId() != null) {
            Event event = eventService.getEventById(dto.getEventId());
            String calendarId = event.getCalendarId();
            if (!authenticatedUser.isAdminOfCalendar(calendarId) && !authenticatedUser.isSuperuser()) {
                throw new com.example.calendario.exception.ForbiddenException("You do not have permission to create invites for this event");
            }

            // Generate invite link
            String token = java.util.UUID.randomUUID().toString();
            String inviteLink = "http://localhost:4200/invitelink?token=" + token;

            // Save invite link to event
            event.addInviteLink(token, LocalDateTime.now(), dto.getExpirationDate());
            eventRepository.save(event);

            return new InviteResponseDTO(
                event.getId(),
                null,
                inviteLink
            );
        } else if (dto.getPollId() != null) {
            Poll poll = pollService.getPollById(dto.getPollId());
            String calendarId = poll.getCalendarId();
            if (!authenticatedUser.isAdminOfCalendar(calendarId) && !authenticatedUser.isSuperuser()) {
                throw new com.example.calendario.exception.ForbiddenException("You do not have permission to create invites for this poll");
            }

            // Generate invite link
            String token = java.util.UUID.randomUUID().toString();
            String inviteLink = "http://localhost:4200/invitelink?token=" + token;

            // Save invite link to poll
            poll.addInviteLink(token, LocalDateTime.now(), dto.getExpirationDate());
            pollRepository.save(poll);

            return new InviteResponseDTO(
                null,
                poll.getId(),
                inviteLink
            );
        } else {
            throw new InvalidRequestException("Either eventId or pollId must be provided");
        }
    }

    // get event or poll by invite token
    public CalendarItemResponseDTO getCalendarItemByToken(String token) {
        // Check events for the token
        Event event = eventRepository.findByInviteLinksToken(token).get();
        if (event != null) {
            // Verify token is not expired
            event.getInviteLinks().stream()
                .filter(link -> link.getToken().equals(token))
                .findFirst()
                .ifPresent(link -> {
                    if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(LocalDateTime.now())) {
                        throw new ForbiddenException("Invite link has expired");
                    }
                });

            // Convert to EventResponseDTO
            return new EventResponseDTO(
                event.getId(),
                event.getCalendarId(),
                event.getTitle(),
                event.getStartTime(),
                event.getEndTime(),
                event.getDescription(),
                event.getNotes(),
                event.getTags()
            );
        }

        // Check polls for the token
        Poll poll = pollRepository.findByInviteLinksToken(token).get();
        if (poll != null) {
            // Verify token is not expired
            poll.getInviteLinks().stream()
                .filter(link -> link.getToken().equals(token))
                .findFirst()
                .ifPresent(link -> {
                    if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(LocalDateTime.now())) {
                        throw new ForbiddenException("Invite link has expired");
                    }
                });

            // Convert to PollResponseDTO
            return new PollResponseDTO(
                poll.getId(),
                poll.getCalendarId(),
                poll.getTitle(),
                poll.getDescription(),
                poll.getNotes(),
                poll.getStartTime(),
                poll.getEndTime(),
                poll.isResultsVisible(),
                poll.isAllowMultipleVotes(),
                poll.getOptions().stream().map(o -> 
                    new PollOptionDTO(
                        o.getOptionId(),
                        o.getDescription(),
                        o.getUserVotes(),
                        o.getGuestVotes()
                    )
                ).toList(),
                poll.getTags()
            );
        }

        throw new ResourceNotFoundException("No event or poll found for the provided invite token");
    }
}
