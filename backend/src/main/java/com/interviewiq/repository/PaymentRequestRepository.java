package com.interviewiq.repository;

import com.interviewiq.model.PaymentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, Long> {
    List<PaymentRequest> findByUserIdOrderBySubmittedAtDesc(Long userId);
    List<PaymentRequest> findAllByOrderBySubmittedAtDesc();
}
