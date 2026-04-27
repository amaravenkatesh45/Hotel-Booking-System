package com.example.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
public class Room {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;
  @Column(name = "room_type")
  private String type;
  private String description;
  private String amenities;
  private Double price;
  private Integer capacity;
  private String imageUrl;

  @Column(name = "is_available")
  private Boolean available;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "hotel_id", nullable = false)
  @JsonIgnore
  private Hotel hotel;

  @Column(name = "hotel_id", insertable = false, updatable = false)
  private Long hotelId;
}

