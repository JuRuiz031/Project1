package com.example.calendario.dto.user;

import com.example.calendario.model.User;
import com.fasterxml.jackson.annotation.JsonProperty;

public class UserDeleteResponseDTO {
    @JsonProperty("user_id")
    private String id;

    @JsonProperty("deleted")
    private boolean deleted;

    public UserDeleteResponseDTO(User user, boolean deleted) {
        this.id = user.getId();
        this.deleted = deleted;
    }
    public UserDeleteResponseDTO() {}

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    
    public boolean isDeleted() {
        return deleted;
    }
    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    @Override
    public String toString() {
        return "UserDeleteResponseDTO{" +
                "id='" + id + '\'' +
                ", deleted=" + deleted +
                '}';
    }
}
