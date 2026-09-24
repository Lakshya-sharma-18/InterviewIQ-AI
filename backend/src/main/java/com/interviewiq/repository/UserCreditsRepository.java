package com.interviewiq.repository;

import com.interviewiq.model.UserCredits;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserCreditsRepository extends JpaRepository<UserCredits, Long> {
    Optional<UserCredits> findByUserId(Long userId);
}
