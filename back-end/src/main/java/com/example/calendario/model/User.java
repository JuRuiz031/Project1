package com.example.calendario.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    
    @Id
    private String id; // Mongo generated ID

    @Indexed(unique = true)
    private String username;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;

    private Boolean isSuperuser; // Checks if the user has superuser privileges in the mongo document

    // TO BE IMPLEMENTED LATER
    // private List<Calendar> calendars = new ArrayList<>(); // List of calendars associated with the user


    // Constructors
    public User() {} // Default constructor (used by Spring Data)

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }


    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Boolean getIsSuperuser() { return isSuperuser; }
    public void setIsSuperuser(Boolean isSuperuser) { this.isSuperuser = isSuperuser; }
}
