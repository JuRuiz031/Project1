package com.example.calendario.dto.calendar;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CalendarHomepageResponseDTO {
    
    @JsonProperty("calendars")
    private List<CalendarInfo> calendars;
    
    @JsonProperty("tags")
    private List<String> tags;
    
    // Inner class for calendar info
    public static class CalendarInfo {
        @JsonProperty("id")
        private String id;
        
        @JsonProperty("name")
        private String name;
        
        public CalendarInfo() {}
        
        public CalendarInfo(String id, String name) {
            this.id = id;
            this.name = name;
        }
        
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
    
    // Constructors
    public CalendarHomepageResponseDTO() {}
    
    public CalendarHomepageResponseDTO(List<CalendarInfo> calendars, List<String> tags) {
        this.calendars = calendars;
        this.tags = tags;
    }
    
    // Getters and Setters
    public List<CalendarInfo> getCalendars() { return calendars; }
    public void setCalendars(List<CalendarInfo> calendars) { this.calendars = calendars; }
    
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
