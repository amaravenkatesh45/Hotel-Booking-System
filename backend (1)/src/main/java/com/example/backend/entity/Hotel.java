package com.example.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hotels")
@Data
@NoArgsConstructor
public class Hotel {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;
  private String city;
  private String location;
  @Column(columnDefinition = "TEXT")
  private String description;
  private String imageUrl;
  private Integer rating;
  private String amenities;
  private Double minPrice;
  private String state;
  private Boolean featured;
}

