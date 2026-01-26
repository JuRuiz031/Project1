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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.calendario.dto.poll.PollCreateRequestDTO;
import com.example.calendario.dto.poll.PollDeleteRequestDTO;
import com.example.calendario.dto.poll.PollDeleteResponseDTO;
import com.example.calendario.dto.poll.PollOptionDTO;
import com.example.calendario.dto.poll.PollResponseDTO;
import com.example.calendario.dto.poll.PollUpdateRequestDTO;
import com.example.calendario.dto.poll.PollVoteRequestDTO;
import com.example.calendario.exception.AlreadyVotedException;
import com.example.calendario.exception.ForbiddenException;
import com.example.calendario.exception.InvalidRequestException;
import com.example.calendario.exception.ResourceNotFoundException;
import com.example.calendario.model.Calendar;
import com.example.calendario.model.Poll;
import com.example.calendario.model.User;
import com.example.calendario.repository.PollRepository;

@ExtendWith(MockitoExtension.class)
class PollServiceTest {

    @Mock
    private PollRepository pollRepository;

    @Mock
    private CalendarService calendarService;

    @Mock
    private UserService userService;

    @InjectMocks
    private PollService pollService;

    private User testUser;
    private User otherUser;
    private Calendar testCalendar;
    private Poll testPoll;
    private PollCreateRequestDTO createRequestDTO;
    private PollOptionDTO optionDTO;

    @BeforeEach
    public void setUp() {
        testUser = new User("testuser", "test@example.com", "password");
        testUser.setId("user-123");
        testUser.addCalendarMembership("cal-123", true);

        otherUser = new User("otheruser", "other@example.com", "password");
        otherUser.setId("user-456");

        testCalendar = new Calendar();
        testCalendar.setId("cal-123");
        testCalendar.setName("Test Calendar");

        testPoll = new Poll();
        testPoll.setId("poll-123");
        testPoll.setCalendarId("cal-123");
        testPoll.setTitle("Test Poll");
        testPoll.setDescription("Test Description");
        testPoll.setStartTime(LocalDateTime.now());
        testPoll.setEndTime(LocalDateTime.now().plusDays(7));
        testPoll.setResultsVisible(true);
        testPoll.setAllowMultipleVotes(false);
        testPoll.addOption("Option 1");
        testPoll.addOption("Option 2");

        optionDTO = new PollOptionDTO();
        optionDTO.setDescription("New Option");

        createRequestDTO = new PollCreateRequestDTO();
        createRequestDTO.setUserId("user-123");
        createRequestDTO.setCalendarId("cal-123");
        createRequestDTO.setTitle("New Poll");
        createRequestDTO.setDescription("Poll Description");
        createRequestDTO.setStartTime(LocalDateTime.now());
        createRequestDTO.setEndTime(LocalDateTime.now().plusDays(7));
        createRequestDTO.setResultsVisible(true);
        createRequestDTO.setAllowMultipleVotes(false);
        createRequestDTO.setOptions(List.of(optionDTO));
    }

    // ========== CREATE POLL TESTS ==========

    @Test
    void testCreatePoll_Success() {
        // Arrange
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(calendarService.getCalendarById("cal-123")).thenReturn(testCalendar);
        when(pollRepository.save(any(Poll.class))).thenAnswer(invocation -> {
            Poll poll = invocation.getArgument(0);
            poll.setId("new-poll-123");
            return poll;
        });

        // Act
        PollResponseDTO result = pollService.createPoll(createRequestDTO, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals("new-poll-123", result.getPollId());
        assertEquals("New Poll", result.getTitle());
        assertEquals("cal-123", result.getCalendarId());
        verify(pollRepository, times(1)).save(any(Poll.class));
    }

    @Test
    void testCreatePoll_UserNotFound() {
        // Arrange
        when(userService.findByUsername("unknownuser")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            pollService.createPoll(createRequestDTO, "unknownuser");
        });
        assertEquals("Authenticated user not found", exception.getMessage());
        verify(pollRepository, never()).save(any(Poll.class));
    }

