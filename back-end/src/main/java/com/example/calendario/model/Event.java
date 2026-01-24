package com.example.calendario.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "events")
public class Event {

    @Id
    private String id; // Mongo generated ID

    private String calendarId;

    private String title;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String description;
    private String notes;

    private List<String> tags = new ArrayList<>();

    private List<GuestLink> guestLinks = new ArrayList<>();

    // GuestLink inner class
    public static class GuestLink {
        private String token; // UUID token

        private String guestName;

        private LocalDateTime createdAt;

        // Constructors
        public GuestLink() {} // Default constructor (used by Spring Data)
        public GuestLink(String token, String guestName, LocalDateTime createdAt) {
            this.token = token;
            this.guestName = guestName;
            this.createdAt = createdAt;
        }

        // Getters and Setters
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }

        public String getGuestName() { return guestName; }
        public void setGuestName(String guestName) { this.guestName = guestName; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    // Constructors
    public Event() {} // Default constructor (used by Spring Data)
    public Event(String calendarId, String title, LocalDateTime startTime, LocalDateTime endTime,
                 String description, String notes, List<String> tags, List<GuestLink> guestLinks) {
        this.calendarId = calendarId;
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.description = description;
        this.notes = notes;
        this.tags = tags;
        this.guestLinks = guestLinks;
    }

    // Helper methods
    public void addTag(String tag) {
        this.tags.add(tag);
    }

    public void addGuestLink(String token, String guestName, LocalDateTime createdAt) {
        this.guestLinks.add(new GuestLink(token, guestName, createdAt));
    }

    public void removeGuestLink(String token) {
        this.guestLinks.removeIf(link -> link.getToken().equals(token));
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public List<GuestLink> getGuestLinks() { return guestLinks; }
    public void setGuestLinks(List<GuestLink> guestLinks) { this.guestLinks = guestLinks; }

}
