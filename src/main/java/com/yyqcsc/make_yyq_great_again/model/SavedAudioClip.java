package com.yyqcsc.make_yyq_great_again.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedAudioClip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    @Column(name = "point_a")
    private BigDecimal pointA;
    @Column(name = "point_b")
    private BigDecimal pointB;
    private String word;
    private String phrase;
    private String text;
    private String dataTranslation;
    private Boolean deleted = false;
}