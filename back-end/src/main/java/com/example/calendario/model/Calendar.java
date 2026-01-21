package com.example.calendario.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "calendars")
public class Calendar {

    @Id
    private String id; // Mongo generated ID

    private String name;

    private List<Invite> invites;
    
    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public static class Invite {
        private String link;
        private LocalDateTime expiresAt;

        // Constructors
        public Invite() {} // Default constructor (used by Spring Data)

        public Invite(String link, LocalDateTime expiresAt) {
            this.link = link;
            this.expiresAt = expiresAt;
        }

        // Getters and Setters
        public String getLink() { return link; }
        public void setLink(String link) { this.link = link; }

        public LocalDateTime getExpiresAt() { return expiresAt; }
        public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt;
        }
    }

    // Constructors
    public Calendar() {} // Default constructor (used by Spring Data)

    public Calendar(String name, List<Invite> invites) {
        this.name = name;
        this.invites = invites;
    }

    // Helper method to add an invite
    public void addInvite(Invite invite) {
        if(this.invites == null) {
            this.invites = new ArrayList<>();
        }
        this.invites.add(invite);
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<Invite> getInvites() { return invites; }
    public void setInvites(List<Invite> invites) { this.invites = invites; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

}