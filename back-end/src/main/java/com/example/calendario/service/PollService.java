package com.example.calendario.service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

import org.springframework.data.mongodb.core.aggregation.ArrayOperators.In;
import org.springframework.stereotype.Service;

import com.example.calendario.service.UserService;
import com.example.calendario.service.CalendarService;
import com.example.calendario.repository.PollRepository;
import com.example.calendario.dto.poll.PollCreateRequestDTO;
import com.example.calendario.dto.poll.PollDeleteRequestDTO;
import com.example.calendario.dto.poll.PollDeleteResponseDTO;
import com.example.calendario.dto.poll.PollResponseDTO;
import com.example.calendario.dto.poll.PollUpdateRequestDTO;
import com.example.calendario.dto.poll.PollVoteRequestDTO;
import com.example.calendario.dto.poll.PollOptionDTO;
import com.example.calendario.exception.AlreadyVotedException;
import com.example.calendario.exception.ForbiddenException;
import com.example.calendario.exception.ResourceNotFoundException;
import com.example.calendario.exception.InvalidRequestException;
import com.example.calendario.model.User;
import com.example.calendario.model.Poll;

@Service
public class PollService {
	private final PollRepository pollRepository;
	private final CalendarService calendarService;
	private final UserService userService;

	public PollService(PollRepository pollRepository,
					   CalendarService calendarService,
					   UserService userService) {
		this.pollRepository = pollRepository;
		this.calendarService = calendarService;
		this.userService = userService;
	}

	// Create a new poll
	public PollResponseDTO createPoll(PollCreateRequestDTO dto, String authenticatedUsername) {
		// Validate authenticated user exists
		User authenticatedUser = userService.findByUsername(authenticatedUsername)
				.orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        if (!(dto.getUserId().equals(authenticatedUser.getId()))) {
            throw new ForbiddenException("You do not have permission to create a poll for another user");
        }

		if (dto.getUserId() == null || dto.getUserId().isBlank()) {
			throw new IllegalArgumentException("User ID is required");
		}
		if (dto.getCalendarId() == null || dto.getCalendarId().isBlank()) {
			throw new IllegalArgumentException("Calendar ID is required");
		}
		if (dto.getTitle() == null || dto.getTitle().isBlank()) {
			throw new IllegalArgumentException("Title is required");
		}
		if (dto.getStartTime() == null || dto.getEndTime() == null) {
			throw new IllegalArgumentException("Start time and end time are required");
		}
		if (!dto.getStartTime().isBefore(dto.getEndTime())) {
			throw new InvalidRequestException("Poll start time must be before end time");
		}
		if (dto.getOptions() == null || dto.getOptions().isEmpty()) {
			throw new IllegalArgumentException("At least one poll option is required");
		}

		// Validate calendar exists
		calendarService.getCalendarById(dto.getCalendarId());

		// Check permissions: authenticated user must be admin of calendar or superuser
		if (!authenticatedUser.isAdminOfCalendar(dto.getCalendarId()) && !authenticatedUser.isSuperuser()) {
			throw new ForbiddenException("You do not have permission to create polls in this calendar");
		}

		// Build Poll model
		Poll poll = new Poll();
		poll.setCalendarId(dto.getCalendarId());
		poll.setTitle(dto.getTitle());
		poll.setDescription(dto.getDescription());
		poll.setNotes(dto.getNotes());
		poll.setStartTime(dto.getStartTime());
		poll.setEndTime(dto.getEndTime());
		poll.setResultsVisible(dto.getResultsVisible());
		poll.setAllowMultipleVotes(dto.getAllowMultipleVotes());
		// Map options
        List<PollOptionDTO> options = dto.getOptions();
		if (options != null) {
			for (PollOptionDTO opt : options) {
				if (opt == null) continue;
				String desc = opt.getDescription();
				if (desc != null && !desc.isBlank()) {
					poll.addOption(desc);
				}
			}
		}

		poll.setTags(dto.getTags());

		// Save poll
		Poll saved = pollRepository.save(poll);

		// Build response DTO (everything from create DTO except user_id)
		return new PollResponseDTO(
				saved.getId(),
				saved.getCalendarId(),
				saved.getTitle(),
				saved.getDescription(),
				saved.getNotes(),
				saved.getStartTime(),
				saved.getEndTime(),
				saved.isResultsVisible(),
				saved.isAllowMultipleVotes(),
				saved.getOptions() == null ? null : saved.getOptions().stream()
						.map(o -> {
							PollOptionDTO ro = new PollOptionDTO();
                            ro.setOptionId(o.getOptionId());
							ro.setDescription(o.getDescription());
							return ro;
						}).collect(java.util.stream.Collectors.toList()),
				saved.getTags()
		);
	}

