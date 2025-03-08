package com.yyqcsc.make_yyq_great_again.controller;

import com.yyqcsc.make_yyq_great_again.model.WordReview;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Timestamp;

@RestController
public class WordReviewController {

    @GetMapping("/list")
    public String list(String business, String type, String word, String result, String fuzzyWord, String fuzzyTitle, Timestamp reviewBegin, Timestamp reviewEnd) {
        return "";
    }
}
