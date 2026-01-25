package com.example.calendario.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Response for GET /login - authentication status check.
 * Returns whether the request has a valid JWT and token info.
 */
public class LoginStatusDTO {
    
    @JsonProperty("authenticated")
    private boolean authenticated;
    
    @JsonProperty("user")
    private LoginUserDTO user;
    
    @JsonProperty("token_expires_at")
    private String tokenExpiresAt;
    
    // Constructors
    public LoginStatusDTO() {}
    
    // Constructor for authenticated response
    public LoginStatusDTO(boolean authenticated, LoginUserDTO user, String tokenExpiresAt) {
        this.authenticated = authenticated;
        this.user = user;
        this.tokenExpiresAt = tokenExpiresAt;
    }
    
    // Constructor for not authenticated response
    public LoginStatusDTO(boolean authenticated) {
        this.authenticated = authenticated;
        this.user = null;
        this.tokenExpiresAt = null;
    }
    
    // Getters and Setters
    public boolean isAuthenticated() { return authenticated; }
    public void setAuthenticated(boolean authenticated) { this.authenticated = authenticated; }
    
    public LoginUserDTO getUser() { return user; }
    public void setUser(LoginUserDTO user) { this.user = user; }
    
    public String getTokenExpiresAt() { return tokenExpiresAt; }
    public void setTokenExpiresAt(String tokenExpiresAt) { this.tokenExpiresAt = tokenExpiresAt; }
}