    public PollResponseDTO updatePoll(String pollId, PollUpdateRequestDTO dto, String authenticatedUsername) {
        // Validate authenticated user exists
		User authenticatedUser = userService.findByUsername(authenticatedUsername)
				.orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        if (!(dto.getUserId().equals(authenticatedUser.getId()))) {
            throw new ForbiddenException("You do not have permission to edit this poll");
        }

        // Validate calendar exists
		calendarService.getCalendarById(dto.getCalendarId());

		// Check permissions: authenticated user must be admin of calendar or superuser
		if (!authenticatedUser.isAdminOfCalendar(dto.getCalendarId()) && !authenticatedUser.isSuperuser()) {
			throw new ForbiddenException("You do not have permission to move the poll to this calendar");
		}

        // Fetch existing poll
        Poll existingPoll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found"));

        // Update fields
        existingPoll.setCalendarId(dto.getCalendarId());
        existingPoll.setTitle(dto.getTitle());
        existingPoll.setDescription(dto.getDescription());
        existingPoll.setNotes(dto.getNotes());
        existingPoll.setStartTime(dto.getStartTime());
        existingPoll.setEndTime(dto.getEndTime());
        existingPoll.setResultsVisible(dto.getResultsVisible());
        existingPoll.setAllowMultipleVotes(dto.getAllowMultipleVotes());

		// Update options: add new options (no id), update existing by id, and remove missing ones
		List<PollOptionDTO> options = dto.getOptions();
		if (options != null) {
			// Snapshot of original option ids so we can detect removals
			Map<Integer, com.example.calendario.model.Poll.Option> optionsMap = existingPoll.getOptionsMap();
			Set<Integer> originalIds = new HashSet<>(optionsMap.keySet());
			Set<Integer> incomingIds = new HashSet<>();

			for (PollOptionDTO opt : options) {
				if (opt == null) continue;
				Integer optId = opt.getOptionId();
				String desc = opt.getDescription();

				if (optId == null) {
					// New option: add to poll (assigns new id)
					if (desc != null && !desc.isBlank()) {
						existingPoll.addOption(desc, opt.getUserVotes(), opt.getGuestVotes());
					}
				} else {
					incomingIds.add(optId);
					com.example.calendario.model.Poll.Option existingOpt = optionsMap.get(optId);
					if (existingOpt != null) {
						// Update fields if provided
						if (desc != null && !desc.isBlank()) {
							existingOpt.setDescription(desc);
						}
					}
				}
			}

			// Remove options that were present before but not included in incoming list
			for (Integer originalId : originalIds) {
				if (!incomingIds.contains(originalId)) {
					existingPoll.removeOption(originalId);
				}
			}
		}

		existingPoll.setTags(dto.getTags());

		// Save updated poll
		Poll updated = pollRepository.save(existingPoll);

		// Build response DTO
		return new PollResponseDTO(
				updated.getId(),
				updated.getCalendarId(),
				updated.getTitle(),
				updated.getDescription(),
				updated.getNotes(),
				updated.getStartTime(),
				updated.getEndTime(),
				updated.isResultsVisible(),
				updated.isAllowMultipleVotes(),
				updated.getOptions() == null ? null : updated.getOptions().stream()
						.map(o -> {
							PollOptionDTO ro = new PollOptionDTO();
                            ro.setOptionId(o.getOptionId());
							ro.setDescription(o.getDescription());
                            ro.setUserVotes(o.getUserVotes());
                            ro.setGuestVotes(o.getGuestVotes());
							return ro;
						}).collect(java.util.stream.Collectors.toList()),
				updated.getTags()
		);
    }

