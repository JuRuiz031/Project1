package com.example.calendario.model;

import java.time.LocalDateTime;

public class InviteLink {
    private String token; // UUID token
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    // Constructors
    public InviteLink() {} // Default constructor (used by Spring Data)
    public InviteLink(String token, LocalDateTime createdAt, LocalDateTime expiresAt) {
        this.token = token;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        InviteLink other = (InviteLink) obj;
        return token != null && token.equals(other.token);
    }

    @Override
    public int hashCode() {
        return token != null ? token.hashCode() : 0;
    }
}