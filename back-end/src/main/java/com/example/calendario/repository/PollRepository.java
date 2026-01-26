package com.example.calendario.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.calendario.model.Poll;

@Repository
public interface PollRepository extends MongoRepository<Poll, String> {
    // Find all polls for a specific calendar
    List<Poll> findByCalendarId(String calendarId);

    // Find all polls across multiple calendars
    List<Poll> findByCalendarIdIn(List<String> calendarIds);

    // Find events by a list of IDs
    List<Poll> findByIdIn(List<String> pollIds);

    // Find polls that contain at least one of the specified tags
    List<Poll> findByTagsIn(List<String> tags);
    Optional<Poll> findByInviteLinksToken(String token);
}
