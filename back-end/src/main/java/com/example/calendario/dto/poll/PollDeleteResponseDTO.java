package com.example.calendario.dto.poll;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PollDeleteResponseDTO {

    @JsonProperty("poll_id")
    private String pollId;

    @JsonProperty("deleted")
    private Boolean deleted;

    // Constructors
    public PollDeleteResponseDTO() {}

    public PollDeleteResponseDTO(String pollId, Boolean deleted) {
        this.pollId = pollId;
        this.deleted = deleted;
    }

    // Getters and Setters
    public String getPollId() { return pollId; }
    public void setPollId(String pollId) { this.pollId = pollId; }

    public Boolean getDeleted() { return deleted; }
    public void setDeleted(Boolean deleted) { this.deleted = deleted; }
}
