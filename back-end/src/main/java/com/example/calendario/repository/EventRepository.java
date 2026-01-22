package com.example.calendario.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.calendario.model.Event;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
    
    // Find all events for a specific calendar
    List<Event> findByCalendarId(String calendarId);

    // Find all events across multiple calendars
    List<Event> findByCalendarIdIn(List<String> calendarIds);

    
    // Find event by guest link token
    Optional<Event> findByGuestLinksToken(String token);

}
