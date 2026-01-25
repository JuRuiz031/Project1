package com.example.calendario.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.calendario.dto.calendar.CalendarCreateRequestDTO;
import com.example.calendario.dto.calendar.CalendarDeleteResponseDTO;
import com.example.calendario.dto.calendar.CalendarInviteAcceptResponseDTO;
import com.example.calendario.dto.calendar.CalendarInviteResponseDTO;
import com.example.calendario.dto.calendar.CalendarResponseDTO;
import com.example.calendario.dto.calendar.CalendarUpdateRequestDTO;
import com.example.calendario.dto.calendar.CalendarUpdateResponseDTO;
import com.example.calendario.exception.ForbiddenException;
import com.example.calendario.exception.ResourceNotFoundException;
import com.example.calendario.model.Calendar;
import com.example.calendario.model.User;
import com.example.calendario.repository.CalendarRepository;
import com.example.calendario.repository.EventRepository;

@ExtendWith(MockitoExtension.class)
class CalendarServiceTest {

    @Mock
    private CalendarRepository calendarRepository;

    @Mock
    private UserService userService;

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private CalendarService calendarService;

    private User testUser;
    private Calendar testCalendar;
    private CalendarCreateRequestDTO createRequestDTO;

    @BeforeEach
    public void setUp() {
        testUser = new User("testuser", "test@example.com", "password");
        testUser.setId("user-123");

        testCalendar = new Calendar();
        testCalendar.setId("cal-123");
        testCalendar.setName("Test Calendar");

        createRequestDTO = new CalendarCreateRequestDTO();
        createRequestDTO.setName("New Calendar");
    }

    @Test
    void testCreateCalendar_Success() {
        // Arrange
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userService.getCalendarIdsForUser(anyString(), anyString())).thenReturn(new ArrayList<>());
        when(calendarRepository.save(any(Calendar.class))).thenAnswer(invocation -> {
            Calendar cal = invocation.getArgument(0);
            cal.setId("new-cal-123");
            return cal;
        });
        when(userService.saveUser(any(User.class))).thenReturn(testUser);

        // Act
        CalendarResponseDTO result = calendarService.createCalendar(createRequestDTO, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals("new-cal-123", result.getCalendarId());
        assertEquals("New Calendar", result.getName());
        verify(calendarRepository, times(1)).save(any(Calendar.class));
        verify(userService, times(1)).saveUser(testUser);
    }

    @Test
    void testCreateCalendar_DuplicateName() {
        // Arrange
        testUser.addCalendarMembership("cal-123", true);
        List<String> calendarIds = List.of("cal-123");

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userService.getCalendarIdsForUser(anyString(), anyString())).thenReturn(calendarIds);
        when(calendarRepository.findAllById(calendarIds)).thenReturn(List.of(testCalendar));

