package com.interviewiq.controller;

import com.interviewiq.service.GeminiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class InterviewEvaluationController {

    private static final Logger logger = LoggerFactory.getLogger(InterviewEvaluationController.class);

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/evaluate-interview")
    public ResponseEntity<?> evaluateInterview(@RequestBody Map<String, Object> request) {
        try {
            String role = (String) request.getOrDefault("role", "Software Engineer");
            String interviewType = (String) request.getOrDefault("interviewType", "technical");

            @SuppressWarnings("unchecked")
            List<String> questions = (List<String>) request.get("questions");

            @SuppressWarnings("unchecked")
            List<String> answers = (List<String>) request.get("answers");

            if (questions == null || answers == null || questions.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Questions and answers are required for evaluation."));
            }

            logger.info("Evaluating interview | Role: {} | Type: {} | Questions: {}",
                    role, interviewType, questions.size());

            String evaluationJson = geminiService.evaluateInterview(role, interviewType, questions, answers);

            logger.info("Interview evaluation complete.");

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(evaluationJson);

        } catch (Exception e) {
            logger.error("Interview evaluation failed: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Evaluation failed: " + e.getMessage()));
        }
    }
}
