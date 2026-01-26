package com.example.calendario.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.LinkedHashMap;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "polls")
public class Poll {

    @Id
    private String id;

    private String calendarId;

    private String title;

    private String description;

    private String notes;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private boolean resultsVisible;

    private boolean allowMultipleVotes;

    private List<String> tags = new ArrayList<>();

    private Set<InviteLink> inviteLinks = new HashSet<>();

    private List<Option> optionsList = new ArrayList<>();

    @Transient
    private Map<Integer, Option> options = new LinkedHashMap<>();

    public static class Option {
        // Option id within the poll (not a Mongo id)
        private int optionId;
        private String description;
        private List<String> userVotes = new ArrayList<>();
        private List<String> guestVotes = new ArrayList<>();

        public Option() {}

        public Option(int optionId, String description) {
            this.optionId = optionId;
            this.description = description;
        }

        public int getOptionId() { return optionId; }
        public void setOptionId(int optionId) { this.optionId = optionId; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public List<String> getUserVotes() { return userVotes; }
        public void setUserVotes(List<String> userVotes) { this.userVotes = userVotes; }

        public List<String> getGuestVotes() { return guestVotes; }
        public void setGuestVotes(List<String> guestVotes) { this.guestVotes = guestVotes; }
    }

    // Constructors
    public Poll() {}

    // Helper methods
    public void addOption(String description) {
        int nextId = 0;
        if (!options.isEmpty()) {
            nextId = java.util.Collections.max(options.keySet()) + 1;
        }
        options.put(nextId, new Option(nextId, description));
        optionsList.add(new Option(nextId, description));
    }

    public void addOption(String description, List<String> userVotes, List<String> guestVotes) {
        int nextId = 0;
        if (!options.isEmpty()) {
            nextId = java.util.Collections.max(options.keySet()) + 1;
        }
        Option option = new Option(nextId, description);
        option.setUserVotes(userVotes);
        option.setGuestVotes(guestVotes);
        options.put(nextId, option);
        optionsList.add(option);
    }

    public void removeOption(int optionId) {
        options.remove(optionId);
        optionsList.removeIf(o -> o.getOptionId() == optionId);
    }

    public void clearOptions() {
        options.clear();
        optionsList.clear();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCalendarId() { return calendarId; }
    public void setCalendarId(String calendarId) { this.calendarId = calendarId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public boolean isResultsVisible() { return resultsVisible; }
    public void setResultsVisible(boolean resultsVisible) { this.resultsVisible = resultsVisible; }

    public boolean isAllowMultipleVotes() { return allowMultipleVotes; }
    public void setAllowMultipleVotes(boolean allowMultipleVotes) { this.allowMultipleVotes = allowMultipleVotes; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public Set<InviteLink> getInviteLinks() { return inviteLinks; }
    public void setInviteLinks(Set<InviteLink> inviteLinks) { this.inviteLinks = inviteLinks; }
    public void addInviteLink(String token, LocalDateTime createdAt, LocalDateTime expiresAt) {
        this.inviteLinks.add(new InviteLink(token, createdAt, expiresAt));
    }

    // Return options as a list to preserve compatibility with existing code
    public List<Option> getOptions() { return optionsList; }

    // Set options from a list (rebuilds internal map using each option's optionId)
    public void setOptions(List<Option> optionsList) {
        this.options.clear();
        this.optionsList.clear();
        if (optionsList != null) {
            for (Option o : optionsList) {
                this.options.put(o.getOptionId(), o);
                this.optionsList.add(o);
            }
        }
    }

    // Direct access to the internal map when callers need to add/remove by id
    public Map<Integer, Option> getOptionsMap() { return options; }

}