    public PollDeleteResponseDTO deletePoll(String pollId, PollDeleteRequestDTO dto, String authenticatedUsername) {
        // Validate authenticated user exists  
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found")); 
        
        if (!(dto.getUserId().equals(authenticatedUser.getId()))) {
            throw new ForbiddenException("You do not have permission to delete this poll");
        
        }

        // Fetch existing poll
        Poll existingPoll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found"));
        // Check permissions: authenticated user must be admin of calendar or superuser
        if (!authenticatedUser.isAdminOfCalendar(existingPoll.getCalendarId()) && !authenticatedUser.isSuperuser()) {
            throw new ForbiddenException("You do not have permission to delete this poll");
        }

        // Delete poll
        pollRepository.delete(existingPoll);
        return new PollDeleteResponseDTO(pollId, true);
    }

    public PollResponseDTO voteOnPoll(String pollId, PollVoteRequestDTO dto, String authenticatedUsername) {
        // Validate authenticated user exists
        User authenticatedUser = userService.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        
        if (!(dto.getUserId().equals(authenticatedUser.getId()))) {
            throw new ForbiddenException("You do not have permission to vote on this poll");
        }

        if (!authenticatedUser.isMemberOfCalendar(dto.getCalendarId())) {
            throw new ForbiddenException("You do not have permission to vote in this calendar");
        }

        // Fetch existing poll
        Poll existingPoll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found"));

        // Validate options
        List<Integer> selectedOptions = dto.getOptions();
        if (selectedOptions == null || selectedOptions.isEmpty()) {
            throw new IllegalArgumentException("At least one poll option must be selected");
        }
        if (selectedOptions.size() > 1 && !existingPoll.isAllowMultipleVotes()) {
            throw new InvalidRequestException("Multiple votes are not allowed in this poll");
        }

        // Process votes
        Map<Integer, Poll.Option> optionsMap = existingPoll.getOptionsMap();
        
        // Check if user has already voted
        for (Poll.Option option : optionsMap.values()) {
            if (option.getUserVotes().contains(dto.getUserId())) {
                throw new AlreadyVotedException("User has already voted in this poll");
            }
        }
        for (Integer optionId : selectedOptions) {
            Poll.Option option = optionsMap.get(optionId);
            if (option == null) {
                throw new InvalidRequestException("Invalid poll option selected: " + optionId);
            }
            // Add vote
            if (!option.getUserVotes().contains(dto.getUserId())) {
                option.getUserVotes().add(dto.getUserId());
            }
        }

        // Save updated poll
        pollRepository.save(existingPoll);

        // Return updated poll response
        return new PollResponseDTO(
                existingPoll.getId(),
                existingPoll.getCalendarId(),
                existingPoll.getTitle(),
                existingPoll.getDescription(),
                existingPoll.getNotes(),
                existingPoll.getStartTime(),
                existingPoll.getEndTime(),
                existingPoll.isResultsVisible(),
                existingPoll.isAllowMultipleVotes(),
                existingPoll.getOptions() == null ? null : existingPoll.getOptions().stream()
                        .map(o -> {
                            PollOptionDTO ro = new PollOptionDTO();
                            ro.setOptionId(o.getOptionId());
                            ro.setDescription(o.getDescription());
                            ro.setUserVotes(o.getUserVotes());
                            ro.setGuestVotes(o.getGuestVotes());
                            return ro;
                        }).collect(java.util.stream.Collectors.toList()),
                existingPoll.getTags()
        );
    }

}
