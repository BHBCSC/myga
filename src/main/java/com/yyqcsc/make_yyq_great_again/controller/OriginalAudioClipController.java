package com.yyqcsc.make_yyq_great_again.controller;

import com.yyqcsc.make_yyq_great_again.model.OriginalAudioClip;
import com.yyqcsc.make_yyq_great_again.repository.OriginalAudioClipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/originalAudioClips")
public class OriginalAudioClipController {

    @Autowired
    OriginalAudioClipRepository originalAudioClipRepository;

    @GetMapping("")
    public List<OriginalAudioClip> audioClips(@RequestParam(required = false) String title) {
        if (title != null) {
            return originalAudioClipRepository.findByTitle(title);
        } else {
            return originalAudioClipRepository.findAllByOrderById();
        }
    }
}
