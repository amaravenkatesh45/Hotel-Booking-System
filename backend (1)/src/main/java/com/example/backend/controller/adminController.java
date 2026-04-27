package com.example.backend.controllers;

import com.example.backend.models.Booking;
import com.example.backend.models.Hotel;
import com.example.backend.models.Room;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.HotelRepository;
import com.example.backend.repository.RoomRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

  @Autowired UserRepository userRepository;
  @Autowired HotelRepository hotelRepository;
  @Autowired RoomRepository roomRepository;
  @Autowired BookingRepository bookingRepository;

  // ─── USER MANAGEMENT ────────────────────────────────────────────────────────

  @GetMapping("/users")
  public ResponseEntity<?> getAllUsers() {
    return ResponseEntity.ok(userRepository.findAll());
  }

  @GetMapping("/users/{id}")
  public ResponseEntity<?> getUserById(@PathVariable Long id) {
    return userRepository.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @DeleteMapping("/users/{id}")
  public ResponseEntity<?> deleteUser(@PathVariable Long id) {
    userRepository.deleteById(id);
    return ResponseEntity.ok().build();
  }

  // ─── HOTEL MANAGEMENT ───────────────────────────────────────────────────────

  @GetMapping("/hotels")
  public ResponseEntity<?> getAllHotels() {
    return ResponseEntity.ok(hotelRepository.findAll());
  }

  @PostMapping("/hotels")
  public ResponseEntity<?> createHotel(@RequestBody Hotel hotel) {
    return ResponseEntity.ok(hotelRepository.save(hotel));
  }

  @PutMapping("/hotels/{id}")
  public ResponseEntity<?> updateHotel(@PathVariable Long id, @RequestBody Hotel hotel) {
    hotel.setId(id);
    return ResponseEntity.ok(hotelRepository.save(hotel));
  }

  @DeleteMapping("/hotels/{id}")
  public ResponseEntity<?> deleteHotel(@PathVariable Long id) {
    hotelRepository.deleteById(id);
    return ResponseEntity.ok().build();
  }

  // ─── ROOM MANAGEMENT ────────────────────────────────────────────────────────

  @PostMapping("/rooms")
  public ResponseEntity<?> createRoom(@RequestBody Room room) {
    return ResponseEntity.ok(roomRepository.save(room));
  }

  @PutMapping("/rooms/{id}")
  public ResponseEntity<?> updateRoom(@PathVariable Long id, @RequestBody Room room) {
    return roomRepository.findById(id).map(existing -> {
      existing.setName(room.getName());
      existing.setType(room.getType());
      existing.setDescription(room.getDescription());
      existing.setAmenities(room.getAmenities());
      existing.setPrice(room.getPrice());
      existing.setCapacity(room.getCapacity());
      existing.setImageUrl(room.getImageUrl());
      if (room.getAvailable() != null) existing.setAvailable(room.getAvailable());
      return ResponseEntity.ok(roomRepository.save(existing));
    }).orElse(ResponseEntity.notFound().build());
  }

  @DeleteMapping("/rooms/{id}")
  public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
    roomRepository.deleteById(id);
    return ResponseEntity.ok().build();
  }

  // ─── BOOKING MANAGEMENT ─────────────────────────────────────────────────────

  @GetMapping("/bookings")
  public ResponseEntity<?> getAllBookings() {
    List<Booking> bookings = bookingRepository.findAll().stream().map(booking -> {
      if (booking.getHotelId() != null)
        hotelRepository.findById(booking.getHotelId()).ifPresent(booking::setHotelObj);
      if (booking.getRoomId() != null)
        roomRepository.findById(booking.getRoomId()).ifPresent(booking::setRoomObj);
      if (booking.getUserId() != null)
        userRepository.findById(booking.getUserId()).ifPresent(booking::setUserObj);
      return booking;
    }).collect(Collectors.toList());
    return ResponseEntity.ok(bookings);
  }

  @PutMapping("/bookings/{id}")
  public ResponseEntity<?> updateBookingStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
    return bookingRepository.findById(id).map(booking -> {
      if (payload.containsKey("status")) booking.setStatus(payload.get("status"));
      if (payload.containsKey("paymentStatus")) booking.setPaymentStatus(payload.get("paymentStatus"));
      return ResponseEntity.ok(bookingRepository.save(booking));
    }).orElse(ResponseEntity.notFound().build());
  }

  @DeleteMapping("/bookings/{id}")
  public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
    return bookingRepository.findById(id).map(booking -> {
      booking.setStatus("CANCELLED");
      bookingRepository.save(booking);
      return ResponseEntity.ok().build();
    }).orElse(ResponseEntity.notFound().build());
  }

  // ─── DASHBOARD STATS ────────────────────────────────────────────────────────

  @GetMapping("/stats")
  public ResponseEntity<?> getStats() {
    Map<String, Object> stats = new HashMap<>();
    stats.put("totalUsers", userRepository.count());
    stats.put("totalHotels", hotelRepository.count());
    stats.put("totalBookings", bookingRepository.count());

    List<Booking> allBookings = bookingRepository.findAll();
    double totalRevenue = allBookings.stream()
        .filter(b -> "PAID".equals(b.getPaymentStatus()))
        .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0)
        .sum();
    stats.put("totalRevenue", totalRevenue);

    // Monthly revenue for chart (last 6 months)
    Map<String, Double> monthlyMap = new LinkedHashMap<>();
    LocalDate now = LocalDate.now();
    for (int i = 5; i >= 0; i--) {
      LocalDate month = now.minusMonths(i);
      String label = month.getMonth().getDisplayName(TextStyle.SHORT, java.util.Locale.ENGLISH)
          + " " + month.getYear();
      monthlyMap.put(label, 0.0);
    }
    allBookings.stream()
        .filter(b -> "PAID".equals(b.getPaymentStatus()) && b.getCheckInDate() != null)
        .forEach(b -> {
          LocalDate d = b.getCheckInDate();
          String label = d.getMonth().getDisplayName(TextStyle.SHORT, java.util.Locale.ENGLISH)
              + " " + d.getYear();
          if (monthlyMap.containsKey(label)) {
            monthlyMap.merge(label, b.getTotalPrice() != null ? b.getTotalPrice() : 0, Double::sum);
          }
        });

    List<Map<String, Object>> monthlyRevenue = monthlyMap.entrySet().stream()
        .map(e -> { Map<String, Object> m = new HashMap<>(); m.put("month", e.getKey()); m.put("revenue", e.getValue()); return m; })
        .collect(Collectors.toList());
    stats.put("monthlyRevenue", monthlyRevenue);

    // Recent 5 bookings
    List<Booking> recent = allBookings.stream()
        .sorted(Comparator.comparingLong(Booking::getId).reversed())
        .limit(5)
        .map(booking -> {
          if (booking.getHotelId() != null)
            hotelRepository.findById(booking.getHotelId()).ifPresent(booking::setHotelObj);
          if (booking.getUserId() != null)
            userRepository.findById(booking.getUserId()).ifPresent(booking::setUserObj);
          return booking;
        })
        .collect(Collectors.toList());
    stats.put("recentBookings", recent);

    return ResponseEntity.ok(stats);
  }
}
