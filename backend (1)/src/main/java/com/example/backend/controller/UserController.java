package com.example.backend.controller;

import com.example.backend.entity.Booking;
import com.example.backend.entity.Payment;
import com.example.backend.entity.User;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*") // Allows requests from Vite frontend
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    // Helper method to simulate a logged-in user
    // In a real app with Spring Security, you would get this from SecurityContextHolder
    private User getCurrentUser() {
        // Just fetching the first user as a mock for the logged-in user
        // Ensure you have at least one user in the DB
        return userRepository.findAll().stream().findFirst().orElse(null);
    }

    // GET /api/user/me — view own profile
    @GetMapping("/me")
    public ResponseEntity<?> getProfile() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        return ResponseEntity.ok(user);
    }

    // POST /api/user/bookings — create a booking
    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@RequestBody Booking bookingRequest) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body("User not authenticated");

        bookingRequest.setUser(user);
        bookingRequest.setStatus("PENDING");
        Booking savedBooking = bookingRepository.save(bookingRequest);
        return ResponseEntity.ok(savedBooking);
    }

    // PUT /api/user/bookings/{id}/cancel — cancel booking
    @PutMapping("/bookings/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body("User not authenticated");

        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            if (!booking.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("You can only cancel your own bookings");
            }
            booking.setStatus("CANCELLED");
            bookingRepository.save(booking);
            return ResponseEntity.ok("Booking cancelled successfully");
        }
        return ResponseEntity.notFound().build();
    }

    // POST /api/user/payments — process payment
    @PostMapping("/payments")
    public ResponseEntity<?> processPayment(@RequestBody Payment paymentRequest) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body("User not authenticated");

        Optional<Booking> bookingOpt = bookingRepository.findById(paymentRequest.getBooking().getId());
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            
            // Process payment
            paymentRequest.setUser(user);
            paymentRequest.setPaymentDate(LocalDateTime.now());
            paymentRequest.setStatus("SUCCESS");
            
            // Update booking status
            booking.setStatus("CONFIRMED");
            bookingRepository.save(booking);

            // Add loyalty points
            int earnedPoints = (int) (paymentRequest.getAmount() / 10); // 1 point per $10
            user.setLoyaltyPoints(user.getLoyaltyPoints() + earnedPoints);
            userRepository.save(user);

            Payment savedPayment = paymentRepository.save(paymentRequest);
            return ResponseEntity.ok(savedPayment);
        }
        return ResponseEntity.badRequest().body("Invalid booking ID");
    }

    // GET /api/user/points — view loyalty points
    @GetMapping("/points")
    public ResponseEntity<?> getLoyaltyPoints() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body("User not authenticated");
        
        return ResponseEntity.ok("{\"loyaltyPoints\": " + user.getLoyaltyPoints() + "}");
    }

    // POST /api/user/points/redeem — redeem loyalty points
    @PostMapping("/points/redeem")
    public ResponseEntity<?> redeemPoints(@RequestBody RedeemRequest request) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body("User not authenticated");

        if (user.getLoyaltyPoints() >= request.getPoints()) {
            user.setLoyaltyPoints(user.getLoyaltyPoints() - request.getPoints());
            userRepository.save(user);
            return ResponseEntity.ok("{\"message\": \"Points redeemed successfully\", \"remainingPoints\": " + user.getLoyaltyPoints() + "}");
        }
        return ResponseEntity.badRequest().body("Insufficient points");
    }
}

class RedeemRequest {
    private int points;
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
}
