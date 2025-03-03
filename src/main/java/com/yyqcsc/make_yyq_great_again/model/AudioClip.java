package com.yyqcsc.make_yyq_great_again.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Data
public class AudioClip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private BigDecimal aPoint;
    private BigDecimal bPoint;
    private String word;
    private String phrase;
    private String text;
    private String dataTranslation;
    private Boolean deleted;

}