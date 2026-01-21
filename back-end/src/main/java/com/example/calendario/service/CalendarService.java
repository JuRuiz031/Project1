package com.example.calendario.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.calendario.dto.calendar.CalendarCreateRequestDTO;
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

@Service
public class CalendarService {
    private final CalendarRepository calendarRepository;
    private final UserService userService;

    // Constructor
    public CalendarService(CalendarRepository calendarRepository, UserService userService) {
        this.calendarRepository = calendarRepository;
        this.userService = userService;
    }

    // Create a new calendar
    public CalendarResponseDTO createCalendar(CalendarCreateRequestDTO dto, String authenticatedUsername) {
        // Validate authenticated user exists
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        // Create new Calendar
        Calendar calendar = new Calendar();
        calendar.setName(dto.getName());

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

        // Note: Admin promotion logic would be added here when managing user calendars
        // For now, just return updated info
        return new CalendarUpdateResponseDTO(
                updatedCalendar.getId(),
                updatedCalendar.getName(),
                null // admins list to be implemented
        );
    }

    // Delete calendar
    public void deleteCalendar(String calendarId, String authenticatedUsername) {
        // Get authenticated user
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        // Get calendar
        Calendar calendar = getCalendarById(calendarId);

        // Check if authenticated user is admin of this calendar
        if (!isUserAdminOfCalendar(authenticatedUser, calendarId)) {
            throw new ForbiddenException("You do not have permission to delete this calendar");
        }

        // Delete calendar
        calendarRepository.deleteById(calendarId);
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

        // Build full invite link
        String inviteLink = "https://app.example.com/invite/calendars/" + calendarId + "/" + inviteToken;

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

    // Helper: Check if user is admin of calendar
    private boolean isUserAdminOfCalendar(User user, String calendarId) {
        return user.isAdminOfCalendar(calendarId);
    }

    // Helper: Check if user is member of calendar
    private boolean isUserMemberOfCalendar(User user, String calendarId) {
        return user.isMemberOfCalendar(calendarId);
    }
}
