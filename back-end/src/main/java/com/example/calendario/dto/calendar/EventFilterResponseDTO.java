package com.example.calendario.dto.calendar;

import java.util.List;

import com.example.calendario.dto.event.EventResponseDTO;
import com.fasterxml.jackson.annotation.JsonProperty;

public class EventFilterResponseDTO {
    
    @JsonProperty("events")
    private List<EventResponseDTO> events;
    
    // Constructor
    public EventFilterResponseDTO() {}
    
    public EventFilterResponseDTO(List<EventResponseDTO> events) {
        this.events = events;
    }
    
    // Getters and Setters
    public List<EventResponseDTO> getEvents() { return events; }
    public void setEvents(List<EventResponseDTO> events) { this.events = events; }
}
