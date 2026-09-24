package com.interviewiq.repository;

import com.interviewiq.model.InterviewHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewHistoryRepository extends JpaRepository<InterviewHistory, Long> {

    /** Return all interviews for a user, newest first */
    List<InterviewHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
}
