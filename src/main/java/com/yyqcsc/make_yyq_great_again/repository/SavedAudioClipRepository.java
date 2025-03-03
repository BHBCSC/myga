package com.yyqcsc.make_yyq_great_again.repository;

import com.yyqcsc.make_yyq_great_again.model.SavedAudioClip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedAudioClipRepository extends JpaRepository<SavedAudioClip, Long> {
    List<SavedAudioClip> findAllByOrderById();

    List<SavedAudioClip> findByTitle(String title);
}
