package com.interviewiq.controller;

import com.interviewiq.service.GeminiService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class ResumeController {

    private static final Logger logger = LoggerFactory.getLogger(ResumeController.class);

    @Autowired
    private GeminiService geminiService;

    @PostMapping(value = "/parse-resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> parseResume(@RequestParam("file") MultipartFile file) {
        logger.info("Resume Uploaded Successfully");
        
        try {
            if (file.isEmpty()) {
                logger.error("Uploaded file is empty");
                return ResponseEntity.badRequest().body(Map.of("error", "Uploaded file is empty"));
            }

            String extractedText = extractTextFromMultipartFile(file);
            
            logger.info("\n------------------\nExtracted Resume Text:\n{}\n------------------\n", extractedText);

            if (extractedText.trim().isEmpty()) {
                logger.error("No readable text could be extracted from the file");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Resume parsing failed. No readable text found."));
            }

            // Call Gemini service to perform deep parsing
            String parsedJsonResponse = geminiService.analyzeResume(extractedText);
            
            // Extract and print dynamic lists for required debugging logs
            logExtractedLists(parsedJsonResponse);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(parsedJsonResponse);

        } catch (Exception e) {
            logger.error("Error during resume parsing: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Resume parsing failed: " + e.getMessage()));
        }
    }

    private String extractTextFromMultipartFile(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IllegalArgumentException("Filename cannot be null");
        }
        
        try (InputStream inputStream = file.getInputStream()) {
            if (filename.toLowerCase().endsWith(".pdf")) {
                try (PDDocument document = PDDocument.load(inputStream)) {
                    PDFTextStripper pdfStripper = new PDFTextStripper();
                    return pdfStripper.getText(document);
                }
            } else if (filename.toLowerCase().endsWith(".docx")) {
                try (XWPFDocument doc = new XWPFDocument(inputStream)) {
                    try (XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                        return extractor.getText();
                    }
                }
            } else if (filename.toLowerCase().endsWith(".txt")) {
                return new String(file.getBytes(), StandardCharsets.UTF_8);
            } else {
                throw new IllegalArgumentException("Unsupported file format: " + filename);
            }
        }
    }

    private void logExtractedLists(String jsonResponse) {
        try {
            // Find and log Skills Extracted
            String skillsToken = "\"skills\":";
            int skillsIdx = jsonResponse.indexOf(skillsToken);
            if (skillsIdx != -1) {
                int startBracket = jsonResponse.indexOf("[", skillsIdx);
                int endBracket = jsonResponse.indexOf("]", startBracket);
                if (startBracket != -1 && endBracket != -1) {
                    String skillsList = jsonResponse.substring(startBracket, endBracket + 1);
                    logger.info("Skills Extracted: {}", skillsList);
                }
            }

            // Find and log Projects Extracted
            String projectsToken = "\"projects\":";
            int projectsIdx = jsonResponse.indexOf(projectsToken);
            if (projectsIdx != -1) {
                int startBracket = jsonResponse.indexOf("[", projectsIdx);
                int endBracket = jsonResponse.indexOf("]", startBracket);
                if (startBracket != -1 && endBracket != -1) {
                    String projectsList = jsonResponse.substring(startBracket, endBracket + 1);
                    logger.info("Projects Extracted: {}", projectsList);
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to parse array lists for logging: {}", e.getMessage());
        }
    }
}
