package com.example.calendario.dto.poll;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;

public class PollCreateRequestDTO {

    @NotNull(message = "User ID cannot be null")
    @JsonProperty("user_id")
    private String userId;

    @NotNull(message = "Calendar ID cannot be null")
    @JsonProperty("calendar_id")
    private String calendarId;

    @NotBlank(message = "Poll title cannot be empty")
    @JsonProperty("title")
    private String title;

    @JsonProperty("description")
    private String description;

    @JsonProperty("notes")
    private String notes;

    @NotNull(message = "Start time cannot be null")
    @JsonProperty("start_time")
    private LocalDateTime startTime;

    @NotNull(message = "End time cannot be null")
    @JsonProperty("end_time")
    private LocalDateTime endTime;

    @JsonProperty("results_visible")
    private boolean resultsVisible;

    @JsonProperty("allow_multiple_votes")
    private boolean allowMultipleVotes;

    @NotNull(message = "Options list cannot be null")
    @NotEmpty(message = "Options list must contain at least one option")
    @JsonProperty("options")
    private List<PollOptionDTO> options;

    @JsonProperty("tags")
    private List<String> tags;

    // Constructors
    public PollCreateRequestDTO() {}

    public PollCreateRequestDTO(String userId, String calendarId, String title, String description,
            String notes, LocalDateTime startTime, LocalDateTime endTime, boolean resultsVisible,
            boolean allowMultipleVotes, List<PollOptionDTO> options, List<String> tags) {
        this.userId = userId;
        this.calendarId = calendarId;
        this.title = title;
        this.description = description;
        this.notes = notes;
        this.startTime = startTime;
        this.endTime = endTime;
        this.resultsVisible = resultsVisible;
        this.allowMultipleVotes = allowMultipleVotes;
        this.options = options;
        this.tags = tags;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCalendarId() { return calendarId; }
    public void setCalendarId(String calendarId) { this.calendarId = calendarId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public boolean getResultsVisible() { return resultsVisible; }
    public void setResultsVisible(boolean resultsVisible) { this.resultsVisible = resultsVisible; }

    public boolean getAllowMultipleVotes() { return allowMultipleVotes; }
    public void setAllowMultipleVotes(boolean allowMultipleVotes) { this.allowMultipleVotes = allowMultipleVotes; }

    public List<PollOptionDTO> getOptions() { return options; }
    public void setOptions(List<PollOptionDTO> options) { this.options = options; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
