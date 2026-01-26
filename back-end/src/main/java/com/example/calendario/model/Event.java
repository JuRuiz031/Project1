package com.example.calendario.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    private Set<InviteLink> inviteLinks = new HashSet<>();

    // Constructors
    public Event() {} // Default constructor (used by Spring Data)
    public Event(String calendarId, String title, LocalDateTime startTime, LocalDateTime endTime,
                 String description, String notes, List<String> tags, Set<InviteLink> inviteLinks) {
        this.calendarId = calendarId;
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.description = description;
        this.notes = notes;
        this.tags = tags;
        this.inviteLinks = inviteLinks;
    }

    // Helper methods
    public void addTag(String tag) {
        this.tags.add(tag);
    }

    public void addInviteLink(String token, LocalDateTime createdAt, LocalDateTime expiresAt) {
        this.inviteLinks.add(new InviteLink(token, createdAt, expiresAt));
    }

    public void removeInviteLink(String token) {
        this.inviteLinks.removeIf(link -> link.getToken().equals(token));
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

    public Set<InviteLink> getInviteLinks() { return inviteLinks; }
    public void setInviteLinks(Set<InviteLink> inviteLinks) { this.inviteLinks = inviteLinks; }

}
