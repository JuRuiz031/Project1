package com.example.calendario.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.calendario.model.Calendar;

@Repository
public interface CalendarRepository extends MongoRepository<Calendar, String> {
    
    // Find calendar by invite link
    Optional<Calendar> findByInvitesLink(String link);
}
