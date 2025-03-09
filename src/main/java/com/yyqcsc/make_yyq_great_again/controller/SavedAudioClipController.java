package com.yyqcsc.make_yyq_great_again.controller;

import com.yyqcsc.make_yyq_great_again.model.SavedAudioClip;
import com.yyqcsc.make_yyq_great_again.model.WordReview;
import com.yyqcsc.make_yyq_great_again.repository.SavedAudioClipRepository;
import com.yyqcsc.make_yyq_great_again.repository.WordReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/savedAudioClips")
public class SavedAudioClipController {

    @Autowired
    SavedAudioClipRepository audioClipRepository;
    @Autowired
    WordReviewRepository wordReviewRepository;

    @GetMapping
    public List<SavedAudioClip> audioClips(@RequestParam(required = false) String title) {
        if (title != null) {
            return audioClipRepository.findByTitleContainingOrderByIdAsc(title);
        } else {
            return audioClipRepository.findAllByOrderByIdAsc();
        }
    }

    @PostMapping("")
    public ResponseEntity<SavedAudioClip> addAudioClip(@RequestBody SavedAudioClip savedAudioClip) {
        return new ResponseEntity<>(audioClipRepository.save(savedAudioClip), HttpStatus.CREATED);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<SavedAudioClip>> batchAddAudioClip(@RequestBody List<SavedAudioClip> savedAudioClipList) {
        List<SavedAudioClip> savedAudioClips = audioClipRepository.saveAll(savedAudioClipList);
        saveWordReview(savedAudioClips);
        return new ResponseEntity<>(savedAudioClips, HttpStatus.CREATED);
    }

    private void saveWordReview(List<SavedAudioClip> savedAudioClips) {
        List<WordReview> saveWordReviewList = savedAudioClips.stream()
                .flatMap(savedAudioClip -> {
                    List<WordReview> wordReviewList = new ArrayList<>();
                    // build word review
                    if (StringUtils.hasText(savedAudioClip.getWord())) {
                        WordReview wordReview = WordReview.builder()
                                .title(savedAudioClip.getTitle())
                                .word(savedAudioClip.getWord())
                                .type("单词")
                                .business("听力")
                                .result("没记住")
                                .build();
                        wordReviewList.add(wordReview);
                    }
                    if (StringUtils.hasText(savedAudioClip.getPhrase())) {
                        WordReview wordReview = WordReview.builder()
                                .title(savedAudioClip.getTitle())
                                .word(savedAudioClip.getPhrase())
                                .type("短语")
                                .business("听力")
                                .result("没记住")
                                .build();
                        wordReviewList.add(wordReview);
                    }
                    return wordReviewList.stream();
                }).toList();
        wordReviewRepository.saveAll(saveWordReviewList);
    }
}
