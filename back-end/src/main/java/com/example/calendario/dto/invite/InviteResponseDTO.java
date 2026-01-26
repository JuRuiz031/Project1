package com.example.calendario.dto.invite;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class InviteResponseDTO {

    @JsonProperty("event_id")
    private String eventId;

    @JsonProperty("poll_id")
    private String pollId;

    @JsonProperty("invite_link")
    private String inviteLink;

    public InviteResponseDTO() {}

    public InviteResponseDTO(String eventId, String pollId, String inviteLink) {
        this.eventId = eventId;
        this.pollId = pollId;
        this.inviteLink = inviteLink;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getPollId() { return pollId; }
    public void setPollId(String pollId) { this.pollId = pollId; }

    public String getInviteLink() { return inviteLink; }
    public void setInviteLink(String inviteLink) { this.inviteLink = inviteLink; }

}
