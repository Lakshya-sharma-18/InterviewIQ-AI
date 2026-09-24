package com.interviewiq.controller;

import com.interviewiq.model.Payment;
import com.interviewiq.model.PaymentRequest;
import com.interviewiq.model.User;
import com.interviewiq.model.UserCredits;
import com.interviewiq.model.CreditTransaction;
import com.interviewiq.repository.PaymentRepository;
import com.interviewiq.repository.PaymentRequestRepository;
import com.interviewiq.repository.UserRepository;
import com.interviewiq.repository.UserCreditsRepository;
import com.interviewiq.repository.CreditTransactionRepository;
import com.interviewiq.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentRequestRepository paymentRequestRepository;

    @Autowired
    private UserCreditsRepository userCreditsRepository;

    @Autowired
    private CreditTransactionRepository creditTransactionRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    // ─── USER: Submit manual UPI transaction reference ─────────────────────────
    @PostMapping("/upi-submit")
    public ResponseEntity<?> submitUpiPayment(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = resolveUser(authHeader);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
            }

            String planName = String.valueOf(body.get("planName"));
            String utr = String.valueOf(body.get("utr"));

            if (utr == null || utr.trim().length() < 10) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid UPI Reference Number"));
            }

            double amount = 0;
            int creditsAdded = 0;

            if ("STARTER".equalsIgnoreCase(planName)) {
                amount = 100.0;
                creditsAdded = 150;
            } else if ("PRO".equalsIgnoreCase(planName)) {
                amount = 500.0;
                creditsAdded = 650;
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid plan type"));
            }

            // Create a PENDING payment request in database
            PaymentRequest pr = new PaymentRequest();
            pr.setUserId(user.getId());
            pr.setUserName(user.getFullName());
            pr.setEmail(user.getEmail());
            pr.setPlanName(planName.toUpperCase().contains("PRO") ? "Pro Pack" : "Starter Pack");
            pr.setAmount(amount);
            pr.setCredits(creditsAdded);
            pr.setUtrNumber(utr);
            pr.setStatus("PENDING"); // Starts as PENDING
            paymentRequestRepository.save(pr);

            logger.info("Direct UPI payment request logged as PENDING: userId={} amount={} plan={} utr={}", 
                    user.getId(), amount, planName, utr);

            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Payment Request Created",
                "planName", pr.getPlanName(),
                "utr", pr.getUtrNumber(),
                "amount", pr.getAmount(),
                "credits", pr.getCredits()
            ));

        } catch (Exception e) {
            logger.error("Failed to submit UPI payment request: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── USER: Get my UPI transaction logs ─────────────────────────────────────
    @GetMapping("/history")
    public ResponseEntity<?> getPaymentHistory(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = resolveUser(authHeader);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
            }

            List<PaymentRequest> records = paymentRequestRepository.findByUserIdOrderBySubmittedAtDesc(user.getId());
            List<Map<String, Object>> result = new ArrayList<>();
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

            for (PaymentRequest pr : records) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", pr.getId());
                item.put("createdAt", pr.getSubmittedAt() != null ? pr.getSubmittedAt().format(fmt) : null);
                item.put("planName", pr.getPlanName());
                item.put("amount", pr.getAmount());
                item.put("creditsAdded", pr.getCredits());
                item.put("status", pr.getStatus());
                item.put("transactionId", pr.getUtrNumber());
                
                // Historical auditor fields
                item.put("approvedAt", pr.getApprovedAt() != null ? pr.getApprovedAt().format(fmt) : "N/A");
                item.put("approvedBy", pr.getApprovedBy() != null ? pr.getApprovedBy() : "N/A");
                result.add(item);
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("Failed to fetch payment history: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── ADMIN: Get all payment requests ────────────────────────────────────────
    @GetMapping("/admin/requests")
    public ResponseEntity<?> getAdminRequests(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User admin = resolveAdmin(authHeader);
            if (admin == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: Admins only."));
            }

            List<PaymentRequest> records = paymentRequestRepository.findAllByOrderBySubmittedAtDesc();
            List<Map<String, Object>> result = new ArrayList<>();
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

            for (PaymentRequest pr : records) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", pr.getId());
                item.put("userId", pr.getUserId());
                item.put("userName", pr.getUserName());
                item.put("email", pr.getEmail());
                item.put("planName", pr.getPlanName());
                item.put("amount", pr.getAmount());
                item.put("credits", pr.getCredits());
                item.put("utrNumber", pr.getUtrNumber());
                item.put("status", pr.getStatus());
                item.put("submittedAt", pr.getSubmittedAt() != null ? pr.getSubmittedAt().format(fmt) : null);
                item.put("approvedAt", pr.getApprovedAt() != null ? pr.getApprovedAt().format(fmt) : "N/A");
                item.put("approvedBy", pr.getApprovedBy() != null ? pr.getApprovedBy() : "N/A");
                result.add(item);
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("Failed to fetch admin payment requests: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── ADMIN: Approve payment request ──────────────────────────────────────────
    @PostMapping("/admin/approve")
    public ResponseEntity<?> approvePaymentRequest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User admin = resolveAdmin(authHeader);
            if (admin == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: Admins only."));
            }

            Long requestId = Long.valueOf(String.valueOf(body.get("requestId")));
            Optional<PaymentRequest> prOpt = paymentRequestRepository.findById(requestId);
            
            if (prOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Payment Request not found"));
            }

            PaymentRequest pr = prOpt.get();
            if (!"PENDING".equalsIgnoreCase(pr.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only PENDING requests can be processed. Status is " + pr.getStatus()));
            }

            // Mark Request as APPROVED
            pr.setStatus("APPROVED");
            pr.setApprovedAt(LocalDateTime.now());
            pr.setApprovedBy(admin.getFullName());
            paymentRequestRepository.save(pr);

            // Fetch target user and add credits
            Optional<User> userOpt = userRepository.findById(pr.getUserId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Target user not found"));
            }

            User targetUser = userOpt.get();
            
            // Add credits to user_credits
            UserCredits uc = userCreditsRepository.findByUserId(targetUser.getId())
                    .orElseGet(() -> {
                        UserCredits newUc = new UserCredits();
                        newUc.setUserId(targetUser.getId());
                        newUc.setCredits(100);
                        return userCreditsRepository.save(newUc);
                    });

            int currentBalance = uc.getCredits();
            int newBalance = currentBalance + pr.getCredits();
            
            uc.setCredits(newBalance);
            userCreditsRepository.save(uc);

            // Sync User entity credits
            targetUser.setCredits(newBalance);
            userRepository.save(targetUser);

            // Log PURCHASE transaction inside CreditTransaction logs
            CreditTransaction transaction = new CreditTransaction();
            transaction.setUserId(targetUser.getId());
            transaction.setType("PURCHASE");
            transaction.setAmount(pr.getCredits());
            transaction.setBalanceAfter(newBalance);
            creditTransactionRepository.save(transaction);

            logger.info("Admin APPROVED payment request: requestId={} userName={} amount={} creditsAdded={} newBalance={}",
                    pr.getId(), pr.getUserName(), pr.getAmount(), pr.getCredits(), newBalance);

            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Payment Approved successfully!",
                "credits", newBalance
            ));

        } catch (Exception e) {
            logger.error("Failed to approve payment request: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── ADMIN: Reject payment request ──────────────────────────────────────────
    @PostMapping("/admin/reject")
    public ResponseEntity<?> rejectPaymentRequest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User admin = resolveAdmin(authHeader);
            if (admin == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: Admins only."));
            }

            Long requestId = Long.valueOf(String.valueOf(body.get("requestId")));
            Optional<PaymentRequest> prOpt = paymentRequestRepository.findById(requestId);
            
            if (prOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Payment Request not found"));
            }

            PaymentRequest pr = prOpt.get();
            if (!"PENDING".equalsIgnoreCase(pr.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only PENDING requests can be processed."));
            }

            // Mark Request as REJECTED
            pr.setStatus("REJECTED");
            pr.setApprovedAt(LocalDateTime.now());
            pr.setApprovedBy(admin.getFullName());
            paymentRequestRepository.save(pr);

            logger.info("Admin REJECTED payment request: requestId={} userName={} amount={} utr={}",
                    pr.getId(), pr.getUserName(), pr.getAmount(), pr.getUtrNumber());

            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Payment Rejected successfully!"
            ));

        } catch (Exception e) {
            logger.error("Failed to reject payment request: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── ADMIN: Analytics stats ───────────────────────────────────────────────
    @GetMapping("/admin/stats")
    public ResponseEntity<?> getAdminStats(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User admin = resolveAdmin(authHeader);
            if (admin == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: Admins only."));
            }

            List<PaymentRequest> records = paymentRequestRepository.findAll();
            long pendingRequests = 0;
            long approvedRequests = 0;
            long rejectedRequests = 0;
            double totalRevenue = 0;
            long totalCreditsSold = 0;

            for (PaymentRequest pr : records) {
                String status = pr.getStatus() != null ? pr.getStatus().toUpperCase() : "PENDING";
                if ("PENDING".equals(status)) {
                    pendingRequests++;
                } else if ("APPROVED".equals(status)) {
                    approvedRequests++;
                    totalRevenue += pr.getAmount() != null ? pr.getAmount() : 0.0;
                    totalCreditsSold += pr.getCredits() != null ? pr.getCredits() : 0;
                } else if ("REJECTED".equals(status)) {
                    rejectedRequests++;
                }
            }

            return ResponseEntity.ok(Map.of(
                "pendingRequests", pendingRequests,
                "approvedRequests", approvedRequests,
                "rejectedRequests", rejectedRequests,
                "totalRevenue", totalRevenue,
                "totalCreditsSold", totalCreditsSold
            ));

        } catch (Exception e) {
            logger.error("Failed to fetch admin stats: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Helper resolveUser
    private User resolveUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (!tokenProvider.validateToken(token)) return null;
        String email = tokenProvider.getEmailFromToken(token);
        return userRepository.findByEmail(email).orElse(null);
    }

    // Helper resolveAdmin
    private User resolveAdmin(String authHeader) {
        User user = resolveUser(authHeader);
        if (user != null && "ADMIN".equalsIgnoreCase(user.getRole())) {
            return user;
        }
        return null;
    }
}
