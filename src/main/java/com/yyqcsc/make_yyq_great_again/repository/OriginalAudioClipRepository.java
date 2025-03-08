package com.yyqcsc.make_yyq_great_again.repository;

import com.yyqcsc.make_yyq_great_again.model.OriginalAudioClip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OriginalAudioClipRepository extends JpaRepository<OriginalAudioClip, Long> {
    List<OriginalAudioClip> findAllByOrderByIdAsc();

    List<OriginalAudioClip> findByTitleOrderByIdAsc(String title);

    List<OriginalAudioClip> findByTitleContainingOrderByIdAsc(String title);

}
