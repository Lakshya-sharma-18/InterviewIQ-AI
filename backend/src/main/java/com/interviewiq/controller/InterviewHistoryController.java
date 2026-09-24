package com.interviewiq.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewiq.model.InterviewHistory;
import com.interviewiq.model.User;
import com.interviewiq.model.UserCredits;
import com.interviewiq.model.CreditTransaction;
import com.interviewiq.repository.InterviewHistoryRepository;
import com.interviewiq.repository.UserRepository;
import com.interviewiq.repository.UserCreditsRepository;
import com.interviewiq.repository.CreditTransactionRepository;
import com.interviewiq.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/auth/history")
public class InterviewHistoryController {

    private static final Logger logger = LoggerFactory.getLogger(InterviewHistoryController.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Autowired
    private InterviewHistoryRepository historyRepo;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserCreditsRepository userCreditsRepository;

    @Autowired
    private CreditTransactionRepository creditTransactionRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // ─── Resolve user from Bearer token ───────────────────────────────────
    private User resolveUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) return null;
        String email = jwtTokenProvider.getEmailFromToken(token);
        return userRepository.findByEmail(email).orElse(null);
    }

    // ─── POST /api/auth/history/start ─────────────────────────────────────
    /** Called when user hits "Start Interview". Creates an INCOMPLETE record. */
    @PostMapping("/start")
    public ResponseEntity<?> startInterview(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = resolveUser(authHeader);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            UserCredits uc = userCreditsRepository.findByUserId(user.getId())
                    .orElseGet(() -> {
                        UserCredits newUc = new UserCredits();
                        newUc.setUserId(user.getId());
                        newUc.setCredits(100);
                        return userCreditsRepository.save(newUc);
                    });

            if (uc.getCredits() < 10) {
                return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                        .body(Map.of("error", "Insufficient credits. You need at least 10 credits to start an interview."));
            }

            InterviewHistory h = new InterviewHistory();
            h.setUserId(user.getId());
            h.setCandidateName(String.valueOf(body.getOrDefault("candidateName", user.getFullName())));
            h.setResumeName(String.valueOf(body.getOrDefault("resumeName", "No Resume")));
            h.setRole(String.valueOf(body.getOrDefault("role", "Software Engineer")));
            h.setInterviewType(String.valueOf(body.getOrDefault("interviewType", "technical")));
            h.setStatus("INCOMPLETE");
            h.setResumeSkillsJson(toJson(body.get("skills")));
            h.setResumeProjectsJson(toJson(body.get("projects")));
            h.setQuestionsJson(toJson(body.get("questions")));
            h.setPdfPath(String.valueOf(body.getOrDefault("pdfPath", "")));
            h.setCreditsBefore(uc.getCredits());
            h.setInterviewCost(10);

            InterviewHistory saved = historyRepo.save(h);
            logger.info("Interview started: historyId={} userId={} role={}", saved.getId(), user.getId(), h.getRole());

            return ResponseEntity.ok(Map.of("historyId", saved.getId()));
        } catch (Exception e) {
            logger.error("Failed to start interview history: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── POST /api/auth/history/complete ──────────────────────────────────
    /** Called after AI evaluation is done. Updates the record with all scores and COMPLETED status. */
    @PostMapping("/complete")
    public ResponseEntity<?> completeInterview(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = resolveUser(authHeader);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            Long historyId = Long.valueOf(String.valueOf(body.get("historyId")));
            Optional<InterviewHistory> opt = historyRepo.findById(historyId);
            if (opt.isEmpty() || !opt.get().getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Interview record not found"));
            }

            InterviewHistory h = opt.get();
            h.setStatus("COMPLETED");
            h.setCompletedAt(LocalDateTime.now());
            h.setOverallScore(toDouble(body.get("overallScore")));
            h.setTechnicalScore(toDouble(body.get("technicalScore")));
            h.setCommunicationScore(toDouble(body.get("communicationScore")));
            h.setConfidenceScore(toDouble(body.get("confidenceScore")));
            h.setProblemSolvingScore(toDouble(body.get("problemSolvingScore")));
            h.setAnswersJson(toJson(body.get("answers")));
            h.setFeedbackJson(toJson(body.get("questionReports")));
            h.setStrengthsJson(toJson(body.get("strengths")));
            h.setWeaknessesJson(toJson(body.get("weaknesses")));
            h.setImprovementsJson(toJson(body.get("improvements")));
            h.setPdfPath(String.valueOf(body.getOrDefault("pdfPath", "")));

            // Credit deduction logic on successful completion
            UserCredits uc = userCreditsRepository.findByUserId(user.getId())
                    .orElseGet(() -> {
                        UserCredits newUc = new UserCredits();
                        newUc.setUserId(user.getId());
                        newUc.setCredits(100);
                        return userCreditsRepository.save(newUc);
                    });

            int currentBalance = uc.getCredits();
            int newBalance = currentBalance >= 10 ? currentBalance - 10 : 0;
            
            uc.setCredits(newBalance);
            userCreditsRepository.save(uc);

            // Sync User entity credits
            user.setCredits(newBalance);
            userRepository.save(user);

            // Log INTERVIEW_DEDUCTION transaction
            CreditTransaction transaction = new CreditTransaction();
            transaction.setUserId(user.getId());
            transaction.setType("INTERVIEW_DEDUCTION");
            transaction.setAmount(-10);
            transaction.setBalanceAfter(newBalance);
            creditTransactionRepository.save(transaction);

            // Set final credit details in history record
            if (h.getCreditsBefore() == null) {
                h.setCreditsBefore(currentBalance);
            }
            h.setCreditsAfter(newBalance);
            h.setInterviewCost(10);

            historyRepo.save(h);
            logger.info("Interview completed: historyId={} overallScore={}", historyId, h.getOverallScore());

            return ResponseEntity.ok(Map.of("message", "Interview record updated successfully"));
        } catch (Exception e) {
            logger.error("Failed to complete interview history: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── POST /api/auth/history/incomplete ───────────────────────────────
    /** Called when user exits early. Marks as INCOMPLETE. */
    @PostMapping("/incomplete")
    public ResponseEntity<?> markIncomplete(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = resolveUser(authHeader);
            if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));

            Long historyId = Long.valueOf(String.valueOf(body.get("historyId")));
            Optional<InterviewHistory> opt = historyRepo.findById(historyId);
            if (opt.isEmpty() || !opt.get().getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Not found"));
            }
            InterviewHistory h = opt.get();
            if ("COMPLETED".equals(h.getStatus())) {
                return ResponseEntity.ok(Map.of("message", "Already completed"));
            }
            h.setStatus("INCOMPLETE");
            h.setAnswersJson(toJson(body.get("answers")));

            // Retrieve current balance for credit safety log
            UserCredits uc = userCreditsRepository.findByUserId(user.getId()).orElse(null);
            int balance = uc != null ? uc.getCredits() : 100;
            if (h.getCreditsBefore() == null) {
                h.setCreditsBefore(balance);
            }
            h.setCreditsAfter(h.getCreditsBefore());
            h.setInterviewCost(0); // 0 deduction for incomplete

            historyRepo.save(h);
            return ResponseEntity.ok(Map.of("message", "Marked as incomplete"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ─── POST /api/auth/history/failed ───────────────────────────────────
    /** Called when interview fails/crashes. Marks as FAILED. */
    @PostMapping("/failed")
    public ResponseEntity<?> markFailed(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = resolveUser(authHeader);
            if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));

            Long historyId = Long.valueOf(String.valueOf(body.get("historyId")));
            Optional<InterviewHistory> opt = historyRepo.findById(historyId);
            if (opt.isEmpty() || !opt.get().getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Not found"));
            }
            InterviewHistory h = opt.get();
            if ("COMPLETED".equals(h.getStatus())) {
                return ResponseEntity.ok(Map.of("message", "Already completed"));
            }
            h.setStatus("FAILED");

            // Retrieve current balance for credit safety log
            UserCredits uc = userCreditsRepository.findByUserId(user.getId()).orElse(null);
            int balance = uc != null ? uc.getCredits() : 100;
            if (h.getCreditsBefore() == null) {
                h.setCreditsBefore(balance);
            }
            h.setCreditsAfter(h.getCreditsBefore());
            h.setInterviewCost(0); // 0 deduction for failed

            historyRepo.save(h);
            return ResponseEntity.ok(Map.of("message", "Marked as failed"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ─── GET /api/auth/history ────────────────────────────────────────────
    /** Return all interviews for the current user, newest first. */
    @GetMapping
    public ResponseEntity<?> getHistory(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = resolveUser(authHeader);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            List<InterviewHistory> records = historyRepo.findByUserIdOrderByCreatedAtDesc(user.getId());
            List<Map<String, Object>> result = new ArrayList<>();

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

            for (InterviewHistory h : records) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", h.getId());
                item.put("candidateName", h.getCandidateName());
                item.put("resumeName", h.getResumeName());
                item.put("role", h.getRole());
                item.put("interviewType", h.getInterviewType());
                item.put("status", h.getStatus());
                item.put("overallScore", h.getOverallScore());
                item.put("technicalScore", h.getTechnicalScore());
                item.put("communicationScore", h.getCommunicationScore());
                item.put("confidenceScore", h.getConfidenceScore());
                item.put("problemSolvingScore", h.getProblemSolvingScore());
                item.put("createdAt", h.getCreatedAt() != null ? h.getCreatedAt().format(fmt) : null);
                item.put("completedAt", h.getCompletedAt() != null ? h.getCompletedAt().format(fmt) : null);
                item.put("pdfPath", h.getPdfPath());
                item.put("creditsBefore", h.getCreditsBefore());
                item.put("creditsAfter", h.getCreditsAfter());
                item.put("interviewCost", h.getInterviewCost());
                // Lightweight list – detailed Q&A loaded separately
                result.add(item);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Failed to fetch history: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── GET /api/auth/history/{id} ──────────────────────────────────────
    /** Return full detail for one interview including Q&A JSON. */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDetail(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = resolveUser(authHeader);
            if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));

            Optional<InterviewHistory> opt = historyRepo.findById(id);
            if (opt.isEmpty() || !opt.get().getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Not found"));
            }

            InterviewHistory h = opt.get();
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("id", h.getId());
            detail.put("candidateName", h.getCandidateName());
            detail.put("resumeName", h.getResumeName());
            detail.put("role", h.getRole());
            detail.put("interviewType", h.getInterviewType());
            detail.put("status", h.getStatus());
            detail.put("overallScore", h.getOverallScore());
            detail.put("technicalScore", h.getTechnicalScore());
            detail.put("communicationScore", h.getCommunicationScore());
            detail.put("confidenceScore", h.getConfidenceScore());
            detail.put("problemSolvingScore", h.getProblemSolvingScore());
            detail.put("createdAt", h.getCreatedAt() != null ? h.getCreatedAt().format(fmt) : null);
            detail.put("completedAt", h.getCompletedAt() != null ? h.getCompletedAt().format(fmt) : null);
            detail.put("pdfPath", h.getPdfPath());
            detail.put("creditsBefore", h.getCreditsBefore());
            detail.put("creditsAfter", h.getCreditsAfter());
            detail.put("interviewCost", h.getInterviewCost());
 
            // Parse JSON arrays back to objects for frontend
            detail.put("questions", parseJsonArray(h.getQuestionsJson()));
            detail.put("answers", parseJsonArray(h.getAnswersJson()));
            detail.put("questionReports", parseJsonArray(h.getFeedbackJson()));
            detail.put("strengths", parseJsonArray(h.getStrengthsJson()));
            detail.put("weaknesses", parseJsonArray(h.getWeaknessesJson()));
            detail.put("improvements", parseJsonArray(h.getImprovementsJson()));
            detail.put("resumeSkills", parseJsonArray(h.getResumeSkillsJson()));
            detail.put("resumeProjects", parseJsonArray(h.getResumeProjectsJson()));

            return ResponseEntity.ok(detail);
        } catch (Exception e) {
            logger.error("Failed to fetch history detail: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────
    private String toJson(Object obj) {
        if (obj == null) return "[]";
        try { return MAPPER.writeValueAsString(obj); }
        catch (Exception e) { return "[]"; }
    }

    private Double toDouble(Object val) {
        if (val == null) return null;
        try { return Double.parseDouble(String.valueOf(val)); }
        catch (Exception e) { return null; }
    }

    @SuppressWarnings("unchecked")
    private List<Object> parseJsonArray(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try { return MAPPER.readValue(json, List.class); }
        catch (Exception e) { return Collections.emptyList(); }
    }
}
