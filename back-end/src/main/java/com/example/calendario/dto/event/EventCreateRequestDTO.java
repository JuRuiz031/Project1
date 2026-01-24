package com.example.calendario.dto.event;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class EventCreateRequestDTO {
    
    @NotNull(message = "User ID cannot be null")
    @JsonProperty("user_id")
    private String userId;
    
    @NotNull(message = "Calendar ID cannot be null")
    @JsonProperty("calendar_id")
    private String calendarId;
    
    @NotBlank(message = "Event title cannot be empty")
    @JsonProperty("title")
    private String title;
    
    @NotNull(message = "Start time cannot be null")
    @JsonProperty("start_time")
    private LocalDateTime startTime;
    
    @NotNull(message = "End time cannot be null")
    @JsonProperty("end_time")
    private LocalDateTime endTime;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("notes")
    private String notes;
    
    @JsonProperty("tags")
    private List<String> tags;
    
    // Constructors
    public EventCreateRequestDTO() {}
    
    public EventCreateRequestDTO(String userId, String calendarId, String title, 
                                  LocalDateTime startTime, LocalDateTime endTime, 
                                  String description, String notes, List<String> tags) {
        this.userId = userId;
        this.calendarId = calendarId;
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.description = description;
        this.notes = notes;
        this.tags = tags;
    }
    
    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getCalendarId() { return calendarId; }
    public void setCalendarId(String calendarId) { this.calendarId = calendarId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
