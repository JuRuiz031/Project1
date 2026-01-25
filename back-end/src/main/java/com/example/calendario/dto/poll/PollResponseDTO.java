package com.example.calendario.dto.poll;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class PollResponseDTO {

    @NotNull(message = "Poll ID cannot be null")
    @JsonProperty("poll_id")
    private String pollId;

    @NotNull(message = "Calendar ID cannot be null")
    @JsonProperty("calendar_id")
    private String calendarId;

    @JsonProperty("title")
    private String title;

    @JsonProperty("description")
    private String description;

    @JsonProperty("notes")
    private String notes;

    @JsonProperty("start_time")
    private LocalDateTime startTime;

    @JsonProperty("end_time")
    private LocalDateTime endTime;

    @JsonProperty("results_visible")
    private Boolean resultsVisible;

    @JsonProperty("allow_multiple_votes")
    private Boolean allowMultipleVotes;

    @NotNull(message = "Options cannot be null")
    @NotEmpty(message = "Options must contain at least one option")
    @JsonProperty("options")
    private List<PollOptionDTO> options;

    @JsonProperty("tags")
    private List<String> tags;

    // Constructors
    public PollResponseDTO() {}

    public PollResponseDTO(String pollId, String calendarId, String title, String description, String notes,
                           LocalDateTime startTime, LocalDateTime endTime, Boolean resultsVisible,
                           Boolean allowMultipleVotes, List<PollOptionDTO> options, List<String> tags) {
        this.pollId = pollId;
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
    public String getPollId() { return pollId; }
    public void setPollId(String pollId) { this.pollId = pollId; }

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

    public Boolean getResultsVisible() { return resultsVisible; }
    public void setResultsVisible(Boolean resultsVisible) { this.resultsVisible = resultsVisible; }

    public Boolean getAllowMultipleVotes() { return allowMultipleVotes; }
    public void setAllowMultipleVotes(Boolean allowMultipleVotes) { this.allowMultipleVotes = allowMultipleVotes; }

    public List<PollOptionDTO> getOptions() { return options; }
    public void setOptions(List<PollOptionDTO> options) { this.options = options; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
