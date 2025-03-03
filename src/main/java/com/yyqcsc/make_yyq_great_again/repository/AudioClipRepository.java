package com.yyqcsc.make_yyq_great_again.repository;

import com.yyqcsc.make_yyq_great_again.model.AudioClip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AudioClipRepository extends JpaRepository<AudioClip, Long> {
    List<AudioClip> findAllByOrderById();

    List<AudioClip> findByTitle(String title);
}
