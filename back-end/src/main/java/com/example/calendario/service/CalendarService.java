package com.example.calendario.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.calendario.dto.calendar.CalendarCreateRequestDTO;
import com.example.calendario.dto.calendar.CalendarDeleteResponseDTO;
import com.example.calendario.dto.calendar.CalendarFilterResponseDTO;
import com.example.calendario.dto.calendar.CalendarInviteAcceptResponseDTO;
import com.example.calendario.dto.calendar.CalendarInviteResponseDTO;
import com.example.calendario.dto.calendar.CalendarResponseDTO;
import com.example.calendario.dto.calendar.CalendarUpdateRequestDTO;
import com.example.calendario.dto.calendar.CalendarUpdateResponseDTO;
import com.example.calendario.dto.event.EventResponseDTO;
import com.example.calendario.dto.poll.PollOptionDTO;
import com.example.calendario.dto.poll.PollResponseDTO;
import com.example.calendario.exception.ForbiddenException;
import com.example.calendario.exception.ResourceNotFoundException;
import com.example.calendario.model.Calendar;
import com.example.calendario.model.Event;
import com.example.calendario.model.Poll;
import com.example.calendario.model.User;
import com.example.calendario.repository.CalendarRepository;
import com.example.calendario.repository.PollRepository;

@Service
public class CalendarService {
    private final CalendarRepository calendarRepository;
    private final UserService userService;
    private final com.example.calendario.repository.EventRepository eventRepository;
    private final PollRepository pollRepository;
    
    @Value("${app.calendar.invite.base-url}")
    private String inviteBaseUrl;

    // Constructor
    public CalendarService(CalendarRepository calendarRepository, UserService userService, 
                          com.example.calendario.repository.EventRepository eventRepository, PollRepository pollRepository) {
        this.calendarRepository = calendarRepository;
        this.userService = userService;
        this.eventRepository = eventRepository;
        this.pollRepository = pollRepository;
    }

    // Create a new calendar
    public CalendarResponseDTO createCalendar(CalendarCreateRequestDTO dto, String authenticatedUsername) {
        // Validate authenticated user exists
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        // Create new Calendar
        Calendar calendar = new Calendar();
        calendar.setName(dto.getName());

        //no duplicate calendar name - batch fetch calendars for performance
        List<String> userCalendarIds = userService.getCalendarIdsForUser(authenticatedUser.getId(), authenticatedUsername);
        List<Calendar> userCalendars = calendarRepository.findAllById(userCalendarIds);
        if (userCalendars.stream().anyMatch(cal -> cal.getName().equals(dto.getName()))) {
            throw new ForbiddenException("You already have a calendar with the name: " + dto.getName());
        }

        // Save calendar
        Calendar savedCalendar = calendarRepository.save(calendar);

        // Add calendar to user's calendar_ids with admin status
        authenticatedUser.addCalendarMembership(savedCalendar.getId(), true);
        userService.saveUser(authenticatedUser);

        return new CalendarResponseDTO(savedCalendar.getId(), savedCalendar.getName());
    }

    // Get calendar by ID
    public Calendar getCalendarById(String calendarId) {
        return calendarRepository.findById(calendarId)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar not found"));
    }

