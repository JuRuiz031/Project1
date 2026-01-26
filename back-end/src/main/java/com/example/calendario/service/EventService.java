package com.example.calendario.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.calendario.dto.event.EventCreateRequestDTO;
import com.example.calendario.dto.event.EventDeleteResponseDTO;
import com.example.calendario.dto.event.EventResponseDTO;
import com.example.calendario.dto.event.EventUpdateRequestDTO;
import com.example.calendario.exception.ForbiddenException;
import com.example.calendario.exception.ResourceNotFoundException;
import com.example.calendario.model.Event;
import com.example.calendario.model.User;
import com.example.calendario.repository.EventRepository;

@Service
public class EventService {
    private final EventRepository eventRepository;
    private final CalendarService calendarService;
    private final UserService userService;

    // Constructor
    public EventService(EventRepository eventRepository, CalendarService calendarService, UserService userService) {
        this.eventRepository = eventRepository;
        this.calendarService = calendarService;
        this.userService = userService;
    }

    // Create a new event
    public EventResponseDTO createEvent(EventCreateRequestDTO dto, String authenticatedUsername) {
        // Validate authenticated user exists
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        // Validate calendar exists (throws exception if not found)
        calendarService.getCalendarById(dto.getCalendarId());

        // Check if authenticated user is admin of this calendar
        if (!authenticatedUser.isAdminOfCalendar(dto.getCalendarId()) && !authenticatedUser.isSuperuser()) {
            throw new ForbiddenException("You do not have permission to create events in this calendar");
        }

        // Create new Event
        Event event = new Event();
        event.setCalendarId(dto.getCalendarId());
        event.setTitle(dto.getTitle());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setDescription(dto.getDescription());
        event.setNotes(dto.getNotes());
        event.setTags(dto.getTags());

        // Save event
        Event savedEvent = eventRepository.save(event);

        return new EventResponseDTO(
                savedEvent.getId(),
                savedEvent.getCalendarId(),
                savedEvent.getTitle(),
                savedEvent.getStartTime(),
                savedEvent.getEndTime(),
                savedEvent.getDescription(),
                savedEvent.getNotes(),
                savedEvent.getTags()
        );
    }

    // Get event by ID
    public Event getEventById(String eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
    }

    // Update event
    public EventResponseDTO updateEvent(String eventId, EventUpdateRequestDTO dto, String authenticatedUsername) {
        // Get authenticated user
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        // Get event
        Event event = getEventById(eventId);

        // Check if authenticated user is admin of the calendar this event belongs to
        if (!authenticatedUser.isAdminOfCalendar(event.getCalendarId()) && !authenticatedUser.isSuperuser()) {
            throw new ForbiddenException("You do not have permission to update this event");
        }

        // Update fields if provided
        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            event.setTitle(dto.getTitle());
        }
        if (dto.getStartTime() != null) {
            event.setStartTime(dto.getStartTime());
        }
        if (dto.getEndTime() != null) {
            event.setEndTime(dto.getEndTime());
        }
        if (dto.getDescription() != null) {
            event.setDescription(dto.getDescription());
        }
        if (dto.getNotes() != null) {
            event.setNotes(dto.getNotes());
        }
        if (dto.getTags() != null) {
            event.setTags(dto.getTags());
        }

        // Save updated event
        Event updatedEvent = eventRepository.save(event);

        return new EventResponseDTO(
                updatedEvent.getId(),
                updatedEvent.getCalendarId(),
                updatedEvent.getTitle(),
                updatedEvent.getStartTime(),
                updatedEvent.getEndTime(),
                updatedEvent.getDescription(),
                updatedEvent.getNotes(),
                updatedEvent.getTags()
        );
    }

    // Delete event
    public EventDeleteResponseDTO deleteEvent(String eventId, String authenticatedUsername) {
        // Get authenticated user
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        // Get event (throws ResourceNotFoundException if not found)
        Event event = getEventById(eventId);

        // Check if authenticated user is admin of the calendar this event belongs to
        if (!authenticatedUser.isAdminOfCalendar(event.getCalendarId()) && !authenticatedUser.isSuperuser()) {
            throw new ForbiddenException("You do not have permission to delete this event");
        }

        // Delete event
        eventRepository.deleteById(eventId);

        return new EventDeleteResponseDTO(event.getId(), event.getCalendarId(), true);
    }

    // Get events by IDs (for calendar filtering endpoint)
    public List<Event> getEventsByIds(List<String> eventIds) {
        return eventRepository.findAllById(eventIds);
    }

    // Get events by calendar IDs (for calendar filtering endpoint)
    public List<Event> getEventsByCalendarIds(List<String> calendarIds) {
        return eventRepository.findByCalendarIdIn(calendarIds);
    }

    // Get event by invite token (used by InviteService)
    public com.example.calendario.dto.event.EventResponseDTO getEventByInviteToken(String token, String guestName) {
        // Find event by guest token
        Event event = eventRepository.findByInviteLinksToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired invite link"));

        // Return event details
        return new com.example.calendario.dto.event.EventResponseDTO(
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
}
