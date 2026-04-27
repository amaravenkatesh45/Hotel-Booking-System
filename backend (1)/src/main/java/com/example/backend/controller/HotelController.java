package com.example.backend.controllers;

import com.example.backend.models.Hotel;
import com.example.backend.repository.HotelRepository;
import com.example.backend.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/hotels")
public class HotelController {

  @Autowired
  HotelRepository hotelRepository;

  @Autowired
  RoomRepository roomRepository;

  @GetMapping
  public ResponseEntity<?> getAllHotels(
      @RequestParam(required = false) String city,
      @RequestParam(required = false) String search,
      @RequestParam(required = false) String type,
      @RequestParam(required = false) Double minPrice,
      @RequestParam(required = false) Double maxPrice) {

    List<Hotel> hotels = hotelRepository.findAll();

    if (city != null && !city.isEmpty() && !city.equalsIgnoreCase("all")) {
      hotels = hotels.stream()
          .filter(h -> h.getCity() != null && h.getCity().equalsIgnoreCase(city))
          .collect(Collectors.toList());
    }

    if (search != null && !search.isEmpty()) {
      String q = search.toLowerCase();
      hotels = hotels.stream()
          .filter(h -> h.getName().toLowerCase().contains(q) ||
              (h.getCity() != null && h.getCity().toLowerCase().contains(q)))
          .collect(Collectors.toList());
    }

    if (minPrice != null) {
      hotels = hotels.stream()
          .filter(h -> h.getMinPrice() != null && h.getMinPrice() >= minPrice)
          .collect(Collectors.toList());
    }

    if (maxPrice != null) {
      hotels = hotels.stream()
          .filter(h -> h.getMinPrice() != null && h.getMinPrice() <= maxPrice)
          .collect(Collectors.toList());
    }

    return ResponseEntity.ok(hotels);
  }

  @GetMapping("/featured")
  public ResponseEntity<?> getFeaturedHotels() {
    List<Hotel> hotels = hotelRepository.findAll();
    List<Hotel> featured = hotels.stream()
        .filter(h -> Boolean.TRUE.equals(h.getFeatured()))
        .limit(6)
        .collect(Collectors.toList());
    // fallback: if no featured flag set, return first 6
    if (featured.isEmpty()) {
      featured = hotels.stream().limit(6).collect(Collectors.toList());
    }
    return ResponseEntity.ok(featured);
  }

  @GetMapping("/cities")
  public ResponseEntity<?> getCities() {
    List<Hotel> hotels = hotelRepository.findAll();

    // Group by city and count
    Map<String, Long> cityCount = hotels.stream()
        .filter(h -> h.getCity() != null && !h.getCity().isEmpty())
        .collect(Collectors.groupingBy(Hotel::getCity, Collectors.counting()));

    List<Map<String, Object>> cities = cityCount.entrySet().stream()
        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
        .map(e -> {
          Map<String, Object> map = new HashMap<>();
          map.put("name", e.getKey());
          map.put("count", e.getValue());
          return map;
        })
        .collect(Collectors.toList());

    return ResponseEntity.ok(cities);
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> getHotelById(@PathVariable Long id) {
    return hotelRepository.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }
}
