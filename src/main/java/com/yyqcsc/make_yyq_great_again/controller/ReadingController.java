package com.yyqcsc.make_yyq_great_again.controller;

import com.yyqcsc.make_yyq_great_again.model.Reading;
import com.yyqcsc.make_yyq_great_again.repository.ReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/reading")
public class ReadingController {

    @Autowired
    ReadingRepository readingRepository;

    @GetMapping("")
    public List<Reading> getList(@RequestParam String title, @RequestParam(required = false) String smallTitle) {
        return readingRepository.findAllByTitleAndSmallTittle(title, smallTitle);
    }
}
