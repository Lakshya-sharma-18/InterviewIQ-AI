package com.interviewiq.controller;

import com.interviewiq.dto.*;
import com.interviewiq.model.User;
import com.interviewiq.model.UserCredits;
import com.interviewiq.model.CreditTransaction;
import com.interviewiq.repository.UserRepository;
import com.interviewiq.repository.UserCreditsRepository;
import com.interviewiq.repository.CreditTransactionRepository;
import com.interviewiq.security.JwtTokenProvider;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserCreditsRepository userCreditsRepository;

    @Autowired
    private CreditTransactionRepository creditTransactionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already taken!"));
        }

        User user = new User();
        user.setFullName(signUpRequest.getFullName());
        user.setEmail(signUpRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setRole("USER");
        user.setCredits(100);

        User savedUser = userRepository.save(user);

        // Initialize UserCredits record with 100 credits
        UserCredits userCredits = new UserCredits();
        userCredits.setUserId(savedUser.getId());
        userCredits.setCredits(100);
        userCreditsRepository.save(userCredits);

        // Log SIGNUP_BONUS transaction in CreditTransaction
        CreditTransaction transaction = new CreditTransaction();
        transaction.setUserId(savedUser.getId());
        transaction.setType("SIGNUP_BONUS");
        transaction.setAmount(100);
        transaction.setBalanceAfter(100);
        creditTransactionRepository.save(transaction);

        logger.info("New user registered with 100 bonus credits: {}", user.getEmail());

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow();
        String jwt = tokenProvider.generateToken(user.getEmail(), user.getFullName(), user.getProfileImage());
        
        logger.info("User logged in: {}", user.getEmail());

        Map<String, String> response = new HashMap<>();
        response.put("token", jwt);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        userRepository.save(user);

        logger.info("\n\n=======================================================");
        logger.info("PASSWORD RESET REQUESTED FOR: {}", user.getEmail());
        logger.info("RESET TOKEN: {}", token);
        logger.info("=======================================================\n\n");

        return ResponseEntity.ok(Map.of("message", "Reset token generated and logged to console"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        Optional<User> userOpt = userRepository.findAll().stream()
                .filter(u -> request.getToken().equals(u.getResetToken()))
                .findFirst();

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired token"));
        }

        User user = userOpt.get();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        userRepository.save(user);

        logger.info("Password reset successful for user: {}", user.getEmail());

        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @GetMapping("/credits")
    public ResponseEntity<?> getCredits(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = resolveUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        UserCredits uc = userCreditsRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserCredits newUc = new UserCredits();
                    newUc.setUserId(user.getId());
                    newUc.setCredits(user.getCredits() != null ? user.getCredits() : 100);
                    return userCreditsRepository.save(newUc);
                });

        return ResponseEntity.ok(Map.of("credits", uc.getCredits()));
    }

    @PostMapping("/credits/purchase")
    public ResponseEntity<?> purchaseCredits(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = resolveUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        Integer amount = Integer.valueOf(String.valueOf(body.get("amount"))); // e.g. 150 or 650
        
        UserCredits uc = userCreditsRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserCredits newUc = new UserCredits();
                    newUc.setUserId(user.getId());
                    newUc.setCredits(100);
                    return userCreditsRepository.save(newUc);
                });

        int newBalance = uc.getCredits() + amount;
        uc.setCredits(newBalance);
        userCreditsRepository.save(uc);

        // Sync with User entity credits
        user.setCredits(newBalance);
        userRepository.save(user);

        // Log transaction
        CreditTransaction transaction = new CreditTransaction();
        transaction.setUserId(user.getId());
        transaction.setType("PURCHASE");
        transaction.setAmount(amount);
        transaction.setBalanceAfter(newBalance);
        creditTransactionRepository.save(transaction);

        logger.info("Credits purchased: userId={} amount={} newBalance={}", user.getId(), amount, newBalance);

        return ResponseEntity.ok(Map.of("credits", newBalance));
    }

    // Helper resolveUser
    private User resolveUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (!tokenProvider.validateToken(token)) return null;
        String email = tokenProvider.getEmailFromToken(token);
        return userRepository.findByEmail(email).orElse(null);
    }
}
