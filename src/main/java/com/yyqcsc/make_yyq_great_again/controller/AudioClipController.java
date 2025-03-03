package com.yyqcsc.make_yyq_great_again.controller;

import com.yyqcsc.make_yyq_great_again.model.AudioClip;
import com.yyqcsc.make_yyq_great_again.repository.AudioClipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/audio-clips")
public class AudioClipController {

    @Autowired
    AudioClipRepository audioClipRepository;

    @GetMapping("")
    public List<AudioClip> audioClips() {
        List<AudioClip> allByOrderById = audioClipRepository.findAllByOrderById();
        allByOrderById.get(0).getId();
        return allByOrderById;
    }

    @GetMapping("/title/{title}")
    public List<AudioClip> getAudioClipsByTitle(@PathVariable String title) {
        // 调用Repository中的方法，根据title查找对应的AudioClip对象列表
        List<AudioClip> audioClipsByTitle = audioClipRepository.findByTitle(title);
        return audioClipsByTitle;
    }
}
