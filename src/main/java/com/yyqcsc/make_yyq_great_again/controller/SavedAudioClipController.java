package com.yyqcsc.make_yyq_great_again.controller;

import com.yyqcsc.make_yyq_great_again.model.SavedAudioClip;
import com.yyqcsc.make_yyq_great_again.repository.SavedAudioClipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/savedAudioClips")
public class SavedAudioClipController {

    @Autowired
    SavedAudioClipRepository audioClipRepository;

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
        return new ResponseEntity<>(audioClipRepository.saveAll(savedAudioClipList), HttpStatus.CREATED);
    }
}
