package com.example.calendario.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.calendario.model.Event;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
    // Find events by a list of IDs
    List<Event> findByIdIn(List<String> eventIds);
    
    // Find all events for a specific calendar
    List<Event> findByCalendarId(String calendarId);

    // Find all events across multiple calendars
    List<Event> findByCalendarIdIn(List<String> calendarIds);

    // Find events that contain at least one of the specified tags
    List<Event> findByTagsIn(List<String> tags);
    
    // Find event by guest link token
    Optional<Event> findByInviteLinksToken(String token);

}