    // Update calendar (name and/or admins)
    public CalendarUpdateResponseDTO updateCalendar(String calendarId, CalendarUpdateRequestDTO dto, String authenticatedUsername) {
        // Get authenticated user
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        // Get calendar
        Calendar calendar = getCalendarById(calendarId);

        // Check if authenticated user is admin of this calendar
        if (!isUserAdminOfCalendar(authenticatedUser, calendarId)) {
            throw new ForbiddenException("You do not have permission to update this calendar");
        }

        // Update name if provided
        if (dto.getName() != null && !dto.getName().isBlank()) {
            calendar.setName(dto.getName());
        }

        // Save updated calendar
        Calendar updatedCalendar = calendarRepository.save(calendar);

        // Promote users to admin if specified
        java.util.List<String> promotedAdmins = new java.util.ArrayList<>();
        java.util.List<User> usersToUpdate = new java.util.ArrayList<>();
        
        if (dto.getAdmins() != null && !dto.getAdmins().isEmpty()) {
            for (String userId : dto.getAdmins()) {
                Optional<User> userOpt = userService.findById(userId);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    if (user.isMemberOfCalendar(calendarId)) {
                        // Find and update their membership to admin
                        user.getCalendarIds().stream()
                            .filter(cm -> cm.getCalendarId().equals(calendarId))
                            .findFirst()
                            .ifPresent(cm -> cm.setIsAdmin(true));
                        usersToUpdate.add(user);
                        promotedAdmins.add(userId);
                    }
                }
            }
            
            // Batch save all updated users at once (more efficient)
            if (!usersToUpdate.isEmpty()) {
                userService.saveAllUsers(usersToUpdate);
            }
        }