    @Test
    void testCreatePoll_UserIdMismatch() {
        // Arrange
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        createRequestDTO.setUserId("different-user-id");

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            pollService.createPoll(createRequestDTO, "testuser");
        });
        assertEquals("You do not have permission to create a poll for another user", exception.getMessage());
        verify(pollRepository, never()).save(any(Poll.class));
    }

    @Test
    void testCreatePoll_NotAdminOfCalendar() {
        // Arrange
        User nonAdminUser = new User("nonadmin", "nonadmin@example.com", "password");
        nonAdminUser.setId("user-789");
        nonAdminUser.addCalendarMembership("cal-123", false);

        createRequestDTO.setUserId("user-789");

        when(userService.findByUsername("nonadmin")).thenReturn(Optional.of(nonAdminUser));
        when(calendarService.getCalendarById("cal-123")).thenReturn(testCalendar);

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            pollService.createPoll(createRequestDTO, "nonadmin");
        });
        assertEquals("You do not have permission to create polls in this calendar", exception.getMessage());
        verify(pollRepository, never()).save(any(Poll.class));
    }

    @Test
    void testCreatePoll_InvalidTimeRange() {
        // Arrange
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        
        createRequestDTO.setStartTime(LocalDateTime.now().plusDays(7));
        createRequestDTO.setEndTime(LocalDateTime.now());

        // Act & Assert
        InvalidRequestException exception = assertThrows(InvalidRequestException.class, () -> {
            pollService.createPoll(createRequestDTO, "testuser");
        });
        assertEquals("Poll start time must be before end time", exception.getMessage());
        verify(pollRepository, never()).save(any(Poll.class));
    }

    // ========== UPDATE POLL TESTS ==========

    @Test
    void testUpdatePoll_Success() {
        // Arrange
        PollUpdateRequestDTO updateDTO = new PollUpdateRequestDTO();
        updateDTO.setUserId("user-123");
        updateDTO.setCalendarId("cal-123");
        updateDTO.setTitle("Updated Poll Title");
        updateDTO.setDescription("Updated Description");
        updateDTO.setStartTime(LocalDateTime.now());
        updateDTO.setEndTime(LocalDateTime.now().plusDays(14));
        updateDTO.setResultsVisible(false);
        updateDTO.setAllowMultipleVotes(true);
        updateDTO.setOptions(List.of(optionDTO));

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(calendarService.getCalendarById("cal-123")).thenReturn(testCalendar);
        when(pollRepository.findById("poll-123")).thenReturn(Optional.of(testPoll));
        when(pollRepository.save(any(Poll.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        PollResponseDTO result = pollService.updatePoll("poll-123", updateDTO, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals("Updated Poll Title", result.getTitle());
        assertEquals("Updated Description", result.getDescription());
        verify(pollRepository, times(1)).save(any(Poll.class));
    }

    @Test
    void testUpdatePoll_PollNotFound() {
        // Arrange
        PollUpdateRequestDTO updateDTO = new PollUpdateRequestDTO();
        updateDTO.setUserId("user-123");
        updateDTO.setCalendarId("cal-123");

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(calendarService.getCalendarById("cal-123")).thenReturn(testCalendar);
        when(pollRepository.findById("invalid-poll")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            pollService.updatePoll("invalid-poll", updateDTO, "testuser");
        });
        assertEquals("Poll not found", exception.getMessage());
        verify(pollRepository, never()).save(any(Poll.class));
    }

    @Test
    void testUpdatePoll_UserIdMismatch() {
        // Arrange
        PollUpdateRequestDTO updateDTO = new PollUpdateRequestDTO();
        updateDTO.setUserId("different-user-id");
        updateDTO.setCalendarId("cal-123");

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            pollService.updatePoll("poll-123", updateDTO, "testuser");
        });
        assertEquals("You do not have permission to edit this poll", exception.getMessage());
        verify(pollRepository, never()).save(any(Poll.class));
    }

    // ========== DELETE POLL TESTS ==========

    @Test
    void testDeletePoll_Success() {
        // Arrange
        PollDeleteRequestDTO deleteDTO = new PollDeleteRequestDTO("user-123", "cal-123");

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(pollRepository.findById("poll-123")).thenReturn(Optional.of(testPoll));

        // Act
        PollDeleteResponseDTO result = pollService.deletePoll("poll-123", deleteDTO, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals("poll-123", result.getPollId());
        assertTrue(result.getDeleted());
        verify(pollRepository, times(1)).delete(testPoll);
    }

    @Test
    void testDeletePoll_PollNotFound() {
        // Arrange
        PollDeleteRequestDTO deleteDTO = new PollDeleteRequestDTO("user-123", "cal-123");

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(pollRepository.findById("invalid-poll")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            pollService.deletePoll("invalid-poll", deleteDTO, "testuser");
        });
        assertEquals("Poll not found", exception.getMessage());
        verify(pollRepository, never()).delete(any(Poll.class));
    }

    @Test
    void testDeletePoll_UserIdMismatch() {
        // Arrange
        PollDeleteRequestDTO deleteDTO = new PollDeleteRequestDTO("different-user-id", "cal-123");

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            pollService.deletePoll("poll-123", deleteDTO, "testuser");
        });
        assertEquals("You do not have permission to delete this poll", exception.getMessage());
        verify(pollRepository, never()).delete(any(Poll.class));
    }

    @Test
    void testDeletePoll_NotAdminOfCalendar() {
        // Arrange
        User nonAdminUser = new User("nonadmin", "nonadmin@example.com", "password");
        nonAdminUser.setId("user-789");
        nonAdminUser.addCalendarMembership("cal-123", false);

        PollDeleteRequestDTO deleteDTO = new PollDeleteRequestDTO("user-789", "cal-123");

        when(userService.findByUsername("nonadmin")).thenReturn(Optional.of(nonAdminUser));
        when(pollRepository.findById("poll-123")).thenReturn(Optional.of(testPoll));

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            pollService.deletePoll("poll-123", deleteDTO, "nonadmin");
        });
        assertEquals("You do not have permission to delete this poll", exception.getMessage());
        verify(pollRepository, never()).delete(any(Poll.class));
    }

    // ========== VOTE ON POLL TESTS ==========

    @Test
    void testVoteOnPoll_Success() {
        // Arrange
        PollVoteRequestDTO voteDTO = new PollVoteRequestDTO("user-123", "cal-123", List.of(0));

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(pollRepository.findById("poll-123")).thenReturn(Optional.of(testPoll));
        when(pollRepository.save(any(Poll.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        PollResponseDTO result = pollService.voteOnPoll("poll-123", voteDTO, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals("poll-123", result.getPollId());
        verify(pollRepository, times(1)).save(any(Poll.class));
    }

    @Test
    void testVoteOnPoll_UserIdMismatch() {
        // Arrange
        PollVoteRequestDTO voteDTO = new PollVoteRequestDTO("different-user-id", "cal-123", List.of(0));

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            pollService.voteOnPoll("poll-123", voteDTO, "testuser");
        });
        assertEquals("You do not have permission to vote on this poll", exception.getMessage());
        verify(pollRepository, never()).save(any(Poll.class));
    }

    @Test
    void testVoteOnPoll_NotMemberOfCalendar() {
        // Arrange
        User nonMemberUser = new User("nonmember", "nonmember@example.com", "password");
        nonMemberUser.setId("user-999");

        PollVoteRequestDTO voteDTO = new PollVoteRequestDTO("user-999", "cal-123", List.of(0));

        when(userService.findByUsername("nonmember")).thenReturn(Optional.of(nonMemberUser));

        // Act & Assert
        ForbiddenException exception = assertThrows(ForbiddenException.class, () -> {
            pollService.voteOnPoll("poll-123", voteDTO, "nonmember");
        });
        assertEquals("You do not have permission to vote in this calendar", exception.getMessage());
        verify(pollRepository, never()).save(any(Poll.class));
    }

    @Test
    void testVoteOnPoll_PollNotFound() {
        // Arrange
        PollVoteRequestDTO voteDTO = new PollVoteRequestDTO("user-123", "cal-123", List.of(0));

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(pollRepository.findById("invalid-poll")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            pollService.voteOnPoll("invalid-poll", voteDTO, "testuser");
        });
        assertEquals("Poll not found", exception.getMessage());
        verify(pollRepository, never()).save(any(Poll.class));
    }

    @Test
    void testVoteOnPoll_EmptyOptions() {
        // Arrange
        PollVoteRequestDTO voteDTO = new PollVoteRequestDTO("user-123", "cal-123", new ArrayList<>());

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(pollRepository.findById("poll-123")).thenReturn(Optional.of(testPoll));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            pollService.voteOnPoll("poll-123", voteDTO, "testuser");
        });
        assertEquals("At least one poll option must be selected", exception.getMessage());
        verify(pollRepository, never()).save(any(Poll.class));
    }

    @Test
    void testVoteOnPoll_MultipleVotesNotAllowed() {
        // Arrange
        testPoll.setAllowMultipleVotes(false);
        PollVoteRequestDTO voteDTO = new PollVoteRequestDTO("user-123", "cal-123", List.of(0, 1));

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(pollRepository.findById("poll-123")).thenReturn(Optional.of(testPoll));

        // Act & Assert
        InvalidRequestException exception = assertThrows(InvalidRequestException.class, () -> {
            pollService.voteOnPoll("poll-123", voteDTO, "testuser");
        });
        assertEquals("Multiple votes are not allowed in this poll", exception.getMessage());
        verify(pollRepository, never()).save(any(Poll.class));
    }

    @Test
    void testVoteOnPoll_AlreadyVoted() {
        // Arrange
        testPoll.getOptionsMap().get(0).getUserVotes().add("user-123");
        PollVoteRequestDTO voteDTO = new PollVoteRequestDTO("user-123", "cal-123", List.of(1));

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(pollRepository.findById("poll-123")).thenReturn(Optional.of(testPoll));

        // Act & Assert
        AlreadyVotedException exception = assertThrows(AlreadyVotedException.class, () -> {
            pollService.voteOnPoll("poll-123", voteDTO, "testuser");
        });
        assertEquals("User has already voted in this poll", exception.getMessage());
        verify(pollRepository, never()).save(any(Poll.class));
    }

    @Test
    void testVoteOnPoll_InvalidOptionId() {
        // Arrange
        PollVoteRequestDTO voteDTO = new PollVoteRequestDTO("user-123", "cal-123", List.of(999));

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(pollRepository.findById("poll-123")).thenReturn(Optional.of(testPoll));

        // Act & Assert
        InvalidRequestException exception = assertThrows(InvalidRequestException.class, () -> {
            pollService.voteOnPoll("poll-123", voteDTO, "testuser");
        });
        assertEquals("Invalid poll option selected: 999", exception.getMessage());
        verify(pollRepository, never()).save(any(Poll.class));
    }

    @Test
    void testVoteOnPoll_MultipleVotesAllowed_Success() {
        // Arrange
        testPoll.setAllowMultipleVotes(true);
        PollVoteRequestDTO voteDTO = new PollVoteRequestDTO("user-123", "cal-123", List.of(0, 1));

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(pollRepository.findById("poll-123")).thenReturn(Optional.of(testPoll));
        when(pollRepository.save(any(Poll.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        PollResponseDTO result = pollService.voteOnPoll("poll-123", voteDTO, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals("poll-123", result.getPollId());
        verify(pollRepository, times(1)).save(any(Poll.class));
    }
}
