package com.example.backend.controllers;

import com.example.backend.models.Room;
import com.example.backend.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/rooms")
public class RoomController {
  
  @Autowired
  RoomRepository roomRepository;

  @GetMapping
  public ResponseEntity<?> getRooms(@RequestParam(required = false) Long hotelId) {
    if (hotelId != null) {
      return ResponseEntity.ok(roomRepository.findByHotelId(hotelId));
    }
    return ResponseEntity.ok(roomRepository.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> getRoomById(@PathVariable Long id) {
    return roomRepository.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }
}

