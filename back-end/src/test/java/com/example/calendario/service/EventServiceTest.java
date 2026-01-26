package com.example.calendario.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.calendario.dto.event.EventCreateRequestDTO;
import com.example.calendario.dto.event.EventDeleteResponseDTO;
import com.example.calendario.dto.event.EventResponseDTO;
import com.example.calendario.dto.event.EventUpdateRequestDTO;
import com.example.calendario.dto.invite.EventInviteResponseDTO;
import com.example.calendario.exception.ForbiddenException;
import com.example.calendario.exception.ResourceNotFoundException;
import com.example.calendario.model.Calendar;
import com.example.calendario.model.Event;
import com.example.calendario.model.User;
import com.example.calendario.repository.EventRepository;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private CalendarService calendarService;

    @Mock
    private UserService userService;

    @InjectMocks
    private EventService eventService;

    private User testUser;
    private User adminUser;
    private Calendar testCalendar;
    private Event testEvent;
    private EventCreateRequestDTO createRequestDTO;

    @BeforeEach
    public void setUp() {
        testUser = new User("testuser", "test@example.com", "password");
        testUser.setId("user-123");

        adminUser = new User("adminuser", "admin@example.com", "password");
        adminUser.setId("admin-123");
        adminUser.addCalendarMembership("cal-123", true); // Admin

        testCalendar = new Calendar();
        testCalendar.setId("cal-123");
        testCalendar.setName("Test Calendar");

        testEvent = new Event();
        testEvent.setId("event-123");
        testEvent.setCalendarId("cal-123");
        testEvent.setTitle("Test Event");
        testEvent.setStartTime(LocalDateTime.now());
        testEvent.setEndTime(LocalDateTime.now().plusHours(1));
        testEvent.setDescription("Test description");

        createRequestDTO = new EventCreateRequestDTO();
        createRequestDTO.setCalendarId("cal-123");
        createRequestDTO.setTitle("New Event");
        createRequestDTO.setStartTime(LocalDateTime.now());
        createRequestDTO.setEndTime(LocalDateTime.now().plusHours(2));
        createRequestDTO.setDescription("New event description");
    }

    @Test
    void testCreateEvent_Success() {
        // Arrange
        when(userService.findByUsername("adminuser")).thenReturn(Optional.of(adminUser));
        when(calendarService.getCalendarById("cal-123")).thenReturn(testCalendar);
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> {
            Event event = invocation.getArgument(0);
            event.setId("new-event-123");
            return event;
        });

        // Act
        EventResponseDTO result = eventService.createEvent(createRequestDTO, "adminuser");

        // Assert
        assertNotNull(result);
        assertEquals("new-event-123", result.getEventId());
        assertEquals("New Event", result.getTitle());
        assertEquals("cal-123", result.getCalendarId());
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    void testCreateEvent_NotAdmin() {
        // Arrange
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(calendarService.getCalendarById("cal-123")).thenReturn(testCalendar);

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            eventService.createEvent(createRequestDTO, "testuser");
        });
        assertEquals("You do not have permission to create events in this calendar", exception.getMessage());
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void testCreateEvent_CalendarNotFound() {
        // Arrange
        when(userService.findByUsername("adminuser")).thenReturn(Optional.of(adminUser));
        when(calendarService.getCalendarById("cal-123")).thenThrow(new ResourceNotFoundException("Calendar not found"));

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            eventService.createEvent(createRequestDTO, "adminuser");
        });
        assertEquals("Calendar not found", exception.getMessage());
    }

    @Test
    void testGetEventById_Success() {
        // Arrange
        when(eventRepository.findById("event-123")).thenReturn(Optional.of(testEvent));

        // Act
        Event result = eventService.getEventById("event-123");

        // Assert
        assertNotNull(result);
        assertEquals("event-123", result.getId());
        assertEquals("Test Event", result.getTitle());
    }

    @Test
    void testGetEventById_NotFound() {
        // Arrange
        when(eventRepository.findById("invalid-id")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            eventService.getEventById("invalid-id");
        });
        assertEquals("Event not found", exception.getMessage());
    }

    @Test
    void testUpdateEvent_Success() {
        // Arrange
        EventUpdateRequestDTO updateDTO = new EventUpdateRequestDTO();
        updateDTO.setTitle("Updated Event");
        updateDTO.setDescription("Updated description");

        when(userService.findByUsername("adminuser")).thenReturn(Optional.of(adminUser));
        when(eventRepository.findById("event-123")).thenReturn(Optional.of(testEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        EventResponseDTO result = eventService.updateEvent("event-123", updateDTO, "adminuser");

        // Assert
        assertNotNull(result);
        assertEquals("event-123", result.getEventId());
        assertEquals("Updated Event", result.getTitle());
        assertEquals("Updated description", result.getDescription());
        verify(eventRepository, times(1)).save(testEvent);
    }

    @Test
    void testUpdateEvent_NotAdmin() {
        // Arrange
        EventUpdateRequestDTO updateDTO = new EventUpdateRequestDTO();
        updateDTO.setTitle("Updated Event");

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(eventRepository.findById("event-123")).thenReturn(Optional.of(testEvent));

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            eventService.updateEvent("event-123", updateDTO, "testuser");
        });
        assertEquals("You do not have permission to update this event", exception.getMessage());
    }

    @Test
    void testDeleteEvent_Success() {
        // Arrange
        when(userService.findByUsername("adminuser")).thenReturn(Optional.of(adminUser));
        when(eventRepository.findById("event-123")).thenReturn(Optional.of(testEvent));
        doNothing().when(eventRepository).deleteById("event-123");

        // Act
        EventDeleteResponseDTO result = eventService.deleteEvent("event-123", "adminuser");

        // Assert
        assertNotNull(result);
        assertEquals("event-123", result.getEventId());
        assertEquals("cal-123", result.getCalendarId());
        assertTrue(result.getDeleted());
        verify(eventRepository, times(1)).deleteById("event-123");
    }

    @Test
    void testDeleteEvent_NotAdmin() {
        // Arrange
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(eventRepository.findById("event-123")).thenReturn(Optional.of(testEvent));

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            eventService.deleteEvent("event-123", "testuser");
        });
        assertEquals("You do not have permission to delete this event", exception.getMessage());
    }

    @Test
    void testGetEventsByCalendarIds() {
        // Arrange
        List<String> calendarIds = List.of("cal-123", "cal-456");
        List<Event> events = List.of(testEvent);

        when(eventRepository.findByCalendarIdIn(calendarIds)).thenReturn(events);

        // Act
        List<Event> result = eventService.getEventsByCalendarIds(calendarIds);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("event-123", result.get(0).getId());
    }

    // @Test
    // void testGenerateEventGuestLink_Success() {
    //     // Arrange
    //     when(userService.findByUsername("adminuser")).thenReturn(Optional.of(adminUser));
    //     when(eventRepository.findById("event-123")).thenReturn(Optional.of(testEvent));
    //     when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

    //     // Act
    //     EventInviteResponseDTO result = eventService.generateEventGuestLink("event-123", "John Doe", "adminuser");

    //     // Assert
    //     assertNotNull(result);
    //     assertEquals("event-123", result.getEventId());
    //     assertEquals("John Doe", result.getGuestName());
    //     assertNotNull(result.getInviteLink());
    //     assertTrue(result.getInviteLink().contains("/events/guest/"));
    //     verify(eventRepository, times(1)).save(testEvent);
    // }

    // @Test
    // void testGenerateEventGuestLink_NotAdmin() {
    //     // Arrange
    //     when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
    //     when(eventRepository.findById("event-123")).thenReturn(Optional.of(testEvent));

    //     // Act & Assert
    //     ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
    //         eventService.generateEventGuestLink("event-123", "John Doe", "testuser");
    //     });
    //     assertEquals("You do not have permission to create guest links for this event", exception.getMessage());
    // }

    // @Test
    // void testGetEventByGuestToken_Success() {
    //     // Arrange
    //     String token = "guest-token-123";
    //     testEvent.addGuestLink(token, "John Doe", LocalDateTime.now());

    //     when(eventRepository.findByGuestLinksToken(token)).thenReturn(Optional.of(testEvent));

    //     // Act
    //     EventResponseDTO result = eventService.getEventByGuestToken(token, "John Doe");

    //     // Assert
    //     assertNotNull(result);
    //     assertEquals("event-123", result.getEventId());
    //     assertEquals("Test Event", result.getTitle());
    // }

    // @Test
    // void testGetEventByGuestToken_InvalidToken() {
    //     // Arrange
    //     String token = "invalid-token";

    //     when(eventRepository.findByGuestLinksToken(token)).thenReturn(Optional.empty());

    //     // Act & Assert
    //     ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
    //         eventService.getEventByGuestToken(token, "John Doe");
    //     });
    //     assertEquals("Invalid or expired invite link", exception.getMessage());
    // }

    // @Test
    // void testGetEventByGuestToken_WrongGuestName() {
    //     // Arrange
    //     String token = "guest-token-123";
    //     testEvent.addGuestLink(token, "John Doe", LocalDateTime.now());

    //     when(eventRepository.findByGuestLinksToken(token)).thenReturn(Optional.of(testEvent));

    //     // Act & Assert
    //     ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
    //         eventService.getEventByGuestToken(token, "Wrong Name");
    //     });
    //     assertEquals("Guest name does not match the invite", exception.getMessage());
    // }
}