        return new CalendarUpdateResponseDTO(
                updatedCalendar.getId(),
                updatedCalendar.getName(),
                promotedAdmins
        );
    }

    // Delete calendar
    public CalendarDeleteResponseDTO deleteCalendar(String calendarId, String authenticatedUsername) {
        // Get authenticated user
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        // Validate calendar exists (throws ResourceNotFoundException if not found)
        getCalendarById(calendarId);

        // Check if authenticated user is admin of this calendar
        if (!isUserAdminOfCalendar(authenticatedUser, calendarId)) {
            throw new ForbiddenException("You do not have permission to delete this calendar");
        }

        // Cascade delete: Remove calendar from members' calendarIds - optimized query
        java.util.List<User> calendarMembers = userService.getUsersByCalendarMembership(calendarId);
        for (User user : calendarMembers) {
            user.removeCalendarMembership(calendarId);
        }
        
        // Batch save all users at once (more efficient)
        if (!calendarMembers.isEmpty()) {
            userService.saveAllUsers(calendarMembers);
        }

        // Delete calendar
        calendarRepository.deleteById(calendarId);

        return new CalendarDeleteResponseDTO(calendarId, true);
    }

    // Generate invite link
    public CalendarInviteResponseDTO generateInviteLink(String calendarId, String authenticatedUsername) {
        // Get authenticated user
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        // Get calendar
        Calendar calendar = getCalendarById(calendarId);

        // Check if authenticated user is admin of this calendar
        if (!isUserAdminOfCalendar(authenticatedUser, calendarId)) {
            throw new ForbiddenException("You do not have permission to generate invites for this calendar");
        }

        // Generate unique invite link
        String inviteToken = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7); // Link expires in 7 days

        // Create invite
        Calendar.Invite invite = new Calendar.Invite(inviteToken, expiresAt);
        calendar.addInvite(invite);

        // Save updated calendar
        Calendar updatedCalendar = calendarRepository.save(calendar);

        // Build full invite link using configured base URL
        String inviteLink = inviteBaseUrl + "/" + calendarId + "/" + inviteToken;

        return new CalendarInviteResponseDTO(updatedCalendar.getId(), inviteLink);
    }

    // Accept invite
    public CalendarInviteAcceptResponseDTO acceptInvite(String inviteToken, String authenticatedUsername) {
        // Get authenticated user
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        // Find calendar by invite link
        Calendar calendar = calendarRepository.findByInvitesLink(inviteToken)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired invite token"));

        // Check if invite has expired
        Optional<Calendar.Invite> invite = calendar.getInvites().stream()
                .filter(inv -> inv.getLink().equals(inviteToken))
                .findFirst();

        if (invite.isEmpty()) {
            throw new ResourceNotFoundException("Invite not found");
        }

        if (LocalDateTime.now().isAfter(invite.get().getExpiresAt())) {
            throw new ResourceNotFoundException("Invite has expired");
        }

        // Add user to calendar if not already member
        if (!isUserMemberOfCalendar(authenticatedUser, calendar.getId())) {
            authenticatedUser.addCalendarMembership(calendar.getId(), false); // Add as non-admin
            userService.saveUser(authenticatedUser);
        }

        return new CalendarInviteAcceptResponseDTO(calendar.getId(), calendar.getName());
    }

    // Helper: Check if user is admin of calendar (superusers bypass)
    private boolean isUserAdminOfCalendar(User user, String calendarId) {
        return user.isSuperuser() || user.isAdminOfCalendar(calendarId);
    }

    // Helper: Check if user is member of calendar (superusers bypass)
    private boolean isUserMemberOfCalendar(User user, String calendarId) {
        return user.isSuperuser() || user.isMemberOfCalendar(calendarId);
    }

    // Get calendar homepage data (calendars + tags)
    public com.example.calendario.dto.calendar.CalendarHomepageResponseDTO getCalendarHomepage(String authenticatedUsername) {
        // Get authenticated user
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new com.example.calendario.exception.ResourceNotFoundException("Authenticated user not found"));

        // Get all calendars the user is a member of (or all if superuser)
        java.util.List<com.example.calendario.dto.calendar.CalendarHomepageResponseDTO.CalendarInfo> calendarInfos = new java.util.ArrayList<>();
        java.util.Set<String> allTags = new java.util.HashSet<>();

        if (authenticatedUser.isSuperuser()) {
            // Superuser can see ALL calendars
            for (Calendar calendar : calendarRepository.findAll()) {
                calendarInfos.add(new com.example.calendario.dto.calendar.CalendarHomepageResponseDTO.CalendarInfo(
                        calendar.getId(),
                        calendar.getName()
                ));
            }
            // Get all events to collect tags
            for (com.example.calendario.model.Event event : eventRepository.findByCalendarIdIn(
                    calendarInfos.stream().map(com.example.calendario.dto.calendar.CalendarHomepageResponseDTO.CalendarInfo::getCalendarId).collect(java.util.stream.Collectors.toList()))) {
                if (event.getTags() != null) {
                    allTags.addAll(event.getTags());
                }
            }
        } else {
            // Regular user - only see their calendars
            for (User.CalendarMembership membership : authenticatedUser.getCalendarIds()) {
                Calendar calendar = getCalendarById(membership.getCalendarId());
                calendarInfos.add(new com.example.calendario.dto.calendar.CalendarHomepageResponseDTO.CalendarInfo(
                        calendar.getId(),
                        calendar.getName()
                ));
            }
            // Get events from user's calendars to collect tags
            java.util.List<String> userCalendarIds = authenticatedUser.getCalendarIds().stream()
                    .map(User.CalendarMembership::getCalendarId)
                    .collect(java.util.stream.Collectors.toList());
            for (com.example.calendario.model.Event event : eventRepository.findByCalendarIdIn(userCalendarIds)) {
                if (event.getTags() != null) {
                    allTags.addAll(event.getTags());
                }
            }
        }

        return new com.example.calendario.dto.calendar.CalendarHomepageResponseDTO(
                calendarInfos,
                new java.util.ArrayList<>(allTags)
        );
    }

    // Get events and users by calendar IDs
    public List<EventResponseDTO> getEventsByCalendarIds(
            java.util.List<String> calendarIds, String authenticatedUsername) {
        // Get authenticated user
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        // Verify user has access to requested calendars (or is superuser)
        java.util.List<String> accessibleCalendarIds = new java.util.ArrayList<>();
        for (String calendarId : calendarIds) {
            if (authenticatedUser.isSuperuser() || authenticatedUser.isMemberOfCalendar(calendarId)) {
                accessibleCalendarIds.add(calendarId);
            } else {
                throw new ForbiddenException("You do not have permission to view calendar: " + calendarId);
            }
        }

        // Get events for accessible calendars
        java.util.List<com.example.calendario.model.Event> events = eventRepository.findByCalendarIdIn(accessibleCalendarIds);
        java.util.List<com.example.calendario.dto.event.EventResponseDTO> eventDTOs = events.stream()
                .map(event -> new com.example.calendario.dto.event.EventResponseDTO(
                        event.getId(),
                        event.getCalendarId(),
                        event.getTitle(),
                        event.getStartTime(),
                        event.getEndTime(),
                        event.getDescription(),
                        event.getNotes(),
                        event.getTags()
                ))
                .collect(java.util.stream.Collectors.toList());

        return eventDTOs;
    }

    // Get events by event IDs
    public com.example.calendario.dto.calendar.EventFilterResponseDTO getEventsByIds(
            java.util.List<String> eventIds, String authenticatedUsername) {
        // Get authenticated user
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        // Get events and verify permissions
        java.util.List<com.example.calendario.dto.event.EventResponseDTO> eventDTOs = new java.util.ArrayList<>();
        for (String eventId : eventIds) {
            com.example.calendario.model.Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));

            // Check if user has access (member of calendar or superuser)
            if (authenticatedUser.isSuperuser() || authenticatedUser.isMemberOfCalendar(event.getCalendarId())) {
                eventDTOs.add(new com.example.calendario.dto.event.EventResponseDTO(
                        event.getId(),
                        event.getCalendarId(),
                        event.getTitle(),
                        event.getStartTime(),
                        event.getEndTime(),
                        event.getDescription(),
                        event.getNotes(),
                        event.getTags()
                ));
            } else {
                throw new ForbiddenException("You do not have permission to view event: " + eventId);
            }
        }

        return new com.example.calendario.dto.calendar.EventFilterResponseDTO(eventDTOs);
    }

    // Get events by tags (returns events that match at least one tag)
    public com.example.calendario.dto.calendar.EventFilterResponseDTO getEventsByTags(
            java.util.List<String> tags, String authenticatedUsername) {
        // Get authenticated user
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        // Get all events with matching tags
        java.util.List<com.example.calendario.model.Event> allEventsWithTags = eventRepository.findByTagsIn(tags);

        // Filter events user has access to
        java.util.List<com.example.calendario.dto.event.EventResponseDTO> eventDTOs = new java.util.ArrayList<>();
        for (com.example.calendario.model.Event event : allEventsWithTags) {
            // Check if user has access (member of calendar or superuser)
            if (authenticatedUser.isSuperuser() || authenticatedUser.isMemberOfCalendar(event.getCalendarId())) {
                eventDTOs.add(new com.example.calendario.dto.event.EventResponseDTO(
                        event.getId(),
                        event.getCalendarId(),
                        event.getTitle(),
                        event.getStartTime(),
                        event.getEndTime(),
                        event.getDescription(),
                        event.getNotes(),
                        event.getTags()
                ));
            }
        }

        return new com.example.calendario.dto.calendar.EventFilterResponseDTO(eventDTOs);
    }

    public com.example.calendario.dto.calendar.CalendarFilterResponseDTO getFilteredCalendarView(
            java.util.List<String> calendarIds,
            java.util.List<String> eventIds,
            java.util.List<String> pollIds,
            java.util.List<String> tags,
            String authenticatedUsername) {
        // Get authenticated user
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        // Validate access for provided calendarIds and collect accessibleCalendarIds
        java.util.List<String> accessibleCalendarIds = new java.util.ArrayList<>();
        if (calendarIds != null && !calendarIds.isEmpty()) {
            for (String calendarId : calendarIds) {
                if (authenticatedUser.isSuperuser() || authenticatedUser.isMemberOfCalendar(calendarId)) {
                    accessibleCalendarIds.add(calendarId);
                } else {
                    throw new ForbiddenException("You do not have permission to view calendar: " + calendarId);
                }
            }
        }

        // Collect events from any of the provided criteria
        List<Event> filteredEvents = new java.util.ArrayList<>();
        List<Poll> filteredPolls = new java.util.ArrayList<>();
        if (!accessibleCalendarIds.isEmpty()) {
            filteredEvents.addAll(eventRepository.findByCalendarIdIn(accessibleCalendarIds));
            filteredPolls.addAll(pollRepository.findByCalendarIdIn(accessibleCalendarIds));
        }
        if (eventIds != null && !eventIds.isEmpty()) {
            filteredEvents.addAll(eventRepository.findByIdIn(eventIds));
        }
        if (pollIds != null && !pollIds.isEmpty()) {
            filteredPolls.addAll(pollRepository.findByIdIn(pollIds));
        }
        if (tags != null && !tags.isEmpty()) {
            filteredEvents.addAll(eventRepository.findByTagsIn(tags));
            filteredPolls.addAll(pollRepository.findByTagsIn(tags));
        }

        // Deduplicate events, polls by id while preserving insertion order
        java.util.Map<String, com.example.calendario.model.Event> eventMap = new java.util.LinkedHashMap<>();
        for (com.example.calendario.model.Event event : filteredEvents) {
            if (event != null && event.getId() != null) {
                eventMap.putIfAbsent(event.getId(), event);
            }
        }
        java.util.Map<String, com.example.calendario.model.Poll> pollMap = new java.util.LinkedHashMap<>();
        for (com.example.calendario.model.Poll poll : filteredPolls) {
            if (poll != null && poll.getId() != null) {
                pollMap.putIfAbsent(poll.getId(), poll);
            }
        }

        // Filter events and polls the authenticated user has access to and map to DTOs
        List<EventResponseDTO> eventDTOs = eventMap.values().stream()
                .filter(event -> authenticatedUser.isSuperuser() || authenticatedUser.isMemberOfCalendar(event.getCalendarId()))
                .map(event -> new EventResponseDTO(
                        event.getId(),
                        event.getCalendarId(),
                        event.getTitle(),
                        event.getStartTime(),
                        event.getEndTime(),
                        event.getDescription(),
                        event.getNotes(),
                        event.getTags()
                ))
                .collect(java.util.stream.Collectors.toList());
        List<PollResponseDTO> pollDTOs = pollMap.values().stream()
                .filter(poll -> authenticatedUser.isSuperuser() || authenticatedUser.isMemberOfCalendar(poll.getCalendarId()))
                .map(poll -> new PollResponseDTO(
                        poll.getId(),
                        poll.getCalendarId(),
                        poll.getTitle(),
                        poll.getDescription(),
                        poll.getNotes(),
                        poll.getStartTime(),
                        poll.getEndTime(),
                        poll.isResultsVisible(),
                        poll.isAllowMultipleVotes(),
                        poll.getOptions().stream()
                                .map(option -> new PollOptionDTO(
                                        option.getOptionId(),
                                        option.getDescription(),
                                        option.getUserVotes(),
                                        option.getGuestVotes()
                                ))
                                .collect(java.util.stream.Collectors.toList()),
                        poll.getTags()
                ))
                .collect(java.util.stream.Collectors.toList());

        // Build users list only for the supplied calendarIds where the authenticated user is admin (or superuser)
        List<com.example.calendario.dto.calendar.CalendarFilterResponseDTO.CalendarUserInfo> users = new java.util.ArrayList<>();
        if (calendarIds != null && !calendarIds.isEmpty()) {
            for (String calendarId : calendarIds) {
                if (authenticatedUser.isSuperuser() || authenticatedUser.isAdminOfCalendar(calendarId)) {
                    for (User user : userService.getUsersByCalendarMembership(calendarId)) {
                        users.add(new com.example.calendario.dto.calendar.CalendarFilterResponseDTO.CalendarUserInfo(
                                calendarId,
                                user.getId(),
                                user.getUsername()
                        ));
                    }
                }
            }
        }

        return new CalendarFilterResponseDTO(eventDTOs, pollDTOs, users.isEmpty() ? null : users);
    }
}