        createRequestDTO.setName("Test Calendar"); // Same name as existing

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            calendarService.createCalendar(createRequestDTO, "testuser");
        });
        assertEquals("You already have a calendar with the name: Test Calendar", exception.getMessage());
        verify(calendarRepository, never()).save(any(Calendar.class));
    }

    @Test
    void testGetCalendarById_Success() {
        // Arrange
        when(calendarRepository.findById("cal-123")).thenReturn(Optional.of(testCalendar));

        // Act
        Calendar result = calendarService.getCalendarById("cal-123");

        // Assert
        assertNotNull(result);
        assertEquals("cal-123", result.getId());
        assertEquals("Test Calendar", result.getName());
    }

    @Test
    void testGetCalendarById_NotFound() {
        // Arrange
        when(calendarRepository.findById("invalid-id")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            calendarService.getCalendarById("invalid-id");
        });
        assertEquals("Calendar not found", exception.getMessage());
    }

    @Test
    void testUpdateCalendar_Success() {
        // Arrange
        testUser.addCalendarMembership("cal-123", true); // Admin
        CalendarUpdateRequestDTO updateDTO = new CalendarUpdateRequestDTO();
        updateDTO.setName("Updated Calendar");

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(calendarRepository.findById("cal-123")).thenReturn(Optional.of(testCalendar));
        when(calendarRepository.save(any(Calendar.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        CalendarUpdateResponseDTO result = calendarService.updateCalendar("cal-123", updateDTO, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals("cal-123", result.getCalendarId());
        assertEquals("Updated Calendar", result.getName());
        verify(calendarRepository, times(1)).save(testCalendar);
    }

    @Test
    void testUpdateCalendar_NotAdmin() {
        // Arrange
        testUser.addCalendarMembership("cal-123", false); // Not admin
        CalendarUpdateRequestDTO updateDTO = new CalendarUpdateRequestDTO();
        updateDTO.setName("Updated Calendar");

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(calendarRepository.findById("cal-123")).thenReturn(Optional.of(testCalendar));

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            calendarService.updateCalendar("cal-123", updateDTO, "testuser");
        });
        assertEquals("You do not have permission to update this calendar", exception.getMessage());
    }

    @Test
    void testDeleteCalendar_Success() {
        // Arrange
        testUser.addCalendarMembership("cal-123", true); // Admin

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(calendarRepository.findById("cal-123")).thenReturn(Optional.of(testCalendar));
        when(userService.getUsersByCalendarMembership("cal-123")).thenReturn(List.of(testUser));
        when(userService.saveAllUsers(anyIterable())).thenReturn(List.of(testUser));
        doNothing().when(calendarRepository).deleteById("cal-123");

        // Act
        CalendarDeleteResponseDTO result = calendarService.deleteCalendar("cal-123", "testuser");

        // Assert
        assertNotNull(result);
        assertEquals("cal-123", result.getCalendarId());
        assertTrue(result.isDeleted());
        verify(calendarRepository, times(1)).deleteById("cal-123");
    }

    @Test
    void testDeleteCalendar_NotAdmin() {
        // Arrange
        testUser.addCalendarMembership("cal-123", false); // Not admin

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(calendarRepository.findById("cal-123")).thenReturn(Optional.of(testCalendar));

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            calendarService.deleteCalendar("cal-123", "testuser");
        });
        assertEquals("You do not have permission to delete this calendar", exception.getMessage());
    }

    @Test
    void testGenerateInviteLink_Success() {
        // Arrange
        testUser.addCalendarMembership("cal-123", true); // Admin

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(calendarRepository.findById("cal-123")).thenReturn(Optional.of(testCalendar));
        when(calendarRepository.save(any(Calendar.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        CalendarInviteResponseDTO result = calendarService.generateInviteLink("cal-123", "testuser");

        // Assert
        assertNotNull(result);
        assertEquals("cal-123", result.getCalendarId());
        assertNotNull(result.getInviteLink());
        assertTrue(result.getInviteLink().contains("cal-123"));
        verify(calendarRepository, times(1)).save(testCalendar);
    }

    @Test
    void testGenerateInviteLink_NotAdmin() {
        // Arrange
        testUser.addCalendarMembership("cal-123", false); // Not admin

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(calendarRepository.findById("cal-123")).thenReturn(Optional.of(testCalendar));

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            calendarService.generateInviteLink("cal-123", "testuser");
        });
        assertEquals("You do not have permission to generate invites for this calendar", exception.getMessage());
    }

    @Test
    void testAcceptInvite_Success() {
        // Arrange
        String inviteToken = "invite-token-123";
        Calendar.Invite invite = new Calendar.Invite(inviteToken, LocalDateTime.now().plusDays(1));
        testCalendar.addInvite(invite);

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(calendarRepository.findByInvitesLink(inviteToken)).thenReturn(Optional.of(testCalendar));
        when(userService.saveUser(any(User.class))).thenReturn(testUser);

        // Act
        CalendarInviteAcceptResponseDTO result = calendarService.acceptInvite(inviteToken, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals("cal-123", result.getCalendarId());
        assertEquals("Test Calendar", result.getName());
        verify(userService, times(1)).saveUser(testUser);
    }

    @Test
    void testAcceptInvite_InvalidToken() {
        // Arrange
        String inviteToken = "invalid-token";

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(calendarRepository.findByInvitesLink(inviteToken)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            calendarService.acceptInvite(inviteToken, "testuser");
        });
        assertEquals("Invalid or expired invite token", exception.getMessage());
    }

    @Test
    void testAcceptInvite_ExpiredToken() {
        // Arrange
        String inviteToken = "expired-token";
        Calendar.Invite expiredInvite = new Calendar.Invite(inviteToken, LocalDateTime.now().minusDays(1)); // Expired
        testCalendar.addInvite(expiredInvite);

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(calendarRepository.findByInvitesLink(inviteToken)).thenReturn(Optional.of(testCalendar));

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            calendarService.acceptInvite(inviteToken, "testuser");
        });
        assertEquals("Invite has expired", exception.getMessage());
    }

    @Test
    void testAcceptInvite_AlreadyMember() {
        // Arrange
        String inviteToken = "invite-token-123";
        Calendar.Invite invite = new Calendar.Invite(inviteToken, LocalDateTime.now().plusDays(1));
        testCalendar.addInvite(invite);
        testUser.addCalendarMembership("cal-123", false); // Already a member

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(calendarRepository.findByInvitesLink(inviteToken)).thenReturn(Optional.of(testCalendar));

        // Act
        CalendarInviteAcceptResponseDTO result = calendarService.acceptInvite(inviteToken, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals("cal-123", result.getCalendarId());
        // User should not be added again
        verify(userService, never()).saveUser(any(User.class));
    }

    // ========== Filtering Methods Tests ==========

    @Test
    void testGetCalendarHomepage_RegularUser() {
        // Arrange
        testUser.addCalendarMembership("cal-123", true);
        testUser.addCalendarMembership("cal-456", false);

        Calendar calendar2 = new Calendar();
        calendar2.setId("cal-456");
        calendar2.setName("Second Calendar");

        com.example.calendario.model.Event event1 = new com.example.calendario.model.Event();
        event1.setId("event-1");
        event1.setCalendarId("cal-123");
        event1.setTags(List.of("work", "meeting"));

        com.example.calendario.model.Event event2 = new com.example.calendario.model.Event();
        event2.setId("event-2");
        event2.setCalendarId("cal-456");
        event2.setTags(List.of("personal", "meeting"));

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(calendarRepository.findById("cal-123")).thenReturn(Optional.of(testCalendar));
        when(calendarRepository.findById("cal-456")).thenReturn(Optional.of(calendar2));
        when(eventRepository.findByCalendarIdIn(List.of("cal-123", "cal-456")))
                .thenReturn(List.of(event1, event2));

        // Act
        com.example.calendario.dto.calendar.CalendarHomepageResponseDTO result = 
                calendarService.getCalendarHomepage("testuser");

        // Assert
        assertNotNull(result);
        assertEquals(2, result.getCalendars().size());
        assertEquals(3, result.getTags().size()); // work, meeting, personal
        assertTrue(result.getTags().contains("work"));
        assertTrue(result.getTags().contains("meeting"));
        assertTrue(result.getTags().contains("personal"));
    }

    @Test
    void testGetCalendarHomepage_Superuser() {
        // Arrange
        testUser.setIsSuperuser(true);

        Calendar calendar2 = new Calendar();
        calendar2.setId("cal-456");
        calendar2.setName("Second Calendar");

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(calendarRepository.findAll()).thenReturn(List.of(testCalendar, calendar2));
        when(eventRepository.findByCalendarIdIn(anyList())).thenReturn(new ArrayList<>());

        // Act
        com.example.calendario.dto.calendar.CalendarHomepageResponseDTO result = 
                calendarService.getCalendarHomepage("testuser");

        // Assert
        assertNotNull(result);
        assertEquals(2, result.getCalendars().size());
        verify(calendarRepository, times(1)).findAll();
    }

    @Test
    void testGetFilteredCalendarView_ByCalendarIds() {
        // Arrange
        testUser.addCalendarMembership("cal-123", true);

        com.example.calendario.model.Event event1 = new com.example.calendario.model.Event();
        event1.setId("event-1");
        event1.setCalendarId("cal-123");
        event1.setTitle("Event 1");

        User otherUser = new User("otheruser", "other@example.com", "pass");
        otherUser.setId("user-456");
        otherUser.addCalendarMembership("cal-123", false);

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(eventRepository.findByCalendarIdIn(List.of("cal-123"))).thenReturn(List.of(event1));
        when(userService.getAllUsers()).thenReturn(List.of(testUser, otherUser));

        // Act
        com.example.calendario.dto.calendar.CalendarFilterResponseDTO result = 
                calendarService.getFilteredCalendarView(List.of("cal-123"), null, null, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getEvents().size());
        assertNotNull(result.getUsers());
        assertEquals(2, result.getUsers().size()); // Both users are members
    }

    @Test
    void testGetFilteredCalendarView_Forbidden() {
        // Arrange
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            calendarService.getFilteredCalendarView(List.of("cal-999"), null, null, "testuser");
        });
        assertEquals("You do not have permission to view calendar: cal-999", exception.getMessage());
    }

    @Test
    void testGetFilteredCalendarView_ByEventIds() {
        // Arrange
        testUser.addCalendarMembership("cal-123", false);

        com.example.calendario.model.Event event1 = new com.example.calendario.model.Event();
        event1.setId("event-1");
        event1.setCalendarId("cal-123");
        event1.setTitle("Event 1");

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(eventRepository.findByIdIn(List.of("event-1"))).thenReturn(List.of(event1));

        // Act
        com.example.calendario.dto.calendar.CalendarFilterResponseDTO result = 
                calendarService.getFilteredCalendarView(null, List.of("event-1"), null, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getEvents().size());
        assertEquals("event-1", result.getEvents().get(0).getEventId());
    }

    @Test
    void testGetFilteredCalendarView_ByTags() {
        // Arrange
        testUser.addCalendarMembership("cal-123", false);

        com.example.calendario.model.Event event1 = new com.example.calendario.model.Event();
        event1.setId("event-1");
        event1.setCalendarId("cal-123");
        event1.setTitle("Event 1");
        event1.setTags(List.of("work", "meeting"));

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(eventRepository.findByTagsIn(List.of("work"))).thenReturn(List.of(event1));

        // Act
        com.example.calendario.dto.calendar.CalendarFilterResponseDTO result = 
                calendarService.getFilteredCalendarView(null, null, List.of("work"), "testuser");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getEvents().size());
        assertEquals("event-1", result.getEvents().get(0).getEventId());
    }

    @Test
    void testGetFilteredCalendarView_MultipleFilters_Deduplication() {
        // Arrange
        testUser.addCalendarMembership("cal-123", true);

        com.example.calendario.model.Event event1 = new com.example.calendario.model.Event();
        event1.setId("event-1");
        event1.setCalendarId("cal-123");
        event1.setTitle("Event 1");
        event1.setTags(List.of("work"));

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        // Event should appear from both calendar filter and tag filter
        when(eventRepository.findByCalendarIdIn(List.of("cal-123"))).thenReturn(List.of(event1));
        when(eventRepository.findByTagsIn(List.of("work"))).thenReturn(List.of(event1));
        when(userService.getAllUsers()).thenReturn(List.of(testUser));

        // Act
        com.example.calendario.dto.calendar.CalendarFilterResponseDTO result = 
                calendarService.getFilteredCalendarView(List.of("cal-123"), null, List.of("work"), "testuser");

        // Assert
        assertNotNull(result);
        // Event should only appear once despite matching both filters
        assertEquals(1, result.getEvents().size());
        assertEquals("event-1", result.getEvents().get(0).getEventId());
    }

    @Test
    void testGetFilteredCalendarView_NoAccessToEvent() {
        // Arrange
        com.example.calendario.model.Event event1 = new com.example.calendario.model.Event();
        event1.setId("event-1");
        event1.setCalendarId("cal-999"); // User is not a member

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(eventRepository.findByIdIn(List.of("event-1"))).thenReturn(List.of(event1));

        // Act
        com.example.calendario.dto.calendar.CalendarFilterResponseDTO result = 
                calendarService.getFilteredCalendarView(null, List.of("event-1"), null, "testuser");

        // Assert
        assertNotNull(result);
        // Event should be filtered out due to lack of access
        assertEquals(0, result.getEvents().size());
    }

    @Test
    void testGetEventsByCalendarIds_Success() {
        // Arrange
        testUser.addCalendarMembership("cal-123", true);

        com.example.calendario.model.Event event1 = new com.example.calendario.model.Event();
        event1.setId("event-1");
        event1.setCalendarId("cal-123");

        User member = new User("member", "member@example.com", "pass");
        member.setId("user-456");
        member.addCalendarMembership("cal-123", false);

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(eventRepository.findByCalendarIdIn(List.of("cal-123"))).thenReturn(List.of(event1));
        when(userService.getAllUsers()).thenReturn(List.of(testUser, member));

        // Act
        com.example.calendario.dto.calendar.CalendarFilterResponseDTO result = 
                calendarService.getEventsByCalendarIds(List.of("cal-123"), "testuser");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getEvents().size());
        assertNotNull(result.getUsers());
        assertEquals(2, result.getUsers().size());
    }

    @Test
    void testGetEventsByIds_Success() {
        // Arrange
        testUser.addCalendarMembership("cal-123", false);

        com.example.calendario.model.Event event1 = new com.example.calendario.model.Event();
        event1.setId("event-1");
        event1.setCalendarId("cal-123");

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(eventRepository.findById("event-1")).thenReturn(Optional.of(event1));

        // Act
        com.example.calendario.dto.calendar.EventFilterResponseDTO result = 
                calendarService.getEventsByIds(List.of("event-1"), "testuser");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getEvents().size());
    }

    @Test
    void testGetEventsByIds_Forbidden() {
        // Arrange
        com.example.calendario.model.Event event1 = new com.example.calendario.model.Event();
        event1.setId("event-1");
        event1.setCalendarId("cal-999"); // User not a member

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(eventRepository.findById("event-1")).thenReturn(Optional.of(event1));

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            calendarService.getEventsByIds(List.of("event-1"), "testuser");
        });
        assertEquals("You do not have permission to view event: event-1", exception.getMessage());
    }

    @Test
    void testGetEventsByTags_Success() {
        // Arrange
        testUser.addCalendarMembership("cal-123", false);

        com.example.calendario.model.Event event1 = new com.example.calendario.model.Event();
        event1.setId("event-1");
        event1.setCalendarId("cal-123");
        event1.setTags(List.of("work", "important"));

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(eventRepository.findByTagsIn(List.of("work"))).thenReturn(List.of(event1));

        // Act
        com.example.calendario.dto.calendar.EventFilterResponseDTO result = 
                calendarService.getEventsByTags(List.of("work"), "testuser");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getEvents().size());
        assertEquals("event-1", result.getEvents().get(0).getEventId());
    }

    @Test
    void testGetEventsByTags_FiltersByAccess() {
        // Arrange
        com.example.calendario.model.Event event1 = new com.example.calendario.model.Event();
        event1.setId("event-1");
        event1.setCalendarId("cal-999"); // User not a member
        event1.setTags(List.of("work"));

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(eventRepository.findByTagsIn(List.of("work"))).thenReturn(List.of(event1));

        // Act
        com.example.calendario.dto.calendar.EventFilterResponseDTO result = 
                calendarService.getEventsByTags(List.of("work"), "testuser");

        // Assert
        assertNotNull(result);
        // Event should be filtered out due to lack of access
        assertEquals(0, result.getEvents().size());
    }
}
